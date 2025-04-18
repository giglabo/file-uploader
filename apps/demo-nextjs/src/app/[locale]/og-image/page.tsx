'use client';
import React from 'react';
import { Upload, Shield, Cloud, Server } from 'lucide-react';
import { useTranslation } from '@giglabo/uploading-demo-react';
import { Env } from '@/libs/Env';

const OGImage = () => {
  const { t } = useTranslation();
  const features = [t('ogimage.feature_1'), t('ogimage.feature_2'), t('ogimage.feature_3'), t('ogimage.feature_4')];
  const rssUrl = Env.NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES;
  return (
    <div
      id="ogImage"
      className="relative flex h-[630px] w-[1200px] flex-col items-center justify-start overflow-hidden bg-gradient-to-br from-white to-gray-50"
    >
      <div className="absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-5%] h-[800px] w-[800px] rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute left-[40%] top-[60%] h-[400px] w-[400px] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>
      <div className="relative z-10 text-center">
        <img src={`${rssUrl}/assets/images/favicon-128x128.png`} alt="Logo" className="h-26 w-26 my-4 inline-block" />
        <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">{t('ogimage.title')}</h1>
        <p className="mb-12 max-w-4xl text-4xl text-gray-600">{t('ogimage.subtitle')}</p>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-100 bg-white/80 p-6 text-2xl font-medium text-gray-800 shadow-lg backdrop-blur-sm"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-gray-200 bg-gray-900/5 px-8 py-4 backdrop-blur-sm">
        <div className="flex flex-row items-center space-x-2">
          <img src={`${rssUrl}/assets/images/logo_giglabo_color_transp.png`} className="h-12 w-12" width="42" height="42" alt="GigLabo" />
          <span className="bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">GigLabo.com</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <Upload className="h-7 w-7 text-white" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500">
            <Cloud className="h-7 w-7 text-white" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <Server className="h-7 w-7 text-white" />
          </div>
          <img src={`${rssUrl}/assets/images/Next.js.png`} className="h-12 w-12" width="42" height="42" alt="Next.js" />
        </div>
      </div>
    </div>
  );
};

export default OGImage;
