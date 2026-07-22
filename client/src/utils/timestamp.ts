export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return 0;
  const [minutes, seconds] = parts;
  return minutes * 60 + seconds;
}
