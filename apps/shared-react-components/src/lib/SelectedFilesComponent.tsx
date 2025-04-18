'use client';
import React, { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FileItem, InputFile } from './_models';
import { UploadItem, useUploadEntity, useUploadEntityActions, useUploadEntityFiles } from '@giglabo/react-upload';
import { UploadEntityStatusEnum } from '@giglabo/upload-shared';
import { X } from 'lucide-react';
import { DemoFileInfoComponent } from './DemoFileInfoComponent';
import { UploadFileProgress } from './UploadFileProgress';

interface SelectedFilesProps {
  files: FileItem[];
  isUploading: boolean;
  allFilesCompleted: boolean;
  onUploading: (isUploading: boolean) => void;
  onCompleteUpload: () => void;
  onDeleteFile: (id: string) => void;
  onDeleteAllFiles: () => void;
  onUploadMoreFiles: () => void;
  onCancelUpload: () => void;
  onHandleError: (message: string) => void;
}

export function SelectedFilesComponent({
  files,
  isUploading,
  allFilesCompleted,
  onUploading,
  onCompleteUpload,
  onDeleteAllFiles,
  onDeleteFile,
  onUploadMoreFiles,
  onCancelUpload,
  onHandleError,
}: SelectedFilesProps) {
  const { t } = useTranslation();
  const { create, upload } = useUploadEntityActions();
  const [internalUploadUid, setInternalUploadUid] = React.useState<string | null>(null);
  const { uploadEntity } = useUploadEntity(internalUploadUid);
  const completed = uploadEntity?.status === UploadEntityStatusEnum.COMPLETED;
  const failed = uploadEntity?.status === UploadEntityStatusEnum.FAILED;
  useEffect(() => {
    if (failed) {
      onUploading(false);
      onHandleError('Uploading failed')
    }
  }, [failed, onUploading]);

  useEffect(() => {
    (async () => {
      if (completed) {
        //TODO Show success upload notification
        onCompleteUpload();
      }
    })();
  }, [completed, uploadEntity, onCompleteUpload]);

  const uploadFiles: UploadItem[] = useUploadEntityFiles(internalUploadUid);

  const startUpload = async () => {
    onUploading(true);
    const inputFiles: InputFile[] = files.map((value) => {
      return {
        file: value.file,
        metaData: {},
      };
    });

    const internalUploadUid = create();
    setInternalUploadUid(internalUploadUid);
    try {
      await upload(internalUploadUid, inputFiles, {}, false);
    } catch (error) {
      onHandleError((error as Error).message);
      onCancelUpload();
    }
  };

  return (
    <div className={`${!allFilesCompleted ? 'mt-8' : ''}`}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-800">
          {allFilesCompleted ? t('live.uploadedFiles') : t('live.selectedFiles')} ({files.length})
        </h3>
        {isUploading ? (
          <div className="flex gap-3">
            <button disabled className="cursor-not-allowed rounded-lg bg-orange-300 px-5 py-2.5 text-base text-white">
              {t('live.uploading')}
            </button>
          </div>
        ) : allFilesCompleted ? (
          <button
            onClick={onUploadMoreFiles}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-base text-white transition-colors hover:bg-orange-600"
          >
            {t('live.uploadMoreFiles')}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onDeleteAllFiles}
              className="rounded-lg bg-gray-100 px-5 py-2.5 text-base text-gray-700 transition-colors hover:bg-gray-200"
            >
              {t('live.deleteAll')}
            </button>
            <button
              onClick={startUpload}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-base text-white transition-colors hover:bg-orange-600"
            >
              {t('live.uploadFiles')}
            </button>
          </div>
        )}
      </div>

      <div className={`space-y-4 ${allFilesCompleted ? 'max-h-[850px]' : 'max-h-[500px]'} overflow-y-auto pr-2`}>
        {!isUploading && !allFilesCompleted  ? (
          <>
            {files.map((file) => (
              <div key={file.id} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <DemoFileInfoComponent file={file.file} />
                  <button onClick={() => onDeleteFile(file.id)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div>
            <div className="space-y-4">
              {uploadFiles.map((file, index) => {
                const baseKey = file.internalId ? `file-${file.internalId}` : `file-${index}`;
                return (
                  <div key={baseKey} className="rounded-lg border border-gray-200 bg-white p-5">
                    <DemoFileInfoComponent file={file.file} key={`info-${baseKey}`} />

                    {!isUploading && allFilesCompleted && (
                      <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">{t('live.fileChecksumAlgorithm')}</span> {file.hashType.toUpperCase()}
                        </p>
                        <p className="mt-1">
                          <span className="font-medium">{t('live.checksum')}</span>{' '}
                          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{file.hash}</code>
                        </p>
                      </div>
                    )}

                    {isUploading && !allFilesCompleted && <UploadFileProgress key={`progress-${baseKey}`} file={file}></UploadFileProgress>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
