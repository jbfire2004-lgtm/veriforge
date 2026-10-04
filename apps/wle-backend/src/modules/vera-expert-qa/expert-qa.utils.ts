export function slugifyQuestion(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const suffix = Date.now().toString(36).slice(-5);
  return `${base}-${suffix}`;
}

export function attachmentTypeFromMime(
  mime: string,
): 'IMAGE' | 'PDF' | 'OTHER' {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime === 'application/pdf') return 'PDF';
  return 'OTHER';
}

export function excerpt(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max)}…`;
}
