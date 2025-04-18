'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Download, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { formatDate, formatFileSize } from './utils';
import { urlJoin } from '@giglabo/upload-shared';
import { UploadedFile, UploadedFilesObject } from './_models';
import { saveAs } from 'file-saver';
import StatusBadge from './StatusBadgeComponent';

interface StorageTabProps {
  onHandleError: (message: string) => void;
  apiUrl: string;
}

type ExpandedUploadsState = {
  [key: string]: boolean;
};

const StorageTab = ({ apiUrl, onHandleError }: StorageTabProps) => {
  const { t } = useTranslation();
  const [expandedUploads, setExpandedUploads] = useState<ExpandedUploadsState>({});
  const [allUploadedFilesArray, setAllUploadedFilesArray] = useState<UploadedFilesObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allUploadedFilesArray?.length) {
      const initialExpandedState: ExpandedUploadsState = {};
      allUploadedFilesArray.forEach((fileObj) => {
        initialExpandedState[fileObj.uploadUid] = true;
      });
      setExpandedUploads(initialExpandedState);
    }
  }, [allUploadedFilesArray]);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        const response = await fetchUploadedFiles(0, 20);
        if (response) {
          setAllUploadedFilesArray(response);
        }
      } catch (error) {
        onHandleError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadFiles().then();
  }, []);

  if (loading) return <div className="p-8 text-gray-900">{t('storage.loading')}</div>;

  async function fetchUploadedFiles(start = 0, total = 20) {
    try {
      const params = new URLSearchParams({
        start: start.toString(),
        total: total.toString(),
      });

      const response = await fetch(urlJoin(apiUrl, `/api/upload?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        onHandleError(`Error fetching files: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      onHandleError((error as Error).message);
    }
  }
  const toggleUpload = (uploadUid: string) => {
    setExpandedUploads((prev) => ({
      ...prev,
      [uploadUid]: !prev[uploadUid],
    }));
  };

  const onDownloadFile = async (file: UploadedFile) => {
    try {
      const response = await fetch(file.downloadUrl);

      if (!response.ok) {
        onHandleError(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = file.fileName;
      saveAs(blob, filename);
    } catch (error) {
      onHandleError((error as Error).message);
    }
  };
  return (
    <div className="border-t-none p-8">
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
        <p className="text-orange-700">{t('live.warning')}</p>
      </div>

      <div className="space-y-6">
        {allUploadedFilesArray?.map((filesObj) => (
          <div key={filesObj.uploadUid} className="overflow-hidden rounded-lg border border-orange-200 bg-white">
            <div
              className="flex cursor-pointer items-center bg-orange-50 px-6 py-4 transition-colors hover:bg-orange-100"
              onClick={() => toggleUpload(filesObj.uploadUid)}
            >
              {expandedUploads[filesObj.uploadUid] ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <div className="ml-2">
                <p className="text-sm text-gray-600">
                  {t('storage.uploaded_at')} {formatDate(filesObj.updated)}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  <p className="mt-1 text-xs text-gray-500">
                    {filesObj.files.length} {t('storage.file')}
                    {filesObj.files.length !== 1 ? t('storage.files_plural') : ''}
                  </p>
                  <StatusBadge statusCode={filesObj.status} />
                </div>
              </div>
            </div>

            {expandedUploads[filesObj.uploadUid] && (
              <div className="divide-y divide-gray-100">
                {filesObj.files.map((file) => (
                  <div key={file.fileId} className="overflow-x-auto hover:bg-gray-50">
                    <div className="flex flex-row items-center gap-2 px-6 py-4">
                      <FileText className="h-5 w-5 flex-shrink-0 text-gray-400 max-md:hidden" />
                      <div className="flex min-w-max flex-col items-start">
                        <div className="flex-grow md:ml-4">
                          <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <StatusBadge statusCode={file.status} />
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            {file.checksum && (
                              <span>
                                {t('storage.checksum')} {file.checksum}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            {file.checksumAlgorithm && (
                              <span>
                                {t('storage.checksum_algorithm')} {file.checksumAlgorithm}
                              </span>
                            )}
                          </div>
                        </div>
                        {file.downloadUrl && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onDownloadFile(file)}
                              className="flex items-center py-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 md:px-3"
                            >
                              <Download className="mr-1 h-4 w-4" />
                              <span className="">{t('storage.download')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {allUploadedFilesArray?.length === 0 && <div className=" text-gray-900">{t('storage.empty_storage')}</div>}
      </div>
    </div>
  );
};

export default StorageTab;
