import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mainS3Client, mainStorageUploadConfiguration, S3MainPersistence } from '@/libs/backend-logic/storage';
import { Upload } from '@giglabo/s3-upload';
import { logger } from '@/libs/Logger';
import { isSubset } from '@/libs/backend-logic/utils';
import { HttpHandlerLogicType, presignedUrlExpiresIn, unauthorizedRequest } from '@/app/api/_utils';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { privateAssetUrl, updateUploadFile } from '@/libs/backend-logic/storage/main-storage/storage-utils';

type Params = { uploadId: string; slugs: string[] };

const fileIdSchema = z.object({
  fileId: z.string().uuid(),
});

const presignedUrlSchema = fileIdSchema.extend({
  chunkNumber: z.number().int().min(1),
});

async function presignedUrl(req: NextRequest, rootUserUid: string, uploadId: string, slugs: string[]) {
  const logic: HttpHandlerLogicType = async (authParams): Promise<NextResponse> => {
    const requestData = presignedUrlSchema.safeParse({
      fileId: slugs[1],
      chunkNumber: Number.parseInt(slugs[3] || '0', 10),
    });

    if (!requestData.success || !authParams) {
      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors: requestData.error },
        },
        { status: 400 },
      );
    }

    const s3MainPersistence = new S3MainPersistence(rootUserUid);
    const client = mainS3Client();
    const configuration = mainStorageUploadConfiguration();
    const upload = new Upload(configuration, s3MainPersistence, client);
    // TODO force from query params
    try {
      const md5Digest = req.headers.get('content-md5') || undefined;
      const presignedUrl = await upload.createPreSignedUrlForPartUpload(
        uploadId,
        requestData.data.fileId,
        requestData.data.chunkNumber,
        md5Digest,
      );
      return NextResponse.json({ presignedUrl }, { status: 201 });
    } catch (e) {
      logger.error(e, 'Upload failed');
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  };

  return unauthorizedRequest(req, rootUserUid, logic);
}

async function completeFile(req: NextRequest, rootUserUid: string, uploadId: string, slugs: string[]) {
  const logic: HttpHandlerLogicType = async (authParams): Promise<NextResponse> => {
    const requestData = fileIdSchema.safeParse({
      fileId: slugs[1],
    });

    if (!requestData.success || !authParams) {
      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors: requestData.error },
        },
        { status: 400 },
      );
    }

    const s3MainPersistence = new S3MainPersistence(rootUserUid);
    const client = mainS3Client();
    const configuration = mainStorageUploadConfiguration();
    const upload = new Upload(configuration, s3MainPersistence, client);
    try {
      const uploadedFile = await upload.completeFile(uploadId, requestData.data.fileId);
      if (uploadedFile) {
        // create and update download link
        const presignedUrlResponse = await privateAssetUrl(
          client.client,
          await configuration.getBucket(),
          uploadedFile.objectKey,
          undefined,
          presignedUrlExpiresIn,
        );

        await updateUploadFile(uploadedFile, { downloadUrl: presignedUrlResponse });
        return NextResponse.json({}, { status: 200 });
      }
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    } catch (e) {
      logger.error(e, 'Upload failed');
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  };

  return unauthorizedRequest(req, rootUserUid, logic);
}

async function completeUpload(req: NextRequest, rootUserUid: string, uploadId: string, _slugs: string[]) {
  const logic: HttpHandlerLogicType = async (authParams): Promise<NextResponse> => {
    if (!authParams) {
      return NextResponse.json(
        {
          error: { message: 'Invalid request' },
        },
        { status: 400 },
      );
    }

    const s3MainPersistence = new S3MainPersistence(rootUserUid);
    const client = mainS3Client();
    const configuration = mainStorageUploadConfiguration();
    const upload = new Upload(configuration, s3MainPersistence, client);
    try {
      await upload.completeUpload(uploadId);
      return NextResponse.json({}, { status: 200 });
    } catch (e) {
      logger.error(e, 'Upload failed');
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  };

  // TODO extend roles
  return unauthorizedRequest(req, rootUserUid, logic);
}

export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const cookieStore = await cookies();
  const rootUserUid = cookieStore.get('rootUserUid')?.value || uuidv4();

  const { uploadId, slugs } = await params;
  if (slugs.length === 5) {
    if (isSubset(['files', 'chunks', 'pre-signed-url'], slugs)) {
      return presignedUrl(req, rootUserUid, uploadId, slugs);
    }
  } else if (slugs.length === 3) {
    if (isSubset(['files', 'complete'], slugs)) {
      return completeFile(req, rootUserUid, uploadId, slugs);
    }
  } else if (slugs.length === 1) {
    if (isSubset(['complete'], slugs)) {
      return completeUpload(req, rootUserUid, uploadId, slugs);
    }
  }
  return NextResponse.json({ error: 'Method is not allowed' }, { status: 405 });
}
