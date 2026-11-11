import { determineIp, getClientIpHeaders, normalizeIp } from './ClientIp';

const req = (headers: Record<string, string>, remoteAddress?: string) => {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    socket: remoteAddress === undefined ? undefined : { remoteAddress },
  };
};

const VISITOR = '203.0.113.7';
const CF_EDGE = '172.70.1.2';

describe('ClientIp', () => {
  const original = process.env.CLIENT_IP_HEADERS;

  beforeEach(() => {
    delete process.env.CLIENT_IP_HEADERS;
  });

  afterAll(() => {
    if (original === undefined) {
      delete process.env.CLIENT_IP_HEADERS;
    } else {
      process.env.CLIENT_IP_HEADERS = original;
    }
  });

  describe('determineIp', () => {
    it('prefers cf-connecting-ip', () => {
      const r = req({
        'CF-Connecting-IP': VISITOR,
        'X-Forwarded-For': `198.51.100.1, ${CF_EDGE}`,
        'X-Real-IP': CF_EDGE,
      });

      expect(determineIp(r)).toBe(VISITOR);
    });

    it('uses the first x-forwarded-for entry when there is no CF header', () => {
      const r = req({ 'X-Forwarded-For': ` ${VISITOR} , ${CF_EDGE}`, 'X-Real-IP': CF_EDGE });

      expect(determineIp(r)).toBe(VISITOR);
    });

    it('uses the default order cf-connecting-ip > x-forwarded-for > x-real-ip when CLIENT_IP_HEADERS is unset', () => {
      const all = { 'CF-Connecting-IP': VISITOR, 'X-Forwarded-For': `198.51.100.1, ${CF_EDGE}`, 'X-Real-IP': CF_EDGE };

      expect(determineIp(req(all))).toBe(VISITOR);
      expect(determineIp(req({ 'X-Forwarded-For': all['X-Forwarded-For'], 'X-Real-IP': CF_EDGE }))).toBe('198.51.100.1');
      expect(determineIp(req({ 'X-Real-IP': CF_EDGE }, '10.42.0.5'))).toBe(CF_EDGE);
    });

    it.each(['', '   ', ' , ,'])('treats CLIENT_IP_HEADERS=%j as the default order', (value) => {
      process.env.CLIENT_IP_HEADERS = value;
      const r = req({ 'CF-Connecting-IP': VISITOR, 'X-Forwarded-For': `198.51.100.1, ${CF_EDGE}`, 'X-Real-IP': CF_EDGE });

      expect(determineIp(r)).toBe(VISITOR);
      expect(determineIp(req({ 'X-Real-IP': CF_EDGE }))).toBe(CF_EDGE);
    });

    it('falls back to the socket address', () => {
      expect(determineIp(req({}, '10.42.0.5'))).toBe('10.42.0.5');
      expect(determineIp(req({}, '::ffff:10.42.0.5'))).toBe('10.42.0.5');
      expect(determineIp(req({}))).toBeUndefined();
      expect(determineIp(undefined)).toBeUndefined();
    });

    it('skips invalid values (empty, "unknown", garbage) and tries the next source', () => {
      const r = req(
        {
          'CF-Connecting-IP': '  ',
          'X-Forwarded-For': `unknown, ${CF_EDGE}`,
          'X-Real-IP': 'not-an-ip',
        },
        VISITOR,
      );

      expect(determineIp(r)).toBe(VISITOR);
      expect(determineIp(req({ 'CF-Connecting-IP': '999.1.1.1', 'X-Real-IP': VISITOR }))).toBe(VISITOR);
    });

    it('ignores client-spoofable legacy headers', () => {
      expect(determineIp(req({ 'X-Client-IP': '1.1.1.1', 'True-Client-IP': '1.1.1.1' }, VISITOR))).toBe(VISITOR);
    });

    it('strips ports from IPv4 and bracketed IPv6', () => {
      expect(determineIp(req({ 'X-Forwarded-For': `${VISITOR}:5678` }))).toBe(VISITOR);
      expect(determineIp(req({ 'CF-Connecting-IP': '[2001:db8::1]:443' }))).toBe('2001:db8::1');
    });

    it('accepts plain IPv6 and Node-style plain header objects', () => {
      expect(determineIp(req({ 'CF-Connecting-IP': '2001:db8::abcd' }))).toBe('2001:db8::abcd');
      expect(
        determineIp({
          headers: { 'x-forwarded-for': [`${VISITOR}, ${CF_EDGE}`], 'x-real-ip': CF_EDGE },
          socket: { remoteAddress: '10.42.0.5' },
        }),
      ).toBe(VISITOR);
    });

    it('uses a custom order from the CLIENT_IP_HEADERS env var', () => {
      const r = req({ 'CF-Connecting-IP': VISITOR, 'X-Real-IP': CF_EDGE, 'X-Custom-IP': '198.51.100.9, 10.0.0.1' });

      process.env.CLIENT_IP_HEADERS = 'X-Real-IP, cf-connecting-ip';
      expect(determineIp(r)).toBe(CF_EDGE);

      process.env.CLIENT_IP_HEADERS = 'x-custom-ip';
      expect(determineIp(r)).toBe('198.51.100.9');

      process.env.CLIENT_IP_HEADERS = 'x-missing';
      expect(determineIp(req({ 'CF-Connecting-IP': VISITOR }, '10.42.0.5'))).toBe('10.42.0.5');
    });
  });

  describe('getClientIpHeaders', () => {
    it('defaults when unset or blank', () => {
      expect(getClientIpHeaders(undefined)).toEqual(['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip']);
      expect(getClientIpHeaders(' , ')).toEqual(['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip']);
    });

    it('lower-cases and trims names', () => {
      expect(getClientIpHeaders(' X-Real-IP ,CF-Connecting-IP')).toEqual(['x-real-ip', 'cf-connecting-ip']);
    });
  });

  describe('normalizeIp', () => {
    it.each([
      ['1.2.3.4', '1.2.3.4'],
      [' 1.2.3.4 ', '1.2.3.4'],
      ['1.2.3.4:80', '1.2.3.4'],
      ['[::1]', '::1'],
      ['[2001:db8::1]:8443', '2001:db8::1'],
      ['::FFFF:192.0.2.1', '192.0.2.1'],
      ['2001:db8::1', '2001:db8::1'],
    ])('%s -> %s', (input, expected) => {
      expect(normalizeIp(input)).toBe(expected);
    });

    it.each(['', 'unknown', 'UNKNOWN', '1.2.3', '256.1.1.1', '01.2.3.4', 'example.com', '2001:db8::g', ':::', 'fe80::1%eth0'])(
      'rejects %j',
      (input) => {
        expect(normalizeIp(input)).toBeUndefined();
      },
    );
  });
});
