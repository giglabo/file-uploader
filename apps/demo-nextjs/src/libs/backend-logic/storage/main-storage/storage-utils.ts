import { GetObjectCommand, GetObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadFileEntity } from '@giglabo/s3-upload';
import { retrieveDatabaseConnection } from '@/libs/backend-logic/database/database-connection';
import {
  UploadArchiveEntity,
  UploadArchiveFileEntity,
  UploadArchiveFileSchema,
  UploadFileEntity as UploadFileEntityDb,
  UploadFileSchema,
} from '@/libs/backend-logic/database/entities';
import { logger } from '@/libs/Logger';
import { In } from 'typeorm';
import * as dfs from 'date-fns';
import { presignedUrlExpiresIn } from '@/app/api/_utils';

const useFileVersionSeparator = false;

export const PATH_SEPARATOR = '/';
export const FILE_VERSION_SEPARATOR = '-$v-';
export const SEPARATOR = useFileVersionSeparator ? FILE_VERSION_SEPARATOR : PATH_SEPARATOR;

interface UploadedFileObject {
  fileId: string;
  fileName: string;
  fileSize: number;
  checksum: string;
  checksumAlgorithm: string;
  created: string;
  updated: string;
  status: string;
  downloadUrl: string | null;
}

interface UploadedFilesObject {
  uploadUid: string;
  created: string;
  updated: string;
  status: string;
  files: UploadedFileObject[];
}

export function withOptionalVersion(key: string, version?: string): string {
  return version ? `${key}${SEPARATOR}${version}` : key;
}

export async function privateAssetUrl(
  client: S3Client,
  bucket: string,
  key: string,
  version: string | undefined,
  expiresInSeconds: number | undefined,
): Promise<string> {
  const input: GetObjectCommandInput = {
    Bucket: bucket,
    Key: withOptionalVersion(key, version),
  };

  const command = new GetObjectCommand(input);
  return getSignedUrl(client, command, {
    expiresIn: expiresInSeconds || 600,
  });
}

export async function updateUploadFile(uploadFle: UploadFileEntity, update: { downloadUrl: string }): Promise<void> {
  const databaseConnection = retrieveDatabaseConnection();
  const queryRunner = databaseConnection.createQueryRunner();
  try {
    await queryRunner.startTransaction();
    const fileToDb: Partial<UploadFileSchema> = {
      downloadUrl: update.downloadUrl,
    };
    await queryRunner.manager.update(UploadFileEntityDb, uploadFle.fileId, fileToDb);
    await queryRunner.commitTransaction();
  } catch (e) {
    logger.error(e, 'Update upload file error');
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
  return;
}

export function determineDownloadUrl(file: UploadArchiveFileSchema) {
  if (file.status.code !== 'PROCESSED') {
    return '';
  }
  if (dfs.differenceInSeconds(new Date(), file.updated) > presignedUrlExpiresIn) {
    return '';
  }

  return file.downloadUrl;
}

export async function retrieveUploads(rootUserUid: string, start: number, total: number): Promise<UploadedFilesObject[]> {
  const resultMap: Map<string, UploadedFilesObject> = new Map();
  const databaseConnection = retrieveDatabaseConnection();
  const queryRunner = databaseConnection.createQueryRunner();

  try {
    const uploadArchiveRepository = queryRunner.manager.getRepository(UploadArchiveEntity);
    const uploadArchiveFileRepository = queryRunner.manager.getRepository(UploadArchiveFileEntity);

    const uploadUids: string[] = [];

    const uploads = await uploadArchiveRepository.find({
      where: { rootUserUid },
      order: { updated: 'DESC' },
      skip: start,
      take: total,
      relations: ['status'],
    });

    uploads.forEach((upload) => {
      uploadUids.push(upload.uploadArchiveUid);

      resultMap.set(upload.uploadArchiveUid, {
        uploadUid: upload.uploadArchiveUid,
        created: dfs.formatISO(upload.created),
        updated: dfs.formatISO(upload.updated),
        status: upload.status.code,
        files: [],
      });
    });

    if (uploadUids.length > 0) {
      const allFiles = await uploadArchiveFileRepository.find({
        where: {
          uploadArchiveUid: In(uploadUids),
        },
        relations: ['status'],
      });

      allFiles.forEach((file) => {
        const uploadEntry = resultMap.get(file.uploadArchiveUid);
        if (uploadEntry) {
          uploadEntry.files.push({
            fileId: file.uploadArchiveFileUid,
            fileName: file.fileName,
            fileSize: file.fileSize,
            checksum: file.checksum,
            checksumAlgorithm: file.checksumAlgorithm,
            created: dfs.formatISO(file.created),
            updated: dfs.formatISO(file.updated),
            status: file.status.code,
            downloadUrl: determineDownloadUrl(file),
          });
        }
      });
    }
  } finally {
    await queryRunner.release();
  }

  return Array.from(resultMap.values());
}
