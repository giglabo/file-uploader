/**
 * Client IP resolution for requests that reach the app through
 * Cloudflare -> Hetzner LB -> Traefik (-> optional in-pod nginx).
 *
 * Only Cloudflare can reach the origin, so `CF-Connecting-IP` is trustworthy.
 * `X-Real-IP` is set by Traefik to its peer (a Cloudflare edge IP) and the
 * socket address is the Traefik pod, so both are only last-resort fallbacks.
 *
 * The header priority is configurable with the server-side env var
 * `CLIENT_IP_HEADERS` (comma-separated, case-insensitive). Default:
 * `cf-connecting-ip,x-forwarded-for,x-real-ip`. For every header only the
 * first comma-separated entry is used (for X-Forwarded-For that is the
 * original client). The socket address is always the final fallback.
 *
 * Kept free of Node-only imports so it is safe in Edge and client bundles.
 */

export const DEFAULT_CLIENT_IP_HEADERS: readonly string[] = ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'];

type HeaderGetter = { get(name: string): string | null | undefined };
type HeaderRecord = Record<string, string | string[] | undefined>;

export type ClientIpRequest = {
  headers?: HeaderGetter | HeaderRecord | null;
  socket?: { remoteAddress?: string | null } | null;
};

let cachedRaw: string | undefined;
let cachedHeaders: readonly string[] = DEFAULT_CLIENT_IP_HEADERS;

const readEnv = (): string | undefined => (typeof process !== 'undefined' ? process.env?.CLIENT_IP_HEADERS : undefined);

/** Header names in priority order, from `CLIENT_IP_HEADERS` or the default. */
export const getClientIpHeaders = (raw: string | undefined = readEnv()): readonly string[] => {
  if (raw === cachedRaw) {
    return cachedHeaders;
  }
  const parsed = (raw ?? '')
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0);
  cachedRaw = raw;
  cachedHeaders = parsed.length > 0 ? parsed : DEFAULT_CLIENT_IP_HEADERS;
  return cachedHeaders;
};

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export const isIPv4 = (value: string): boolean => IPV4.test(value);

export const isIPv6 = (value: string): boolean => {
  if (!value.includes(':') || !/^[0-9a-fA-F:.]+$/.test(value)) {
    return false;
  }
  try {
    // The WHATWG URL parser implements strict IPv6 parsing in every JS runtime.
    return new URL(`http://[${value}]/`).hostname.length > 0;
  } catch {
    return false;
  }
};

/**
 * Normalizes a single address candidate: trims, strips ports
 * (`1.2.3.4:5678`, `[2001:db8::1]:443`) and the IPv4-mapped `::ffff:` prefix.
 * Returns undefined for empty, "unknown" or anything that is not an IP.
 */
export const normalizeIp = (value: string | null | undefined): string | undefined => {
  let ip = (value ?? '').trim();
  if (!ip || ip.toLowerCase() === 'unknown') {
    return undefined;
  }

  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(ip);
  if (bracketed) {
    ip = bracketed[1] as string;
  } else {
    const v4WithPort = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(ip);
    if (v4WithPort) {
      ip = v4WithPort[1] as string;
    }
  }

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) {
    ip = mapped[1] as string;
  }

  return isIPv4(ip) || isIPv6(ip) ? ip : undefined;
};

const readHeader = (headers: ClientIpRequest['headers'], name: string): string | undefined => {
  if (!headers) {
    return undefined;
  }
  if (typeof (headers as HeaderGetter).get === 'function') {
    return (headers as HeaderGetter).get(name) ?? undefined;
  }
  // Plain object (Node IncomingMessage headers): keys are usually lower-case.
  const record = headers as HeaderRecord;
  let value = record[name];
  if (value === undefined) {
    const key = Object.keys(record).find((k) => k.toLowerCase() === name);
    value = key === undefined ? undefined : record[key];
  }
  return Array.isArray(value) ? value.join(',') : value;
};

/**
 * Resolves the visitor IP: first valid address from the configured headers
 * (first comma-separated entry of each), then the socket address.
 */
export const determineIp = (request: ClientIpRequest | null | undefined): string | undefined => {
  if (!request) {
    return undefined;
  }
  for (const name of getClientIpHeaders()) {
    const raw = readHeader(request.headers, name);
    if (raw) {
      const ip = normalizeIp(raw.split(',')[0]);
      if (ip) {
        return ip;
      }
    }
  }
  return normalizeIp(request.socket?.remoteAddress);
};
