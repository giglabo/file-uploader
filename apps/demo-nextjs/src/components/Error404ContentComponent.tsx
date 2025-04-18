'use client';
import { FileText, Home, MoveRight } from 'lucide-react';
import { useTranslation } from '@giglabo/uploading-demo-react';

interface Error404ContentProps {
  homeUrl: string;
  documentationUrl: string;
}
export default function Error404ContentComponent({ homeUrl, documentationUrl }: Error404ContentProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Glitch Effect */}
        <div className="relative mb-8">
          <h1 className="select-none text-[12rem] font-bold leading-none tracking-tight text-gray-900">404</h1>
          <div className="absolute inset-0 animate-pulse">
            <h1 className="select-none text-[12rem] font-bold leading-none tracking-tight text-orange-500 opacity-50">404</h1>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-semibold text-gray-900">{t('error_404.title')}</h2>

        <p className="mx-auto mb-12 max-w-lg text-lg text-gray-600"> {t('error_404.message')}</p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={homeUrl}
            className="group inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600"
          >
            <Home className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            {t('error_404.backToHome')}
            <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href={documentationUrl}
            target="_blank"
            className="group inline-flex items-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <FileText className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            {t('error_404.documentation')}
          </a>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-orange-100 opacity-30 blur-3xl" />
          <div className="absolute bottom-[30%] right-[15%] h-60 w-60 rounded-full bg-rose-100 opacity-30 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
