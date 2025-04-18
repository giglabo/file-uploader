import pino from 'pino';
import { Env } from './Env';
import path from 'path';
import { URL } from 'url';
import { determineIp } from '@/utils/Helpers';

const defaultOpts = {
  singleLine: true,
  mkdir: true,
  hideObject: false,
  ignore: 'hostname',
  prettyPrint: true,
};

const targets = buildTransport();

export const logger = pino({
  browser: {
    asObject: true,
  },
  transport: {
    targets,
  },
  serializers: {
    res(reply) {
      return {
        statusCode: reply.statusCode,
        headers: whitelistHeaders(reply.getHeaders()),
      };
    },
    req(request) {
      return {
        method: request.method,
        url: redactQueryParamFromRequest(request, ['token']),
        headers: whitelistHeaders(request.headers),
        hostname: request.hostname,
        remoteAddress: determineIp(request),
        remotePort: request.socket?.remotePort,
      };
    },
  },
  level: Env.logLevel,
  // timestamp: pino.stdTimeFunctions.isoTime,
});

function buildTransport(): pino.TransportTargetOptions[] {
  // const { enableConsoleLog, logFolder, logLevel } = getConfig();

  const pinoPretty: pino.TransportTargetOptions = {
    target: 'pino-pretty',
    options: {
      timestampKey: 'time',
      singleLine: true,
      hideObject: false,
      ignore: 'hostname',
    },
    level: Env.logLevel,
  };

  const targets: pino.TransportTargetOptions[] = [
    {
      level: Env.logLevel,
      target: 'pino/file',
      options: {
        ...defaultOpts,
        destination: path.resolve(Env.logFolder, Env.logFile),
      },
    },
  ];
  const pattern = /^(true|1|yes)$/i;
  if (pattern.test(Env.logEnableConsole)) {
    targets.push(pinoPretty);
  }

  return targets;
}

const whitelistHeaders = (headers: Record<string, unknown>) => {
  const responseMetadata: Record<string, unknown> = {};
  const allowlistedRequestHeaders = [
    'accept',
    'cf-connecting-ip',
    'cf-ipcountry',
    'host',
    'user-agent',
    'x-forwarded-proto',
    'x-forwarded-host',
    'x-forwarded-port',
    'referer',
    'content-length',
    'x-real-ip',
    'x-client-info',
    'x-forwarded-user-agent',
    'x-client-trace-id',
    'x-upsert',
  ];
  const allowlistedResponseHeaders = [
    'cf-cache-status',
    'cf-ray',
    'content-location',
    'content-range',
    'content-type',
    'content-length',
    'date',
    'transfer-encoding',
    'x-kong-proxy-latency',
    'x-kong-upstream-latency',
    'sb-gateway-mode',
    'sb-gateway-version',
  ];
  Object.keys(headers)
    .filter((header) => allowlistedRequestHeaders.includes(header) || allowlistedResponseHeaders.includes(header))
    .forEach((header) => {
      responseMetadata[header.replace(/-/g, '_')] = headers[header];
    });

  return responseMetadata;
};

export function redactQueryParamFromRequest(req: Request, params: string[]) {
  const lUrl = new URL(req.url);

  params.forEach((param) => {
    if (lUrl.searchParams.has(param)) {
      lUrl.searchParams.set(param, 'redacted');
    }
  });
  return `${lUrl.pathname}${lUrl.search}`;
}
