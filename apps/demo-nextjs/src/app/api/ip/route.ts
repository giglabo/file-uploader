import { logger } from '@/libs/Logger';
import { determineIp } from '@/utils/Helpers';
import { Env } from '@/libs/Env';
import { NextResponse } from 'next/server';
import { urlJoin } from '@giglabo/shared';

export type Carrier = {
  name: string | null;
  mcc: string | null;
  mnc: string | null;
};

export type Company = {
  domain: string;
  name: string;
  type: string;
};

export type Connection = {
  asn: number;
  domain: string;
  organization: string;
  route: string;
  type: string;
};

export type CurrencyFormat = {
  negative: { prefix: string; suffix: string };
  positive: { prefix: string; suffix: string };
};

export type Currency = {
  code: string;
  name: string;
  name_native: string;
  plural: string;
  plural_native: string;
  symbol: string;
  symbol_native: string;
  format: CurrencyFormat;
};

export type Continent = {
  code: string;
  name: string;
};

export type Flag = {
  emoji: string;
  emoji_unicode: string;
  emojitwo: string;
  noto: string;
  twemoji: string;
  wikimedia: string;
};

export type Language = {
  code: string;
  name: string;
  native: string;
};

export type Country = {
  area: number;
  borders: string[];
  calling_code: string;
  capital: string;
  code: string;
  name: string;
  population: number;
  population_density: number;
  flag: Flag;
  languages: Language[];
  tld: string;
};

export type Region = {
  code: string;
  name: string;
};

export type Location = {
  continent: Continent;
  country: Country;
  region: Region;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  language: Language;
  in_eu: boolean;
};

export type Security = {
  is_abuser: boolean;
  is_attacker: boolean;
  is_bogon: boolean;
  is_cloud_provider: boolean;
  is_proxy: boolean;
  is_relay: boolean;
  is_tor: boolean;
  is_tor_exit: boolean;
  is_vpn: boolean;
  is_anonymous: boolean;
  is_threat: boolean;
};

export type TimeZone = {
  id: string;
  abbreviation: string;
  current_time: string;
  name: string;
  offset: number;
  in_daylight_saving: boolean;
};

export type IPRegistryCoData = {
  ip: string;
  type?: string;
  hostname?: string | null;
  carrier?: Carrier;
  company?: Company;
  connection?: Connection;
  currency?: Currency;
  location?: Location;
  security?: Security;
  time_zone?: TimeZone;
};

type IpData = {
  ip: string;
  countryCode?: string;
  countryName?: string;
  continentCode?: string;
  continentName?: string;
  regionCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  isEu?: boolean;
};

const map = new Map<string, IpData>();
const defaultDevIp = process.env['TEST_IP'] || '188.192.208.129';

const retrieve = async (ip: string) => {
  return map.get(ip);
};
const save = async (ip: string, ipData: IpData) => {
  return map.set(ip, ipData);
};

const extractIpData = (ip: string, response: IPRegistryCoData): IpData => {
  return {
    ip,
    countryCode: response.location?.country?.code,
    countryName: response.location?.country?.name,
    continentCode: response.location?.continent?.code,
    continentName: response.location?.continent?.name,
    regionCode: response.location?.region?.code,
    regionName: response.location?.region?.name,
    city: response.location?.city,
    zip: response.location?.postal,
    isEu: response.location?.in_eu,
  };
};

const isResponseOk = (status: number, data: any): boolean => {
  const codeIs200 = status >= 200 && status < 300;
  return codeIs200 && data.success !== false;
};

const getIpData = async (ip: string, timeout = 5000): Promise<IpData | undefined> => {
  logger.debug('Request detection for: ' + ip);

  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff')) {
    if (process.env['NODE_ENV'] !== 'production') {
      ip = defaultDevIp;
    } else {
      return Promise.reject('local_ip');
    }
  }

  let ipData: IpData | undefined = await retrieve(ip);
  if (!ipData) {
    const url = urlJoin(Env.ipRegistryCoUrl, ip);
    const headers = {
      Authorization: `ApiKey ${Env.ipRegistryCoKey}`,
    };

    logger.debug('requestUrl: ' + url);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: IPRegistryCoData = await response.json();
        if (isResponseOk(response.status, data)) {
          ipData = extractIpData(ip, data);
          if (logger.isLevelEnabled('debug')) {
            logger.debug(`Response for: ${ip} ${JSON.stringify(ipData)}`);
          }
          if (ipData) {
            await save(ip, ipData);
          }
        }
      }
    } catch (error) {
      logger.error(error, 'Error fetching IP data');
    }
  }

  return Promise.resolve(ipData);
};

export async function GET(request: Request) {
  let ip: string | undefined | null = '';
  if (Env.NODE_ENV !== 'production') {
    ip = defaultDevIp;
  } else {
    ip = determineIp(request);
  }

  if (ip) {
    try {
      const ipData = await getIpData(ip);
      if (ipData) {
        return NextResponse.json({ status: 'OK', ip: { isEu: ipData.isEu } });
      } else {
        return NextResponse.json({ status: 'FAIL' });
      }
    } catch (e) {
      logger.error(e, 'cannot get ip info');
    }
  }

  return NextResponse.json({ status: 'FAIL' });
}
