// utils/convert-image.util.ts
import sharp from 'sharp';

export async function convertImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1600, 1600, { fit: 'inside' })
    .toFormat('webp')
    .webp({ quality: 80 })
    .toBuffer();
}
