import React from 'react';
import { UploadItem } from '@giglabo/react-upload';
import { UploadItemStatusEnum } from '@giglabo/upload-shared';
import { useTranslation } from '../hooks/useTranslation';

interface UploadFileProgressProps {
  file: UploadItem;
}

export function UploadFileProgress({ file }: UploadFileProgressProps) {
  const { t } = useTranslation();
  const integrityCalculation = file.status === UploadItemStatusEnum.INTEGRITY_CALCULATION;
  const registered = file.status === UploadItemStatusEnum.REGISTERED;
  const calculateProgress = (file: UploadItem) => {
    if (integrityCalculation) {
      return Math.min(Math.round((file.integrityProcessed / file.size) * 100), 100);
    }
    return Math.min(Math.round((file.uploaded / file.size) * 100), 100);
  };
  return file ? (
    <div className="mt-4 space-y-2">
      <div className="mb-2 flex justify-between text-sm text-gray-500">
        {registered ? (
          <span>{t('live.waiting')}</span>
        ) : integrityCalculation ? (
          <span>{t('live.calculatingIntegrity')}</span>
        ) : (
          <span>{t('live.uploading')}</span>
        )}
        <span>{calculateProgress(file)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${integrityCalculation ? 'bg-indigo-500' : 'bg-gradient-to-r from-orange-500 to-rose-500'}`}
          style={{ width: `${calculateProgress(file)}%` }}
        />
      </div>
    </div>
  ) : null;
}
