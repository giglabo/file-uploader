import React from 'react';
import { Info, X, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Hash, HashType } from '@giglabo/shared';

interface DemoControlsProps {
  chunkChecksumAlgorithm: HashType;
  fileChecksumAlgorithm: HashType;
  showChunkInfoPopup: boolean;
  showFileInfoPopup: boolean;
  onChunkChecksumChange: (e: HashType) => void;
  onFileChecksumChange: (e: HashType) => void;
  onToggleChunkInfo: () => void;
  onToggleFileInfo: () => void;
}

const DemoControlsComponent: React.FC<DemoControlsProps> = ({
  chunkChecksumAlgorithm,
  fileChecksumAlgorithm,
  showChunkInfoPopup,
  showFileInfoPopup,
  onChunkChecksumChange,
  onFileChecksumChange,
  onToggleChunkInfo,
  onToggleFileInfo,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('live.demoControls')}</h3>
      </div>
      <div className="space-y-6 p-6">
        {/* Chunk Checksum Algorithm */}
        <div className="relative">
          <label className="mb-2 block text-base font-medium text-gray-600">{t('live.chunkChecksum')}</label>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <select
                value={chunkChecksumAlgorithm}
                onChange={(e) => onChunkChecksumChange(e.target.value as HashType)}
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {/*<option value="">{t('live.selectAlgorithm')}</option>*/}
                <option value={Hash.MD5}>MD5</option>
                <option value='custom'>None</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            <button onClick={onToggleChunkInfo} className="ml-2 text-gray-500 hover:text-gray-700">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {/* Info Popup */}
          {showChunkInfoPopup && (
            <div className="relative mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <button onClick={onToggleChunkInfo} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
              <p>{t('live.chunkChecksumInfoPopup')}</p>
            </div>
          )}
        </div>

        {/* File Checksum Algorithm */}
        <div className="relative">
          <label className="mb-2 block text-base font-medium text-gray-600">{t('live.fileChecksum')}</label>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <select
                value={fileChecksumAlgorithm}
                onChange={(e) => onFileChecksumChange(e.target.value as HashType)}
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 pr-10 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="custom">None</option>
                <option value={Hash.MD5}>MD5</option>
                <option value={Hash.SHA1}>SHA-1</option>
                <option value={Hash.SHA256}>SHA-256</option>
                <option value={Hash.CRC32}>CRC32</option>
                <option value={Hash.CRC32C}>CRC32C</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            <button onClick={onToggleFileInfo} className="ml-2 text-gray-500 hover:text-gray-700">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {/* Info Popup */}
          {showFileInfoPopup && (
            <div className="relative mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <button onClick={onToggleFileInfo} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
              <p>{t('live.fileChecksumInfoPopup')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoControlsComponent;
