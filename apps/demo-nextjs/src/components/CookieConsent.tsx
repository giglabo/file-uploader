'use client';
import React from 'react';
import { Cookie } from 'lucide-react';
import { useTranslation } from '@giglabo/uploading-demo-react';

interface CookieConsentProps {
  onAccept: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const { t } = useTranslation();
  return (
    <div className="animate-slide-up fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="container mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-orange-100 p-2">
            <Cookie className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-gray-600">{t('cookie.text')}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://google.com" className="btn px-4 py-2 text-gray-600 transition-colors hover:text-gray-800">
            {t('cookie.decline')}
          </a>
          <button onClick={onAccept} className="rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600">
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
