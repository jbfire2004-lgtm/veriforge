import { SiteContact as SiteContactRow } from '@prisma/client';

export interface SiteContactResponseEntity {
  id: number;
  siteId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteContactsPaginatedEntity {
  data: SiteContactResponseEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function toSiteContactResponse(
  row: SiteContactRow,
): SiteContactResponseEntity {
  return {
    id: row.id,
    siteId: row.siteId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
