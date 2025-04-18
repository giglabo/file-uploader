// app/providers/TranslationProvider.tsx
'use client';

import React, { useEffect } from 'react';
import { setTranslations } from '@giglabo/uploading-demo-react';

interface TranslationProviderProps {
  locale: string;
  translations: Record<string, any>;
  children: React.ReactNode;
}

export function TranslationProvider({ locale, translations, children }: TranslationProviderProps) {
  useEffect(() => {
    setTranslations(locale, translations);
  }, [locale, translations]);

  return <>{children}</>;
}
