import { randomUUID } from 'crypto';
import { FileUpload } from 'graphql-upload-ts';
import { join } from 'path';
import { createWriteStream } from 'fs';
import sharp from 'sharp';

export async function processFile(
  file: FileUpload,
  isImage: boolean,
): Promise<{ filename: string; mimetype: string; path: string }> {
  const { filename, mimetype } = file;
  const stream = file.createReadStream();

  if (isImage) {
    const uniqueName = `${randomUUID()}_${filename.replace(/\..+$/, '')}.webp`;
    const outputPath = join(process.cwd(), 'static', 'uploads', uniqueName);
    const output = createWriteStream(outputPath);

    const transformer = sharp()
      .resize(1600, 1600, { fit: 'inside' })
      .toFormat('webp')
      .webp({ quality: 80 });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(transformer).pipe(output).on('finish', resolve).on('error', reject);
    });

    return { filename: uniqueName, mimetype: 'image/webp', path: `/static/uploads/${uniqueName}` };
  }

  const finalName = `${randomUUID()}_${filename}`;
  const finalPath = join(process.cwd(), 'static', 'uploads', finalName);
  const writeStream = createWriteStream(finalPath);

  await new Promise<void>((resolve, reject) => {
    stream.pipe(writeStream).on('finish', resolve).on('error', reject);
  });

  return { filename: finalName, mimetype, path: `/static/uploads/${finalName}` };
}
