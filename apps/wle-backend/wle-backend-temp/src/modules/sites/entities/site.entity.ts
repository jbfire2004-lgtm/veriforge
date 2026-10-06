import { Site as SiteRow } from '@prisma/client';

/** Stable JSON shape returned by GET /api/v1/sites/:id */
export interface SiteResponseEntity {
  id: number;
  name: string;
  code: string | null;
  region: string | null;
  active: boolean;
  createdAt: Date;
}

/** Paginated list envelope */
export interface SitesPaginatedEntity {
  data: SiteResponseEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** QR / directory verification payload */
export interface SiteVerificationEntity {
  ok: boolean;
  siteId: number;
  name: string;
  active: boolean;
  code: string | null;
  region: string | null;
  verifiedAt: string;
}

export function toSiteResponse(row: SiteRow): SiteResponseEntity {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    region: row.region,
    active: row.active,
    createdAt: row.createdAt,
  };
}
