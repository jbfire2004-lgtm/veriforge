export class PdfGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfGuardError';
  }
}

/** Reject buffers that are not valid PDF headers (malformed uploads). */
export function assertValidPdfHeader(buffer: Buffer): void {
  if (!buffer || buffer.length < 5) {
    throw new PdfGuardError('PDF file is empty or too small');
  }
  const head = buffer.subarray(0, 4);
  if (
    head.length < 4 ||
    head[0] !== 0x25 ||
    head[1] !== 0x50 ||
    head[2] !== 0x44 ||
    head[3] !== 0x46
  ) {
    throw new PdfGuardError(
      'File does not appear to be a valid PDF (missing %PDF header)',
    );
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new PdfGuardError(`${label} timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
