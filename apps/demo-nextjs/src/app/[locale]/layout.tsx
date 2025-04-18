import { getMetadata } from '@/app/_utils/metadata-utils';
import { routing } from '@/libs/i18nNavigation';
import '../../styles/global.scss';
import { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { LocaleProvider } from '@/providers/LocaleProvider';

import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';
import React from 'react';
import { ErrorProvider } from '@/providers/ErrorProvider';
import { NextIntlClientProvider } from 'next-intl';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Env } from '@/libs/Env';

const translations: Record<string, Record<string, any>> = {
  en: enTranslations,
  ru: ruTranslations,
};

export function generateViewport(/*props: PropsParams*/): Promise<Viewport> {
  return Promise.resolve({
    initialScale: 1,
    width: 'device-width',
  });
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type PropsParams = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  props: PropsParams,
  /* parent: ResolvingMetadata */
): Promise<Metadata> {
  const { locale } = await props.params;
  return getMetadata(locale).then((x) => x || {});
}

export default async function RootLayout(props: PropsParams) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorProvider>
            <LocaleProvider locale={locale} translations={translations}>
              {props.children}
            </LocaleProvider>
          </ErrorProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics gaId={Env.authGoogleAnalytics} />
      </body>
    </html>
  );
}
