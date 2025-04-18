import { S3Upload } from '@giglabo/s3-upload';
import { mainS3Config } from '@/libs/backend-logic/storage';

export const mainS3Client = () => new S3Upload(mainS3Config());
