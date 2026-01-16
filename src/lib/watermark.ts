import sharp from "sharp";
import { config } from "./config";

export async function addWatermarkToImage(inputBuffer: Buffer): Promise<Buffer> {
  const base = sharp(inputBuffer);
  const meta = await base.metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 1200;

  const textSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <text x="${width - 28}" y="${height - 22}"
        font-size="26" text-anchor="end"
        fill="rgba(255,255,255,0.65)"
        font-family="Arial, sans-serif">${config.freeWatermarkText}</text>
    </svg>
  `);

  return await base
    .composite([{ input: textSvg, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export function addWatermarkToCaption(caption: string): string {
  return `${caption}\n\n${config.freeCaptionFooter}`;
}
