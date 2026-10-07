import type {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
} from '@prisma/client';

/**
 * Serializable Core Site Risk returned by REST handlers.
 */
export interface CoreSiteRiskEntity {
  id: number;
  title: string;
  description: string | null;
  category: CoreSiteRiskCategory;
  severity: CoreSiteRiskSeverity;
  status: CoreSiteRiskStatus;
  identifiedAt: Date;
  mitigatedAt: Date | null;
  locationNote: string | null;
  companyId: number | null;
  siteId: number | null;
  ownerUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
