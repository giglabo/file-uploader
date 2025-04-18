import React from 'react';
import { ShieldCheck, HardDrive, Cloud, Code2, RefreshCw, Files } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export function FeaturesComponent() {
  const { t } = useTranslation();
  const features = [
    {
      icon: ShieldCheck,
      title: t('features.feature_1.title'),
      description: t('features.feature_1.description'),
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: HardDrive,
      title: t('features.feature_2.title'),
      description: t('features.feature_2.description'),
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Cloud,
      title: t('features.feature_3.title'),
      description: t('features.feature_3.description'),
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: Code2,
      title: t('features.feature_4.title'),
      description: t('features.feature_4.description'),
      color: 'from-orange-500 to-rose-500',
    },
    {
      icon: Files,
      title: t('features.feature_5.title'),
      description: t('features.feature_5.description'),
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: RefreshCw,
      title: t('features.feature_6.title'),
      description: t('features.feature_6.description'),
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gray-900 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/10" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">{t('features.title')}</h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2">
          {features.map((feature, index) => (
            <div key={index} className={`transform cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:bg-white/5`}>
              <div className="flex items-start space-x-4">
                <div className={`rounded-xl bg-gradient-to-br p-3 ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="leading-relaxed text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
          {/*</div>*/}
        </div>
      </div>
    </section>
  );
}
