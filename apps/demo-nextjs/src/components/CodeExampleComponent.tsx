import {
  DataUploadService,
  MetaUploadService,
  UploadConfigService,
  UploadGlobalProvider,
  UploadItem,
  useUploadEntity,
  useUploadEntityActions,
  useUploadEntityFiles,
} from '@giglabo/react-upload';
import { HashingService } from '@giglabo/hash-worker';
import { Hash, HashType, InputFile, MetaRetrieveWorker, UploadEntityStatusEnum } from '@giglabo/upload-shared';
import React, { useEffect } from 'react';

export class CustomNextJsUploadConfigService extends UploadConfigService {
  logEnabled() {
    return false;
  }
  get metaRetrieveWorker(): MetaRetrieveWorker {
    return (): Worker => {
      return new Worker(new URL('../../../workers/hashing-worker.worker.ts', import.meta.url), {
        type: 'module',
      });
    };
  }

  hashingAlgo(): HashType {
    return Hash.MD5;
  }

  chunkHashingAlgo(): HashType {
    return Hash.MD5;
  }
}

export function UploadFilesComponent({
  onUploading,
  onCompleteUpload,
  onCancelUpload,
  onHandleError,
}: {
  onUploading: (isUploading: boolean) => void;
  onCompleteUpload: () => void;
  onCancelUpload: () => void;
  onHandleError: (message: string) => void;
}) {
  const { create, upload } = useUploadEntityActions();
  const [internalUploadUid, setInternalUploadUid] = React.useState<string | null>(null);
  const { uploadEntity } = useUploadEntity(internalUploadUid);
  const completed = uploadEntity?.status === UploadEntityStatusEnum.COMPLETED;
  const failed = uploadEntity?.status === UploadEntityStatusEnum.FAILED;
  useEffect(() => {
    if (failed) {
      onUploading(false);
      onHandleError('Uploading failed');
    }
  }, [failed, onUploading]);

  useEffect(() => {
    (async () => {
      if (completed) {
        onCompleteUpload();
      }
    })();
  }, [completed, uploadEntity, onCompleteUpload]);

  // use to track uploading status
  const uploadFiles: UploadItem[] = useUploadEntityFiles(internalUploadUid);

  const startUpload = async () => {
    onUploading(true);

    const files: {
      id: string;
      file: File;
      checksum?: string;
      checksumAlgorithm?: string;
    }[] = [];

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
    <>
      file inputs here
      <button onClick={startUpload}>Upload </button>
    </>
  );
}

export function UploadWrapperComponent() {
  const nextJsMetaUploadService = new MetaUploadService();
  const nextJsUploadConfigService = new CustomNextJsUploadConfigService();
  const nextJsDataUploadService = new DataUploadService();
  const hashCalculator = new HashingService();

  return (
    <UploadGlobalProvider
      dataUploadService={nextJsDataUploadService}
      metaUploadService={nextJsMetaUploadService}
      uploadConfigService={nextJsUploadConfigService}
      hashCalculator={hashCalculator}
    >
      <UploadFilesComponent
        onUploading={() => console.log('onUploading')}
        onCompleteUpload={() => console.log('onCompleteUpload')}
        onCancelUpload={() => console.log('onCancelUpload')}
        onHandleError={() => console.log('onHandleError')}
      />
    </UploadGlobalProvider>
  );
}
