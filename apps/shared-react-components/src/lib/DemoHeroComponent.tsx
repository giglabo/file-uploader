'use client';
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FileText } from 'lucide-react';

type DemoHeroProps = {
  githubUrl: string;
  documentationUrl: string;
};

export function DemoHeroComponent({ githubUrl, documentationUrl }: DemoHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-10 text-center">
      <div className="mb-8 inline-block rounded-full bg-orange-100 px-5 py-2 text-base font-medium text-orange-600">{t('hero.badge')}</div>
      <h1 className="mb-6 text-5xl font-bold md:text-6xl">
        <span className="text-black">{t('hero.heading1')}</span>
        <br />
        <span className="text-orange-500">{t('hero.heading2')}</span>
      </h1>

      <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-600">{t('hero.subheading')}</p>

      <div className="flex justify-center gap-5">
        <a
          href={githubUrl}
          target={'_blank'}
          className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-lg font-medium text-white transition-colors hover:bg-orange-600 md:px-8 md:py-4"
          rel="noreferrer"
        >
          {t('hero.ctaButton1')}
        </a>

        <a
          href={documentationUrl}
          target={'_blank'}
          className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-50 md:px-8 md:py-4"
          rel="noreferrer"
        >
          <FileText className="mr-2 h-5 w-5" />
          {t('hero.ctaButton2')}
        </a>
      </div>
    </div>
  );
}
