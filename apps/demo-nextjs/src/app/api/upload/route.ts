import { NextRequest, NextResponse } from 'next/server';
import { unauthorizedRequest, HttpHandlerLogicType } from '@/app/api/_utils';
import { z } from 'zod';
import { mainS3Client, mainStorageUploadConfiguration, S3MainPersistence } from '@/libs/backend-logic/storage';
import { Upload } from '@giglabo/s3-upload';
import { logger } from '@/libs/Logger';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { retrieveUploads } from '@/libs/backend-logic/storage/main-storage/storage-utils';
import { Hash, HashType } from '@giglabo/upload-shared';

const fileMetadataSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const uploadMetadataSchema = fileMetadataSchema.extend({
  targetStorageUid: z.string().uuid().optional(),
});

const fileSchema = z.object({
  relationId: z.string().uuid(),
  checksum: z.string(),
  checksumAlgorithm: z.enum([Hash.SHA1, Hash.SHA256, Hash.MD5, Hash.CRC32, Hash.CRC32C, 'custom'] as const) as z.ZodType<HashType>,
  name: z.string(),
  size: z.number(),
  metadata: fileMetadataSchema.optional(),
});

const uploadSchema = z.object({
  relationId: z.string().uuid(),
  metadata: uploadMetadataSchema.optional(),
  files: z.array(fileSchema),
});

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const rootUserUid = cookieStore.get('rootUserUid')?.value || uuidv4();

  const logic: HttpHandlerLogicType = async (authParams): Promise<NextResponse> => {
    const requestData = uploadSchema.safeParse(await req.json());
    if (!requestData.success || !authParams) {
      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors: requestData.error },
        },
        { status: 400 },
      );
    }

    logger.debug(`Try to upload files for ${rootUserUid}`);
    const s3MainPersistence = new S3MainPersistence(rootUserUid);
    const client = mainS3Client();
    const configuration = mainStorageUploadConfiguration();
    const upload = new Upload(configuration, s3MainPersistence, client);
    const searchParams = req.nextUrl.searchParams;
    const force = (searchParams.get('force') || 'false').toLowerCase() === 'true';
    try {
      const responseUpload = await upload.createUpload(requestData.data, force);
      return NextResponse.json(responseUpload, { status: 201 });
    } catch (e) {
      logger.error(e, 'Upload failed');
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  };

  // TODO extend roles
  return unauthorizedRequest(req, rootUserUid, logic);
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const rootUserUid = cookieStore.get('rootUserUid')?.value || uuidv4();

  const searchParams = req.nextUrl.searchParams;
  const start = Number.parseInt(searchParams.get('start') || '0', 10);
  const total = Number.parseInt(searchParams.get('total') || '20', 10);

  const logic: HttpHandlerLogicType = async (_): Promise<NextResponse> => {
    try {
      const responseUploads = await retrieveUploads(rootUserUid, start, total);
      return NextResponse.json(responseUploads, { status: 200 });
    } catch (e) {
      logger.error(e, 'Upload retrieve failed');
      return NextResponse.json({ error: 'Upload retrieve failed' }, { status: 500 });
    }
  };

  // TODO extend roles
  return unauthorizedRequest(req, rootUserUid, logic);
}
