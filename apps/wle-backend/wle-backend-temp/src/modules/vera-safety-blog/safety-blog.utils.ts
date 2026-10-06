export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const PUBLIC_POST_INCLUDE = {
  categoryRel: true,
  tags: { include: { tag: true } },
  relatedFrom: {
    include: {
      toPost: {
        include: {
          categoryRel: true,
          tags: { include: { tag: true } },
        },
      },
    },
  },
} as const;
