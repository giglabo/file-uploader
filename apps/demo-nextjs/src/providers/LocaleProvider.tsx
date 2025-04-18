// app/providers/LocaleProvider.tsx
'use client';

import React from 'react';
import { TranslationProvider } from '@/providers/TranslationProvider';

interface LocaleProviderProps {
  locale: string;
  translations: Record<string, Record<string, any>>;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, translations, children }: LocaleProviderProps) {
  // Default to English if the locale isn't supported
  const currentLocale = Object.keys(translations).includes(locale) ? locale : 'en';

  // Ensure we have a valid translations object
  const currentTranslations = translations[currentLocale] || {};

  return (
    <TranslationProvider locale={currentLocale} translations={currentTranslations}>
      {children}
    </TranslationProvider>
  );
}
