/**
 * Client-side OCR helper — paste text or optional Tesseract.js integration.
 * Install `tesseract.js` and call `runTesseractOcr` when ready for live image OCR.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "text/plain") {
    return file.text();
  }
  if (file.type.startsWith("image/")) {
    try {
      return await runTesseractOcr(file);
    } catch {
      return "";
    }
  }
  return "";
}

async function runTesseractOcr(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}
