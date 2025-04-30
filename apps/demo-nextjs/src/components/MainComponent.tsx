'use client';
import {
  AgencyBannerComponent,
  DemoHeroComponent,
  DemoLiveComponent,
  FeaturesComponent,
  FooterComponent,
  IntegrationServices,
} from '@giglabo/uploading-demo-react';
import ClientOnly from '@/components/ClientOnly';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { UploadGlobalProvider } from '@giglabo/react-upload';
import { HashingService } from '@giglabo/hash-worker';
import { NextJsMetaUploadService } from '@/app/[locale]/_upload-providers/NextJsMetaUploadService';
import { NextJsUploadConfigService } from '@/app/[locale]/_upload-providers/NextJsUploadConfigService';
import { NextJsDataUploadService } from '@/app/[locale]/_upload-providers/NextJsDataUploadService';
import { useEffect, useState } from 'react';
import { Hash, urlJoin } from '@giglabo/upload-shared';
import { useError } from '@/providers/ErrorProvider';
import { Env } from '@/libs/Env';
import { create } from '@/app/[locale]/_actions';
import CookieConsent from '@/components/CookieConsent';

type IpResponse = { status: 'OK' | 'FAIL'; ip?: { isEu: boolean } };
const LS_COOKIE_KEY = 'cookies_hidden';

interface MainComponentProps {
  githubUrl: string;
  documentationUrl: string;
  exampleOneUrl: string;
}

export function MainComponent({ githubUrl, documentationUrl, exampleOneUrl }: MainComponentProps) {
  useEffect(() => {
    create().then();
  }, []);
  const [hashingAlgo, setHashingAlgo] = useState<Hash | 'custom'>(Hash.MD5);
  const [chunkHashingAlgo, setChunkHashingAlgo] = useState<Hash | 'custom'>(Hash.MD5);
  const nextJsMetaUploadService = new NextJsMetaUploadService();
  const nextJsUploadConfigService = new NextJsUploadConfigService({ hashingAlgo, chunkHashingAlgo });
  const nextJsDataUploadService = new NextJsDataUploadService();
  const hashCalculator = new HashingService();
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  const fileMaxSize = parseInt(Env.MAX_FILE_SIZE, 10) * 1024 * 1024;
  const maxUploadSize = parseInt(Env.MAX_UPLOAD_SIZE, 10) * 1024 * 1024;

  useEffect(() => {
    const value = localStorage.getItem(LS_COOKIE_KEY) === 'true';
    if (!value) {
      fetch(urlJoin(Env.NEXT_PUBLIC_BASE_URL || '', '/api/ip'))
        .then((response) => response.json())
        .catch((error) => handleError(error))
        .then((data: IpResponse) => {
          if (data.ip?.isEu) {
            setShowCookieConsent(true);
          }
        })
        .catch((error) => handleError(error));
    }
  }, []);

  const { showError } = useError();

  const handleHashingAlgoChange = (newHashingAlgo: Hash | 'custom', newChunkHashingAlgo: Hash | 'custom') => {
    setHashingAlgo(newHashingAlgo || Hash.MD5);
    setChunkHashingAlgo(newChunkHashingAlgo || Hash.MD5);
  };

  const handleError = (message: string) => {
    showError(message);
  };

  const handleAcceptCookies = () => {
    setShowCookieConsent(false);
    localStorage.setItem('cookies_hidden', 'true');
  };

  return (
    <div className="min-h-screen bg-white">
      <header>
        <ClientOnly>
          <LanguageSwitcher />
        </ClientOnly>
      </header>

      <main>
        <DemoHeroComponent githubUrl={githubUrl} documentationUrl={documentationUrl} />
        <UploadGlobalProvider
          dataUploadService={nextJsDataUploadService}
          metaUploadService={nextJsMetaUploadService}
          uploadConfigService={nextJsUploadConfigService}
          hashCalculator={hashCalculator}
        >
          <DemoLiveComponent
            apiUrl={Env.NEXT_PUBLIC_BASE_URL || '/'}
            hashingAlgo={hashingAlgo}
            chunkHashingAlgo={chunkHashingAlgo}
            maxFileSize={fileMaxSize}
            maxUploadSize={maxUploadSize}
            exampleOneUrl={exampleOneUrl}
            onHashingAlgoChange={handleHashingAlgoChange}
            onHandleGlobalError={handleError}
          />
        </UploadGlobalProvider>
        <FeaturesComponent />
        <IntegrationServices />
        <AgencyBannerComponent />
      </main>

      <footer className="bg-gray-800 py-12 text-white">
        <FooterComponent />
      </footer>

      {showCookieConsent && <CookieConsent onAccept={handleAcceptCookies} />}
    </div>
  );
}
