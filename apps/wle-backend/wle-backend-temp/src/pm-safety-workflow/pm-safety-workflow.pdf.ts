/**
 * Minimal PDF 1.4: catalog → pages → one empty page + document info.
 * startxref points at the xref table; offsets are UTF-8 byte counts from file start.
 */
export function buildPmSafetyWorkflowPdfBuffer(meta: {
  id: number;
  title: string;
  status: string;
  kind: string;
}): Buffer {
  const comment = `% VERA id=${meta.id} status=${meta.status} kind=${meta.kind}\n`;
  const header = `%PDF-1.4\n${comment}`;
  const o1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const o2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const o3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n';
  const o4 = `4 0 obj\n<< /Title (${escapePdfString(
    meta.title,
  )}) /Creator (VERA Core) >>\nendobj\n`;

  const objects = [o1, o2, o3, o4];
  let cursor = Buffer.byteLength(header, 'utf8');
  const objOffsets: number[] = [];
  for (const o of objects) {
    objOffsets.push(cursor);
    cursor += Buffer.byteLength(o, 'utf8');
  }

  const body = header + objects.join('');
  const xrefByteOffset = Buffer.byteLength(body, 'utf8');
  const pad10 = (n: number) => String(n).padStart(10, '0');
  const xref =
    'xref\n' +
    '0 5\n' +
    '0000000000 65535 f \n' +
    `${pad10(objOffsets[0])} 00000 n \n` +
    `${pad10(objOffsets[1])} 00000 n \n` +
    `${pad10(objOffsets[2])} 00000 n \n` +
    `${pad10(objOffsets[3])} 00000 n \n`;

  const trailer =
    'trailer\n' +
    '<< /Size 5 /Root 1 0 R >>\n' +
    'startxref\n' +
    `${xrefByteOffset}\n` +
    '%%EOF\n';

  return Buffer.from(body + xref + trailer, 'utf8');
}

function escapePdfString(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .slice(0, 500);
}
