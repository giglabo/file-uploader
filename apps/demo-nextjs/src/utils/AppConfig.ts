import { LocalePrefixMode } from 'next-intl/routing';

// const localePrefix: LocalePrefixMode = 'as-needed';
const localePrefix: LocalePrefixMode = 'always';

export const AppConfig = {
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix,
};
