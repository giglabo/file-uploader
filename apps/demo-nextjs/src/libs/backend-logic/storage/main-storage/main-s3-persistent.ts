import { v4 as uuid } from 'uuid';
import { BasePersist, FileMetadata, FileStatus, GetObjectKeyFunction, UploadFileEntity, UploadValues } from '@giglabo/s3-upload';
import { UploadMetaData } from '@giglabo/upload-shared';
import { logger } from '@/libs/Logger';
import { retrieveDatabaseConnection } from '@/libs/backend-logic/database/database-connection';
import {
  UploadEntity,
  UploadFileEntity as UploadFileEntityDb,
  UploadFileSchema,
  UploadSchema,
} from '@/libs/backend-logic/database/entities';
import { retrieveStatuses } from '@/libs/backend-logic/database/db-state';

export class S3MainPersistence extends BasePersist {
  constructor(private rootUserUid: string) {
    super();
  }

  override async findNotCompletedUpload(hash: string): Promise<UploadValues | undefined> {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      const uploadDb = await queryRunner.manager.findOneBy(UploadEntity, {
        hash,
        rootUserUid: this.rootUserUid,
      });

      let res: UploadValues | undefined = undefined;

      if (uploadDb) {
        const fileEntities: UploadFileEntity[] = [];
        res = {
          uploadId: uploadDb.uploadUid,
          files: fileEntities,
        };

        const fileEntitiesDb = await queryRunner.manager
          .getRepository(UploadFileEntityDb)
          .createQueryBuilder('uf')
          .innerJoinAndSelect('uf.status', 's')
          .where(`uf.rootUserUid=:rootUserUid and uf.uploadUid=:uploadUid`, {
            uploadUid: uploadDb.uploadUid,
            rootUserUid: this.rootUserUid,
          })
          .getMany();

        for (const fileEntitiesDbElement of fileEntitiesDb) {
          fileEntities.push(this.convertDbFile(fileEntitiesDbElement));
        }
      }

      await queryRunner.commitTransaction();
      return res;
    } catch (e) {
      logger.error(e, 'Retrieve upload error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return undefined;
  }

  override async createNewUpload(
    hash: string,
    files: FileMetadata[],
    metaData: UploadMetaData,
    createObjectFunc: GetObjectKeyFunction,
  ): Promise<UploadValues | undefined> {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();

    try {
      const uploadId = uuid();
      await queryRunner.startTransaction();

      const statuses = retrieveStatuses();

      await queryRunner.manager.insert(UploadEntity, {
        uploadUid: uploadId,
        hash,
        rootUserUid: this.rootUserUid,
        metaData: metaData,
        statusUid: statuses['ACTIVE']?.statusUid,
      });

      const res: UploadValues = {
        uploadId,
        files: [],
      };

      const filesToDb: Partial<UploadFileSchema>[] = [];
      for (const file of files) {
        const fileId = uuid();
        const objectKey = await createObjectFunc(uploadId, fileId, file.name, file.checksum);

        filesToDb.push({
          rootUserUid: this.rootUserUid,
          s3MultipartUploadKey: '',
          s3ObjectKey: objectKey,
          statusUid: statuses['ACTIVE']?.statusUid,
          uploadFileUid: fileId,
          uploadUid: uploadId,
          checksum: file.checksum,
          checksumAlgorithm: file.checksumAlgorithm,
          fileName: file.name,
          fileSize: file.size,
          metaData: file.metadata,
        });
      }

      await queryRunner.manager.insert(UploadFileEntityDb, filesToDb);
      await queryRunner.commitTransaction();
      res.files = filesToDb.map((x) => this.convertDbFile(x));

      return res;
    } catch (e) {
      logger.error(e, 'Create new upload error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return undefined;
  }

  override async updateUploadFiles(savedFiles: UploadFileEntity[]): Promise<void> {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();
    const statuses = retrieveStatuses();
    try {
      await queryRunner.startTransaction();
      for (const savedFile of savedFiles) {
        const fileToDb: Partial<UploadFileSchema> = {
          s3MultipartUploadKey: savedFile.s3MultipartUploadId,
          statusUid: savedFile.status === FileStatus.NOT_COMPLETED ? statuses['IN_PROCESS']?.statusUid : statuses['PROCESSED']?.statusUid,
        };
        await queryRunner.manager.update(UploadFileEntityDb, savedFile.fileId, fileToDb);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      logger.error(e, 'Update upload files error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return;
  }

  override async completeUpload(uploadId: string) {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();
    const statuses = retrieveStatuses();
    try {
      await queryRunner.startTransaction();
      const entityToDb: Partial<UploadSchema> = {
        statusUid: statuses['PROCESSED']?.statusUid,
      };
      await queryRunner.manager.update(UploadEntity, uploadId, entityToDb);
      await queryRunner.commitTransaction();
      await this.clear(uploadId);
      return;
    } catch (e) {
      logger.error(e, 'Complete upload error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return;
  }

  override async retrieveUploadFile(uploadId: string, fileId: string) {
    const databaseConnection = retrieveDatabaseConnection();
    const dbItem = await databaseConnection.manager.findOneBy(UploadFileEntityDb, { uploadFileUid: fileId, uploadUid: uploadId });
    if (dbItem) {
      return this.convertDbFile(dbItem);
    }
    return undefined;
  }

  override async completeUploadFile(uploadId: string, fileId: string) {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();
    const statuses = retrieveStatuses();
    try {
      await queryRunner.startTransaction();
      const fileToDb: Partial<UploadFileSchema> = {
        statusUid: statuses['PROCESSED']?.statusUid,
      };
      await queryRunner.manager.update(UploadFileEntityDb, fileId, fileToDb);

      const dbItem = await queryRunner.manager.findOneBy(UploadFileEntityDb, { uploadFileUid: fileId, uploadUid: uploadId });

      await queryRunner.commitTransaction();
      if (dbItem) {
        return this.convertDbFile(dbItem);
      }
      return undefined;
    } catch (e) {
      logger.error(e, 'Complete upload file error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return undefined;
  }

  private async clear(uploadId: string) {
    const databaseConnection = retrieveDatabaseConnection();
    const queryRunner = databaseConnection.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(UploadFileEntityDb)
        .where('upload_uid=:uploadId', { uploadId })
        .execute();

      await queryRunner.manager.createQueryBuilder().delete().from(UploadEntity).where('upload_uid=:uploadId', { uploadId }).execute();

      await queryRunner.commitTransaction();
      return;
    } catch (e) {
      logger.error(e, 'Cleanup upload error');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return;
  }
  private convertDbFile(fileEntitiesDbElement: Partial<UploadFileSchema>): UploadFileEntity {
    return {
      isMultipart: true,
      objectKey: fileEntitiesDbElement.s3ObjectKey as string,
      fileId: fileEntitiesDbElement.uploadFileUid as string,
      checkSum: fileEntitiesDbElement.checksum as string,
      checkSumAlgorithm: fileEntitiesDbElement.checksumAlgorithm || 'custom',
      s3MultipartUploadId: fileEntitiesDbElement.s3MultipartUploadKey,
      size: fileEntitiesDbElement.fileSize || 0,
      status: fileEntitiesDbElement.status?.code === 'PROCESSED' ? FileStatus.COMPLETED : FileStatus.NOT_COMPLETED,
    };
  }
}
