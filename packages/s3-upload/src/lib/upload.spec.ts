import { rootDir } from '../../root-dir';
import * as de from 'dotenv';
import * as path from 'node:path';
import * as process from 'node:process';
import { BaseUploadConfiguration } from './s3upload/base-upload-configuration';
import { v4 as uuid } from 'uuid';
import { BasePersist, GetObjectKeyFunction, UploadFileEntity, UploadValues } from './persist';
import { S3Config, S3Upload } from './s3upload';
import { Upload } from './upload';
import { FileMetadata, FileStatus, UploadRequest } from './models';
import { UploadMetaData } from '@giglabo/upload-shared';

de.config({ path: path.join(rootDir(), '.env') });

console.log(process.env.ENDPOINT);

class UploadConfigurationTemp extends BaseUploadConfiguration {
  getBucket(): Promise<string> {
    return Promise.resolve('test-qiz-private-files');
  }
  getObjectKey(uploadId: string, fileId: string, fileName: string, hash: string): Promise<string> {
    return Promise.resolve(`tests/${uploadId}/${uuid()}`);
  }
}
class PersistenceTemp extends BasePersist {
  constructor() {
    super();
  }

  override async findNotCompletedUpload(hash: string): Promise<UploadValues | undefined> {
    return undefined;
  }

  override async createNewUpload(
    hash: string,
    files: FileMetadata[],
    metadata: UploadMetaData,
    createObjectFunc: GetObjectKeyFunction,
  ): Promise<UploadValues | undefined> {
    const uploadId = 'uploadId-123';
    const fileEntities: UploadFileEntity[] = [];
    for (const file of files) {
      const fileId = uuid();
      fileEntities.push({
        fileId,
        size: file.size,
        status: FileStatus.NOT_COMPLETED,
        isMultipart: true,
        checkSumAlgorithm: 'custom',
        objectKey: await createObjectFunc(uploadId, fileId, file.name, file.checksum),
        checkSum: file.checksum,
      });
    }
    const res: UploadValues = {
      uploadId,
      files: fileEntities,
    };
    return res;
  }

  override async updateUploadFiles(savedFiles: UploadFileEntity[]): Promise<void> {
    return;
  }

  override async completeUpload(uploadId: string) {
    return;
  }

  async retrieveUploadFile(uploadId: string, fileId: string) {
    return undefined;
  }

  async completeUploadFile(uploadId: string, fileId: string) {
    return undefined;
  }
}

const config: S3Config = {
  region: 'auto',
  globalS3Protocol: 'https',
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

const persistenceTemp = new PersistenceTemp();
const uploadConfiguration = new UploadConfigurationTemp();

const s3Client = new S3Upload(config);

const testFileSize = 103 * 1024 * 1024;
const upload = new Upload(uploadConfiguration, persistenceTemp, s3Client);

describe('Upload', () => {
  it('should work', async () => {
    const req: UploadRequest = {
      files: [
        {
          relationId: '1',
          checksum: '123',
          checksumAlgorithm: 'custom',
          name: '123.bin',
          size: testFileSize,
          metadata: {},
        },
      ],
      relationId: '123',
      metadata: {},
    };

    const res = await upload.createUpload(req, false);
    expect(res.files.length).toEqual(1);
    expect(res.files[0].relationId).toEqual('1');
    expect(res.files[0].chunks.length).toBeGreaterThan(1);
  });
});
