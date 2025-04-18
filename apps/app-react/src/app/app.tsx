import React from 'react';
import { Button } from '../components/shadcn/ui/button';
import {
  MetaUploadService,
  UploadConfigService,
  useUploadEntity,
  useUploadEntityActions,
  UploadGlobalProvider,
  UploadItem,
  useUploadEntityFiles,
  DataUploadService,
} from '@giglabo/react-upload';
import { Hash, HashType, MetaRetrieveWorker, InputFile } from '@giglabo/upload-shared';
import { HashingService } from '@giglabo/hash-worker';

class CustomUploadConfigService extends UploadConfigService {
  get metaRetrieveWorker(): MetaRetrieveWorker {
    return (): Worker => {
      return new Worker(new URL('../workers/hashing-worker.worker.ts', import.meta.url), {
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

const testCustomUpload = async (files: string[]): Promise<File[]> => {
  const options: RequestInit = {
    headers: {
      'Content-type': 'application/json',
    },
  };

  try {
    const responses = await Promise.all(files.map((f) => fetch(`/public/${f}`, options)));

    const arrayBuffers = await Promise.all(responses.map((response) => response.arrayBuffer()));

    const resultFiles = arrayBuffers.map((buffer, index) => {
      const blob = new Blob([buffer], {
        type: 'application/binary',
      });

      return new File([blob], files[index], { type: 'application/octet-stream' });
    });

    return resultFiles;
  } catch (error) {
    console.error('Error in testCustomUpload:', error);
    throw error;
  }
};

type UploadComponentPropos = {
  uploadIdRequested: (internalUploadUid: string) => void;
};

export function UploadFileComponent({ file }: { file: UploadItem }) {
  return file ? (
    <>
      <div>-----------------</div>
      <div>pkId: {file.pkId}</div>
      <div>internalId: {file.internalId}</div>
      <div>internalUploadId: {file.internalUploadId}</div>
      <div>name: {file.name}</div>
      <div>size: {file.size}</div>
      <div>integrityProcessed: {file.integrityProcessed}</div>
      <div>uploaded: {file.uploaded}</div>
      <div>status: {file.status}</div>
    </>
  ) : null;
}
export function UploadComponent(props: UploadComponentPropos) {
  const { create, upload } = useUploadEntityActions();
  const [internalUploadUid, setInternalUploadUid] = React.useState<string | null>(null);

  async function processPublicFiles() {
    // const values = await testCustomUpload(['test-data/temp_101456_file.bin', 'test-data/temp_2_3mb_file.bin']);
    const values = await testCustomUpload(['temp.tmp']);
    const files: InputFile[] = values.map((value) => {
      return {
        file: value,
        metaData: {},
      };
    });

    const internalUploadUid = create();
    upload(internalUploadUid, files, {}, false);
    setInternalUploadUid(internalUploadUid);
  }
  const { uploadEntity } = useUploadEntity(internalUploadUid);

  const files: UploadItem[] = useUploadEntityFiles(internalUploadUid);

  return (
    <>
      <div>
        <Button variant="outline" onClick={() => processPublicFiles()}>
          Process Public Files
        </Button>
      </div>
      <div>View:</div>
      <div>InternalID: {uploadEntity?.id}</div>
      <div>PKID: {uploadEntity?.pkId}</div>
      <div>Status: {uploadEntity?.status}</div>
      <div>Files:</div>
      {files.map((file) => {
        return <UploadFileComponent file={file}></UploadFileComponent>;
      })}
    </>
  );
}
export function App() {
  const uploadIdRequested = (internalUploadUid: string) => {
    // TODO
  };
  const metaUploadService = new MetaUploadService();
  // const uploadConfigService = new UploadConfigService();
  const uploadConfigService = new CustomUploadConfigService();
  const dataUploadService = new DataUploadService();
  // const hashCalculator = new NoHashCalcService();
  const hashCalculator = new HashingService();

  return (
    <div>
      <UploadGlobalProvider
        dataUploadService={dataUploadService}
        metaUploadService={metaUploadService}
        uploadConfigService={uploadConfigService}
        hashCalculator={hashCalculator}
      >
        <UploadComponent uploadIdRequested={uploadIdRequested}></UploadComponent>
      </UploadGlobalProvider>
      <div>End</div>
    </div>
  );
}

export default App;
