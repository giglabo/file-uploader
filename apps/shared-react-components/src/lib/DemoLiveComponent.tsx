'use client';
import { useTranslation } from '../hooks/useTranslation';
import { DemoDragAndDropComponent } from './DemoDragAndDropComponent';
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FileItem } from './_models';
import { SelectedFilesComponent } from './SelectedFilesComponent';
import DemoControlsComponent from './DemoControlsComponent';
import CodeExampleComponent from './CodeExampleComponent';
import { Hash, HashType } from '@giglabo/shared';
import StorageTab from './StorageTab';
import { formatFileSize } from './utils';

type DemoLiveProps = {
  apiUrl: string;
  basicCode: string;
  advancedCode: string;
  hashingAlgo: HashType;
  chunkHashingAlgo: HashType;
  maxFileSize: number;
  maxUploadSize: number;
  documentationUrl: string;
  onHashingAlgoChange: (newHashingAlgo: Hash | 'custom', newChunkHashingAlgo: Hash | 'custom') => void;
  onHandleGlobalError: (message: string) => void;
};

export function DemoLiveComponent({
  apiUrl,
  basicCode,
  advancedCode,
  hashingAlgo,
  chunkHashingAlgo,
  maxFileSize,
  maxUploadSize,
  documentationUrl,
  onHashingAlgoChange,
  onHandleGlobalError,
}: DemoLiveProps) {

  const { t } = useTranslation();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allFilesCompleted, setAllFilesCompleted] = useState(false);
  const [selectedHashingAlgo, setSelectedHashingAlgo] = useState(hashingAlgo);
  const [selectedChunkHashingAlgo, setSelectedChunkHashingAlgo] = useState(chunkHashingAlgo);
  const [showChunkInfoPopup, setShowChunkInfoPopup] = useState(false);
  const [showFileInfoPopup, setShowFileInfoPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [activeDemoTab, setActiveDemoTab] = useState<'upload' | 'storage'>('upload');

  useEffect(() => {
    onHashingAlgoChange(selectedHashingAlgo, selectedChunkHashingAlgo);
  }, [selectedHashingAlgo, selectedChunkHashingAlgo, onHashingAlgoChange]);

  useEffect(() => {
    setSelectedHashingAlgo(hashingAlgo);
    setSelectedChunkHashingAlgo(chunkHashingAlgo);
  }, [hashingAlgo, chunkHashingAlgo]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const validFiles = Array.from(selectedFiles).filter((file) => file.size <= maxFileSize);
    if (validFiles.length === 0) {
      onHandleGlobalError(t('errors.fileSizeExceeded', { maxSize: formatFileSize(maxFileSize) }));
      return;
    }
    const currentTotalSize = files.reduce((total, fileItem) => total + fileItem.file.size, 0);
    const selectedFilesSize = validFiles.reduce((total, file) => total + file.size, 0);
    if (currentTotalSize + selectedFilesSize > maxUploadSize) {
      onHandleGlobalError(t('errors.totalFilesSizeExceeded', { maxUploadSize: formatFileSize(maxUploadSize) }));
      return;
    }

    const newFilesArray = Array.from(validFiles).map((file) => {
      const fileItem: FileItem = {
        id: uuid(),
        file,
      };
      return fileItem;
    });
    setFiles((prev) => [...prev, ...newFilesArray]);
  };

  const handleDeleteAllFiles = () => {
    setFiles([]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUploading = (isUploading: boolean) => {
    setIsUploading(isUploading);
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    //TODO cancel upload
  };

  const handleCompleteUpload = () => {
    setAllFilesCompleted(true);
    setIsUploading(false);
  };

  const handleUploadMoreFiles = () => {
    setAllFilesCompleted(false);
    setFiles([]);
  };

  const handleChunkChecksumChange = (e: HashType | 'custom') => {
    setSelectedChunkHashingAlgo(e);
  };

  const handleFileChecksumChange = (e: HashType) => {
    setSelectedHashingAlgo(e);
  };

  const handleError = (message: string) => {
    onHandleGlobalError(message);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-md:py-12">
      <h2 className="mb-8 text-center text-4xl font-bold">
        {t('live.header')}
        <span className="relative inline-flex text-indigo-500">
          <svg
            className="-z-1000 absolute left-0 top-[125%] -mt-4 max-w-full fill-orange-300"
            width="220"
            height="24"
            viewBox="0 0 220 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M134.66 13.107c-10.334-.37-20.721-.5-31.12-.291l-2.6.06c-4.116.04-8.193.602-12.3.749-14.502.43-29.029 1.196-43.514 2.465-6.414.63-12.808 1.629-19.04 2.866-7.93 1.579-16.113 3.71-23.367 5.003-2.211.374-3.397-1.832-2.31-4.906.5-1.467 1.838-3.456 3.418-4.813a16.047 16.047 0 0 1 6.107-3.365c16.88-4.266 33.763-6.67 51.009-7.389C71.25 3.187 81.81 1.6 92.309.966c11.53-.65 23.097-.938 34.66-.96 7.117-.054 14.25.254 21.36.318l16.194.803 4.62.39c3.85.32 7.693.618 11.53.813 8.346.883 16.673.802 25.144 2.159 1.864.276 3.714.338 5.566.873l.717.225c6.162 1.977 7.92 3.64 7.9 7.197l-.003.203c-.017.875.05 1.772-.112 2.593-.581 2.762-4.066 4.12-8.637 3.63-13.696-1.06-27.935-3.332-42.97-4.168-11.055-.83-22.314-1.459-33.596-1.603l-.022-.332Z"
            />
          </svg>
          {t('live.header2')}
        </span>
      </h2>
      <p className="mx-auto mb-12 max-w-3xl text-center text-xl text-gray-600 md:mb-16">{t('live.subTitle')}</p>

      <div className="mb-8 flex border-b border-gray-200">
        <button
          onClick={() => {
            handleUploadMoreFiles();
            setActiveDemoTab('upload');
          }}
          className={`border-b-2 px-8 py-4 text-lg font-medium transition-colors ${
            activeDemoTab === 'upload' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('live.uploadTab')}
        </button>
        <button
          onClick={() => setActiveDemoTab('storage')}
          className={`border-b-2 px-8 py-4 text-lg font-medium transition-colors ${
            activeDemoTab === 'storage' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('live.storageTab')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {activeDemoTab === 'upload' ? (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg lg:col-span-2">
            <div className="p-8">
              {!allFilesCompleted && <DemoDragAndDropComponent onFileSelect={handleFileSelect} isUploading={isUploading} />}
              {files.length > 0 && (
                <SelectedFilesComponent
                  files={files}
                  isUploading={isUploading}
                  onUploading={handleUploading}
                  allFilesCompleted={allFilesCompleted}
                  onDeleteFile={handleDeleteFile}
                  onCompleteUpload={handleCompleteUpload}
                  onDeleteAllFiles={handleDeleteAllFiles}
                  onUploadMoreFiles={handleUploadMoreFiles}
                  onCancelUpload={handleCancelUpload}
                  onHandleError={handleError}
                />
              )}
            </div>
          </section>
        ) : null}

        <section className="space-y-8">
          {activeDemoTab === 'upload' && (
            <>
              <DemoControlsComponent
                chunkChecksumAlgorithm={selectedChunkHashingAlgo}
                fileChecksumAlgorithm={selectedHashingAlgo}
                showChunkInfoPopup={showChunkInfoPopup}
                showFileInfoPopup={showFileInfoPopup}
                onChunkChecksumChange={handleChunkChecksumChange}
                onFileChecksumChange={handleFileChecksumChange}
                onToggleChunkInfo={() => setShowChunkInfoPopup(!showChunkInfoPopup)}
                onToggleFileInfo={() => setShowFileInfoPopup(!showFileInfoPopup)}
              />
              <CodeExampleComponent
                activeTab={activeTab}
                // onTabChange={setActiveTab}
                onCopyCode={copyCode}
                basicCode={basicCode}
                advancedCode={advancedCode}
                documentationUrl={documentationUrl}
              />
            </>
          )}
        </section>
      </div>
      {activeDemoTab === 'storage' ? <StorageTab apiUrl={apiUrl} onHandleError={handleError} /> : null}
    </div>
  );
}
