import React from 'react';
import { Rocket, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { urlJoin } from '@giglabo/upload-shared';
import { useLocale } from 'next-intl';

export function AgencyBannerComponent() {
  const { t } = useTranslation();
  const locale = useLocale();
  const benefits = [t('banner.benefit_1'), t('banner.benefit_2'), t('banner.benefit_3'), t('banner.benefit_4')];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-100 to-rose-200 py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-600/10 px-6 py-2">
            <Rocket className="mr-2 h-5 w-5 text-indigo-700" />
            <span className="font-medium text-indigo-900">{t('banner.subtitle')}</span>
          </div>

          <h2 className="mb-6 text-5xl font-bold text-indigo-950">{t('banner.title')}</h2>

          <p className="mb-8 text-xl text-indigo-900">{t('banner.description')}</p>

          <div className="mb-12 grid grid-cols-1 gap-6 text-left md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center rounded-xl bg-white/40 p-4 backdrop-blur-sm">
                <div className="mr-4 rounded-full bg-indigo-600/10 p-2">
                  <Check className="h-5 w-5 text-indigo-700" />
                </div>
                <span className="text-lg text-indigo-900">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <a
              href={urlJoin('https://giglabo.com', locale)}
              target="_blank"
              className="group mb-4 inline-flex items-center rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-orange-700"
              rel="noreferrer"
            >
              {t('banner.cta')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
