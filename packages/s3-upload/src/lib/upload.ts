import { createHash } from 'crypto';
import { FileMetadata, FileStatus, FileUpload, UploadRequest, UploadResponse } from './models';
import { BasePersist, UploadFileEntity, UploadValues } from './persist';
import { S3Upload } from './s3upload';
import { UploadMetaData } from '@giglabo/shared';
import { BaseUploadConfiguration } from './s3upload/base-upload-configuration';
import { ChunkCalculationService, ChunkCalculationServiceImpl } from './chunks';

export class Upload {
  constructor(
    private readonly uploadConfiguration: BaseUploadConfiguration,
    private readonly basePersist: BasePersist,
    private readonly s3Client: S3Upload,
  ) {}

  async createUpload(req: UploadRequest, force: boolean): Promise<UploadResponse> {
    const { files, metadata, relationId } = req;

    let uploadValue: UploadValues | undefined = undefined;
    const hash = this.calcUploadHash(files.map((x) => x.checksum));
    if (!force) {
      uploadValue = await this.basePersist.findNotCompletedUpload(hash);
    } else {
      uploadValue = undefined;
    }

    if (!uploadValue) {
      uploadValue = await this.createNewUpload(hash, files, metadata || {});
    }

    const { files: resultFiles } = await this.prepareUpload(uploadValue, req.files);

    return { uploadId: uploadValue.uploadId, files: resultFiles, relationId };
  }

  async completeFile(uploadId: string, fileId: string): Promise<UploadFileEntity | undefined | null> {
    const item: UploadFileEntity | undefined | null = await this.basePersist.retrieveUploadFile(uploadId, fileId);
    if (!item) {
      throw `Not found upload file: ${uploadId} => ${fileId}`;
    }

    if (!item.s3MultipartUploadId) {
      throw `Not found s3MultipartUploadId for ${uploadId}`;
    }

    const bucketName = await this.uploadConfiguration.getBucket();
    await this.s3Client.completeMultipartUpload(bucketName, item.objectKey, item.s3MultipartUploadId);

    return await this.basePersist.completeUploadFile(uploadId, fileId);
  }

  async completeUpload(uploadId: string): Promise<void> {
    await this.basePersist.completeUpload(uploadId);
  }

  async createPreSignedUrlForPartUpload(
    uploadId: string,
    fileId: string,
    partNumber: number,
    md5Digest?: string | undefined,
  ): Promise<string> {
    const item: UploadFileEntity | undefined | null = await this.basePersist.retrieveUploadFile(uploadId, fileId);
    if (!item) {
      throw `Not found upload file: ${uploadId} => ${fileId}`;
    }

    if (!item.s3MultipartUploadId) {
      throw `Not found s3MultipartUploadId for ${uploadId}`;
    }
    const bucketName = await this.uploadConfiguration.getBucket();
    return this.s3Client.createPreSignedUrlForPartUpload(bucketName, item.objectKey, item.s3MultipartUploadId, partNumber, md5Digest);
  }

  private calcUploadHash(fileHashes: string[]): string {
    const hashes = [...fileHashes];
    hashes.sort();

    const concatenatedString = hashes.join('');

    return createHash('md5').update(concatenatedString, 'utf-8').digest('hex');
  }

  private async prepareUpload(uploadValue: UploadValues, requestFiles: FileMetadata[]): Promise<{ files: FileUpload[] }> {
    const resultFiles: FileUpload[] = [];
    const checksumToFileMetadata = new Map<string, FileMetadata[]>();
    for (const requestFile of requestFiles) {
      let rfl = checksumToFileMetadata.get(requestFile.checksum);
      if (!rfl) {
        rfl = [];
        checksumToFileMetadata.set(requestFile.checksum, rfl);
      }
      rfl.push(requestFile);
    }
    const uploadValueFiles: UploadFileEntity[] = uploadValue.files;
    const failBackUpdatedFiles: UploadFileEntity[] = [];
    for (const uploadValueFile of uploadValueFiles) {
      const lfm = checksumToFileMetadata.get(uploadValueFile.checkSum);
      const fileMetadata = lfm?.shift();
      if (!lfm || !fileMetadata) {
        throw `Inconsistency in prepare upload for ${uploadValueFile.checkSum}`;
      }

      checksumToFileMetadata.set(uploadValueFile.checkSum, lfm);

      let chunksKnownToS3: Set<number> = new Set<number>();
      if (uploadValueFile.isMultipart && uploadValueFile.status !== FileStatus.COMPLETED) {
        const chunksKnownToS3Existing = await this.listMultipart(uploadValueFile);
        if (!chunksKnownToS3Existing) {
          const bucketName = await this.uploadConfiguration.getBucket();
          const objectKey = uploadValueFile.objectKey;
          const s3MultipartUploadId: string = await this.s3Client.createMultipartUpload(bucketName, objectKey);
          failBackUpdatedFiles.push({ ...uploadValueFile, s3MultipartUploadId });
        } else {
          chunksKnownToS3 = chunksKnownToS3Existing;
        }
      }

      const chunkCalculationService: ChunkCalculationService = new ChunkCalculationServiceImpl();

      const chunks = chunkCalculationService.calculateChunks(uploadValueFile.size);

      resultFiles.push({
        chunks: chunks.map((x) => {
          return { ...x, status: chunksKnownToS3.has(x.index) ? 'complete' : 'missing' };
        }),
        status: uploadValueFile.status,
        fileId: uploadValueFile.fileId,
        relationId: fileMetadata.relationId,
      });
    }

    if (failBackUpdatedFiles.length > 0) {
      await this.basePersist.updateUploadFiles(failBackUpdatedFiles);
    }
    return { files: resultFiles };
  }

  private async createNewUpload(hash: string, files: FileMetadata[], metadata: UploadMetaData): Promise<UploadValues> {
    const res = await this.basePersist.createNewUpload(hash, files, metadata, this.uploadConfiguration.getObjectKey);

    if (!res) {
      throw `Upload creation failed for ${hash}`;
    }

    const { files: savedFiles, uploadId } = res;

    const updatedFiles: UploadFileEntity[] = [];
    for (const file of savedFiles) {
      const bucketName = await this.uploadConfiguration.getBucket();
      const objectKey = file.objectKey;
      const s3MultipartUploadId: string = await this.s3Client.createMultipartUpload(bucketName, objectKey);
      updatedFiles.push({ ...file, s3MultipartUploadId });
    }

    await this.basePersist.updateUploadFiles(updatedFiles);

    return { uploadId, files: updatedFiles };
  }

  private async listMultipart(uploadValueFile: UploadFileEntity): Promise<Set<number> | undefined> {
    const bucketName = await this.uploadConfiguration.getBucket();
    if (!uploadValueFile.s3MultipartUploadId) {
      // TODO logger
      // throw `Upload listMultipart failed for ${uploadValueFile.objectKey}`;
      return undefined;
    }
    const parts = await this.s3Client.listMultipartParts(bucketName, uploadValueFile.objectKey, uploadValueFile.s3MultipartUploadId);
    return new Set<number>(parts.map((x) => x.PartNumber).filter((x) => !!x) as number[]);
  }
}
