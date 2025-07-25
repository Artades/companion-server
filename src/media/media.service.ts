import { Injectable } from '@nestjs/common';
import { UploadMediaInput } from './inputs/upload-media.input';
import { detectMediaType } from 'src/utils/media-type';
import { convertImage } from 'src/utils/convert-image';
import { processFile } from 'src/utils/process-file';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaType } from '@prisma/client';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadSingleMedia(eventId: string, input: UploadMediaInput, order: number = 1) {
    const { file, caption } = input;
    const type = detectMediaType((await file).mimetype);
    const isImage = type === MediaType.IMAGE;

    const uploadedFile = await processFile(await file, isImage);

    return this.prismaService.eventMedia.create({
      data: {
        eventId,
        url: uploadedFile.path,
        type,
        caption: caption || uploadedFile.filename,
        order,
      },
    });
  }
}
