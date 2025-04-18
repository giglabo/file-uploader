import { useTranslation } from '../hooks/useTranslation';
import { urlJoin } from '@giglabo/upload-shared';
import { useLocale } from 'next-intl';

export function FooterComponent() {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className="container mx-auto px-4 text-center">
      <p className="text-xl">
        <a
          target="_blank"
          className="text-orange-500 underline hover:text-orange-700"
          href={urlJoin('https://giglabo.com', locale)}
          rel="noreferrer"
        >
          GigLabo
        </a>{' '}
        File Uploader &copy; 2025
      </p>
      <p className="mt-3 text-base text-gray-400">{t('footer.description')}</p>
    </div>
  );
}
