import fs from "node:fs";
import path from "node:path";

export interface EncodedImage {
  label: string;
  base64: string;
  mimeType: string;
}

function guessImageMimeType(imagePath: string): string {
  switch (path.extname(imagePath).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
}

/** Base64-encodes each uploaded photo in upload order, labelling it "Photo N" for the prompt. */
export function encodeImages(imagePaths: string[]): EncodedImage[] {
  return imagePaths.map((imagePath, index) => ({
    label: `Photo ${index + 1}`,
    base64: fs.readFileSync(imagePath).toString("base64"),
    mimeType: guessImageMimeType(imagePath),
  }));
}
