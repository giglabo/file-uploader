import { Env } from '@/libs/Env';
import { S3Config } from '@giglabo/s3-upload';

function parseBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const trueValues = ['true', 'yes', '1', 'on'];
  return trueValues.includes(value.toLowerCase());
}
export const mainS3Config = (): S3Config => {
  if (!global.selfConfig.s3Config) {
    global.selfConfig.s3Config = {
      region: Env.s3Region,
      globalS3Protocol: (Env.s3Protocol as 'https' | 'http') || 'https',
      endpoint: Env.s3Endpoint,
      accessKeyId: Env.s3AccessKeyId,
      secretAccessKey: Env.s3SecretAccessKey,
      globalS3ForcePathStyle: parseBoolean(Env.globalS3ForcePathStyle),
    };
  }
  return global.selfConfig.s3Config;
};
