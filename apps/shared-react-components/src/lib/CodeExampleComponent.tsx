import React from 'react';
import { Copy, Code, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface CodeExampleProps {
  activeTab: 'basic' | 'advanced';
  // onTabChange: (tab: 'basic' | 'advanced') => void;
  onCopyCode: (code: string) => void;
  basicCode: string;
  advancedCode: string;
  documentationUrl: string;
}

const CodeExampleComponent: React.FC<CodeExampleProps> = ({
  activeTab,
 /* onTabChange,*/
  onCopyCode,
  basicCode,
  advancedCode,
  documentationUrl,
}) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('live.codeExample')}</h3>
      </div>

      <div className="p-6">
        {/* Tabs */}
        {/*<div className="mb-4 flex border-b border-gray-200">*/}
        {/*  <button*/}
        {/*    onClick={() => onTabChange('basic')}*/}
        {/*    className={`px-5 py-2.5 text-base font-medium ${*/}
        {/*      activeTab === 'basic' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-800'*/}
        {/*    }`}*/}
        {/*  >*/}
        {/*    {t('live.basic')}*/}
        {/*  </button>*/}
        {/*  <button*/}
        {/*    onClick={() => onTabChange('advanced')}*/}
        {/*    className={`px-5 py-2.5 text-base font-medium ${*/}
        {/*      activeTab === 'advanced' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-800'*/}
        {/*    }`}*/}
        {/*  >*/}
        {/*    {t('live.advanced')}*/}
        {/*  </button>*/}
        {/*</div>*/}

        {/* Code Block */}
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
            <code>{activeTab === 'basic' ? basicCode : advancedCode}</code>
          </pre>
          <button
            onClick={() => onCopyCode(activeTab === 'basic' ? basicCode : advancedCode)}
            className="absolute right-2 top-2 rounded bg-gray-700 p-1.5 text-gray-200 transition-colors hover:bg-gray-600"
            title="Copy code"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        {/* Documentation Link */}
        <div className="mt-4 text-center">
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
