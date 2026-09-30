/** Mirrors backend SiteContactResponseEntity / API JSON */

export interface SiteContactDto {
  id: number;
  siteId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContactsPaginatedDto {
  data: SiteContactDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateSiteContactPayload {
  siteId: number;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface UpdateSiteContactPayload {
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  isPrimary?: boolean;
}
