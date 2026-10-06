import { resolvePublicBaseUrl } from '../../config/public-base-url';

export function resolveSiteUrl(): string {
  return resolvePublicBaseUrl();
}

export function absoluteUrl(path: string, base?: string): string {
  const site = base ?? resolveSiteUrl();
  if (path.startsWith('http')) return path;
  return `${site}${path.startsWith('/') ? path : `/${path}`}`;
}
