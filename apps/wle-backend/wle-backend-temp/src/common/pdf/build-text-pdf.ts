/**
 * Minimal multi-line text PDF (PDF 1.4) without external dependencies.
 */
export function buildTextPdfBuffer(meta: {
  title: string;
  subtitle?: string;
  lines: string[];
}): Buffer {
  const bodyLines = [meta.title, meta.subtitle ?? '', '', ...meta.lines].filter(
    (l, i) => i > 1 || l.length > 0 || i === 0,
  );

  const streamOps = [
    'BT',
    '/F1 14 Tf',
    '50 750 Td',
    `(${pdfEscape(bodyLines[0] ?? meta.title)}) Tj`,
    '/F1 10 Tf',
    '0 -18 Td',
  ];

  if (bodyLines[1]) {
    streamOps.push(`(${pdfEscape(bodyLines[1])}) Tj`, '0 -14 Td');
  }
  streamOps.push('0 -8 Td');

  for (let i = 2; i < bodyLines.length; i++) {
    const line = bodyLines[i] || ' ';
    const chunks = wrapLine(line, 90);
    for (const chunk of chunks) {
      streamOps.push(`(${pdfEscape(chunk)}) Tj`, '0 -12 Td');
    }
  }
  streamOps.push('ET');

  const streamContent = streamOps.join('\n');
  const streamObj = `5 0 obj\n<< /Length ${Buffer.byteLength(
    streamContent,
    'utf8',
  )} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const header = '%PDF-1.4\n';
  const o1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const o2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const o3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>\nendobj\n';
  const o4 =
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const o6 = `6 0 obj\n<< /Title (${pdfEscape(
    meta.title,
  )}) /Creator (VERA Platform) >>\nendobj\n`;

  const objects = [o1, o2, o3, o4, streamObj, o6];
  let cursor = Buffer.byteLength(header, 'utf8');
  const offsets: number[] = [];
  for (const o of objects) {
    offsets.push(cursor);
    cursor += Buffer.byteLength(o, 'utf8');
  }

  const body = header + objects.join('');
  const xrefPos = Buffer.byteLength(body, 'utf8');
  const pad = (n: number) => String(n).padStart(10, '0');
  const xref =
    'xref\n0 7\n' +
    '0000000000 65535 f \n' +
    offsets.map((o) => `${pad(o)} 00000 n \n`).join('');

  const trailer =
    'trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' +
    `${xrefPos}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, 'utf8');
}

function pdfEscape(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .slice(0, 500);
}

function wrapLine(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const out: string[] = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(' ', maxLen);
    if (cut < 20) cut = maxLen;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out.length ? out : [''];
}
