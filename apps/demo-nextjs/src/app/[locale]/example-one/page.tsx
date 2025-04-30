'use client';
import React from 'react';
import { UploadGlobalProvider } from '@giglabo/react-upload';
import { HashingService } from '@giglabo/hash-worker';
import FileUploaderWrapper from './FileUploaderWrapper';
import { CustomUploadConfigService } from './_upload-providers/CustomUploadConfigService';
import { CustomDataUploadService } from './_upload-providers/CustomDataUploadService';
import { CustomMetaUploadService } from './_upload-providers/CustomMetaUploadService';

export default function ExampleOne() {
  const metaUploadService = new CustomMetaUploadService();
  const uploadConfigService = new CustomUploadConfigService();
  const dataUploadService = new CustomDataUploadService();
  const hashCalculator = new HashingService();

  return (
    <div className="h-full overflow-hidden">
      <UploadGlobalProvider
        dataUploadService={dataUploadService}
        metaUploadService={metaUploadService}
        uploadConfigService={uploadConfigService}
        hashCalculator={hashCalculator}
      >
        <FileUploaderWrapper></FileUploaderWrapper>
      </UploadGlobalProvider>
    </div>
  );
}
