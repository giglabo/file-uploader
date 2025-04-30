import React from 'react';
import { Copy, Code, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface CodeExampleProps {
  documentationUrl: string;
  exampleOneUrl : string;
}

const CodeExampleComponent: React.FC<CodeExampleProps> = ({
  documentationUrl, exampleOneUrl
}) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('live.codeExample')}</h3>
      </div>

      <div className="p-6">

        {/* Example Link */}
        <div className="mt-4">
          <a
            href={exampleOneUrl}
            className="inline-flex items-center font-medium text-orange-600 hover:text-orange-700" rel="noreferrer"
          >
            <Code className="mr-1 h-4 w-4" />
            {t('live.seeExampleOneDemo')}
          </a>
        </div>

        {/* Documentation Link */}
        <div className="mt-4">
          <a
            href={documentationUrl}
            target={'_blank'}
            className="inline-flex items-center font-medium text-orange-600 hover:text-orange-700" rel="noreferrer"
          >
            <Code className="mr-1 h-4 w-4" />
            {t('live.seeDocumentation')}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CodeExampleComponent;
