import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { urlJoin } from '@giglabo/shared';

export default function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale();

  const changeLanguage = async (newLocale) => {
    router.push(urlJoin('/', newLocale, '/'));
  };

  return (
    <div className="container mx-auto px-4 py-4 text-center">
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => changeLanguage('en')}
            className={`rounded-l-lg px-4 py-2 text-sm font-medium ${
              currentLocale === 'en' ? 'bg-orange-500 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => changeLanguage('ru')}
            className={`rounded-r-lg px-4 py-2 text-sm font-medium ${
              currentLocale === 'ru' ? 'bg-orange-500 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Русский
          </button>
        </div>
      </div>
    </div>
  );
}
