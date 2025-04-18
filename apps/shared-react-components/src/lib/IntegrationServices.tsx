import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FileCheck, Palette, Award, RotateCcw, Clock, ArrowRight, Calendar, Mail, DollarSign } from 'lucide-react';
import { urlJoin } from '@giglabo/upload-shared';
import { useLocale } from 'next-intl';

export function IntegrationServices() {
  const { t } = useTranslation();
  const locale = useLocale();
  const benefits = [
    {
      icon: FileCheck,
      title: t('why_us.benefit_1.title'),
      description: t('why_us.benefit_1.description'),
    },
    {
      icon: Palette,
      title: t('why_us.benefit_2.title'),
      description: t('why_us.benefit_2.description'),
    },
    {
      icon: Award,
      title: t('why_us.benefit_3.title'),
      description: t('why_us.benefit_3.description'),
    },
    {
      icon: RotateCcw,
      title: t('why_us.benefit_4.title'),
      description: t('why_us.benefit_4.description'),
    },
    {
      icon: Clock,
      title: t('why_us.benefit_5.title'),
      description: t('why_us.benefit_5.description'),
    },
    {
      icon: DollarSign,
      title: t('why_us.benefit_6.title'),
      description: t('why_us.benefit_6.description'),
    },
  ];
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-orange-500/[0.02]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          {/* Next.js Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white">
            <span className="text-xl">▲</span>
            <span className="font-medium">{t('why_us.badge')}</span>
          </div>

          <h2 className="mb-4 text-5xl font-bold">{t('why_us.title')}</h2>
          <h3 className="mb-6 text-2xl text-gray-600">{t('why_us.subtitle')}</h3>
          <span className="relative inline-flex text-indigo-500">
            <svg
              className="-z-1000 absolute left-0 top-[125%] -mt-4 max-w-full fill-orange-400 opacity-50"
              width="220"
              height="24"
              viewBox="0 0 220 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M134.66 13.107c-10.334-.37-20.721-.5-31.12-.291l-2.6.06c-4.116.04-8.193.602-12.3.749-14.502.43-29.029 1.196-43.514 2.465-6.414.63-12.808 1.629-19.04 2.866-7.93 1.579-16.113 3.71-23.367 5.003-2.211.374-3.397-1.832-2.31-4.906.5-1.467 1.838-3.456 3.418-4.813a16.047 16.047 0 0 1 6.107-3.365c16.88-4.266 33.763-6.67 51.009-7.389C71.25 3.187 81.81 1.6 92.309.966c11.53-.65 23.097-.938 34.66-.96 7.117-.054 14.25.254 21.36.318l16.194.803 4.62.39c3.85.32 7.693.618 11.53.813 8.346.883 16.673.802 25.144 2.159 1.864.276 3.714.338 5.566.873l.717.225c6.162 1.977 7.92 3.64 7.9 7.197l-.003.203c-.017.875.05 1.772-.112 2.593-.581 2.762-4.066 4.12-8.637 3.63-13.696-1.06-27.935-3.332-42.97-4.168-11.055-.83-22.314-1.459-33.596-1.603l-.022-.332Z" />
            </svg>
            <p className="text-xl font-bold">{t('why_us.description')}</p>
          </span>
        </div>

        <div className="mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group transform rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6 inline-block rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 p-3 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-12 text-center shadow-xl">
          <h3 className="mb-4 text-3xl font-bold text-white">{t('contact.title')}</h3>
          <p className="mb-8 text-xl text-gray-300">{t('contact.subtitle')}</p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={urlJoin('https://giglabo.com', locale, 'contact-i3kpgwz0jwyw02y004zaqxle')}
              target={'_blank'}
              className="group inline-flex w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:w-auto"
              rel="noreferrer"
            >
              <Mail className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              {t('contact.email')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={urlJoin('https://giglabo.com', locale, 'schedule-a-call-drepyi1qttvxg6qpmlirkyvp')}
              target={'_blank'}
              rel="noreferrer"
              className="group inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-orange-600 sm:w-auto"
            >
              <Calendar className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              {t('contact.call')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <p className="pt-2 text-sm italic text-gray-400">{t('why_us.ps')}</p>
        </div>
      </div>
    </section>
  );
}
