import { S3Config } from './s3-config';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListMultipartUploadsCommand,
  ListMultipartUploadsCommandInput,
  ListPartsCommand,
  ListPartsCommandInput,
  S3Client,
  S3ClientConfig,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { HttpAgent, HttpsAgent } from 'agentkeepalive';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { Part } from '@aws-sdk/client-s3/dist-types/models/models_0';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from 'verdaccio/build/lib/logger';

export class S3Upload {
  readonly client: S3Client;

  constructor(
    private readonly s3Config: S3Config,
    private uploadPresignedUrlExpiresIn = 86400,
  ) {
    const agentOptions = {
      maxSockets: s3Config.globalS3MaxSockets || 10,
      keepAlive: true,
    };
    // TODO
    const agent =
      s3Config.globalS3Protocol === 'http' ? { httpAgent: new HttpAgent(agentOptions) } : { httpsAgent: new HttpsAgent(agentOptions) };

    const params: S3ClientConfig = {
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      runtime: 'node',
      requestHandler: new NodeHttpHandler({
        ...agent,
      }),
    };
    if (s3Config.endpoint) {
      params.endpoint = s3Config.endpoint;
    }
    if (s3Config.globalS3ForcePathStyle) {
      params.forcePathStyle = true;
    }
    this.client = new S3Client(params);
  }

  async listMultipartParts(bucketName: string, objectKey: string, s3MultipartUploadId: string): Promise<Part[]> {
    let isTruncated = false;

    let partNumberMarker: string | undefined = undefined;
    const parts: Part[] = [];
    do {
      const listPartsInput: ListPartsCommandInput = {
        Bucket: bucketName,
        Key: objectKey,
        UploadId: s3MultipartUploadId,
        PartNumberMarker: partNumberMarker,
      };

      const listPartsResponse = await this.client.send(new ListPartsCommand(listPartsInput));

      if (listPartsResponse.Parts) {
        parts.push(...listPartsResponse.Parts);
      }
      partNumberMarker = listPartsResponse.NextPartNumberMarker || undefined;
      isTruncated = listPartsResponse.IsTruncated || false;
    } while (isTruncated);
    return parts;
  }

  async createMultipartUpload(bucketName: string, objectKey: string): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await this.client.send(command);
    if (!response.UploadId) {
      throw `UploadId is undefined for ${bucketName}/${objectKey}`;
    }
    return response.UploadId;
  }

  async checkMultipartUpload(bucketName: string, objectKey: string, s3MultipartUploadId: string): Promise<boolean> {
    const listMultipartUploadsInput: ListMultipartUploadsCommandInput = {
      Bucket: bucketName,
      Prefix: objectKey,
    };

    const command = new ListMultipartUploadsCommand(listMultipartUploadsInput);
    const response = await this.client.send(command);
    if (response.Uploads && response.Uploads.length > 0) {
      return response.Uploads[0]?.UploadId === s3MultipartUploadId;
    } else {
      return false;
    }
  }

  async completeMultipartUpload(bucketName: string, objectKey: string, s3MultipartUploadId: string) {
    const parts = await this.listMultipartParts(bucketName, objectKey, s3MultipartUploadId);

    const completeMultipartUpload = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: objectKey,
      UploadId: s3MultipartUploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    await this.client.send(completeMultipartUpload);
  }

  async createPreSignedUrlForPartUpload(
    bucketName: string,
    objectKey: string,
    s3MultipartUploadId: string,
    partNumber: number,
    md5Digest?: string | undefined,
  ): Promise<string> {
    const uploadPartCommand = new UploadPartCommand({
      Bucket: bucketName,
      UploadId: s3MultipartUploadId,
      Key: objectKey,
      PartNumber: partNumber,
      ContentMD5: md5Digest,
    });

    return await getSignedUrl(this.client, uploadPartCommand, { expiresIn: this.uploadPresignedUrlExpiresIn });
  }
}
