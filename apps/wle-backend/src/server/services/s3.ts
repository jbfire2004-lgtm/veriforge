/** Dev stub when S3 is not configured. Replace with real S3 upload in production. */
export async function uploadToS3(
  _buffer: Buffer,
  filename: string,
): Promise<string> {
  return `https://localhost/dev-upload/${encodeURIComponent(filename)}`;
}
