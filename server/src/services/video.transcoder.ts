import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Walkthrough videos are sometimes uploaded in codecs (e.g. Apple ProRes)
 * that no browser can decode in an HTML5 <video> tag — the element still
 * reports duration from the container, but renders a black frame. Re-encode
 * to H.264/AAC so playback works regardless of the source codec.
 */
export async function transcodeForWeb(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}
