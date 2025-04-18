export type S3Config = {
  region: string;
  endpoint?: string | undefined;
  accessKeyId: string;
  secretAccessKey: string;
  globalS3ForcePathStyle?: boolean;
  globalS3Protocol: 'http' | 'https';
  globalS3MaxSockets?: number | undefined;
};
