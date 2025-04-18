import { NextRequest, NextResponse } from 'next/server';
import { unauthorizedRequest, HttpHandlerLogicType } from '@/app/api/_utils';
import { z } from 'zod';
import { ChunkCalculationServiceImpl, ChunkCalculationService, Chunk } from '@giglabo/s3-upload';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { Env } from '@/libs/Env';
import { formatFileSize } from '@/app/_utils/utils';

const fileSchema = z.object({
  relationId: z.string().uuid(),
  size: z.number().int().positive(),
});

const filesContainerSchema = z.object({
  files: z.array(fileSchema),
});

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const rootUserUid = cookieStore.get('rootUserUid')?.value || uuidv4();

  const logic: HttpHandlerLogicType = async (): Promise<NextResponse> => {
    const requestData = filesContainerSchema.safeParse(await req.json());
    if (!requestData.success) {
      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors: requestData.error },
        },
        { status: 400 },
      );
    }
    const maxUploadSize = parseInt(Env.MAX_UPLOAD_SIZE, 10) * 1024 * 1024;
    const totalSize = requestData.data.files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > maxUploadSize) {
      const formattedMaxSize = formatFileSize(maxUploadSize);
      return NextResponse.json(
        {
          error: {
            message: `Total files size exceeds the maximum limit of ${formattedMaxSize}`,
            errors: requestData.error,
          },
        },
        { status: 400 },
      );
    }

    const chunkCalculationService: ChunkCalculationService = new ChunkCalculationServiceImpl();

    const resultFiles: { chunks: Chunk[]; relationId: string }[] = [];
    for (const file of requestData.data.files) {
      const chunks = chunkCalculationService.calculateChunks(file.size);
      resultFiles.push({ chunks, relationId: file.relationId });
    }

    return NextResponse.json({ files: resultFiles });
  };

  return unauthorizedRequest(req, rootUserUid, logic);
}
