import { AppConfig } from '@/utils/AppConfig';
import { urlJoin } from '@giglabo/upload-shared';
import { Env } from '@/libs/Env';

export function createUrl(locale: string, url: string) {
  let localeNormalized = '';
  if (AppConfig.locales.map((x) => `/${x}`).find((x) => url.startsWith(x))) {
    return url;
  }
  localeNormalized = `${locale}`;
  return urlJoin(Env.NEXT_PUBLIC_BASE_URL || '', localeNormalized, url);
}
