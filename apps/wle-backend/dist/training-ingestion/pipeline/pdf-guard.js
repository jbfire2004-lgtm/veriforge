"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGuardError = void 0;
exports.assertValidPdfHeader = assertValidPdfHeader;
exports.withTimeout = withTimeout;
class PdfGuardError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PdfGuardError';
    }
}
exports.PdfGuardError = PdfGuardError;
function assertValidPdfHeader(buffer) {
    if (!buffer || buffer.length < 5) {
        throw new PdfGuardError('PDF file is empty or too small');
    }
    const head = buffer.subarray(0, 4);
    if (head.length < 4 ||
        head[0] !== 0x25 ||
        head[1] !== 0x50 ||
        head[2] !== 0x44 ||
        head[3] !== 0x46) {
        throw new PdfGuardError('File does not appear to be a valid PDF (missing %PDF header)');
    }
}
async function withTimeout(promise, ms, label) {
    let timer;
    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new PdfGuardError(`${label} timed out after ${ms}ms`)), ms);
            }),
        ]);
    }
    finally {
        if (timer)
            clearTimeout(timer);
    }
}
//# sourceMappingURL=pdf-guard.js.map