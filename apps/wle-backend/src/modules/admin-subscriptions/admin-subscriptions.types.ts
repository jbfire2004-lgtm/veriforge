export type SubscriptionDisplayTier =
  | 'Free'
  | 'Core'
  | 'PM'
  | 'Full Suite'
  | 'Custom';

export type SubscriptionRowDto = {
  id: string;
  companyId: number | null;
  companyName: string;
  tenantId: string | null;
  tier: SubscriptionDisplayTier;
  tierKey: string;
  seatsPurchased: number;
  seatsUsed: number;
  modulesEnabled: string[];
  renewalDate: string | null;
  status: string;
  location: {
    city: string | null;
    province: string | null;
    lat: number | null;
    lng: number | null;
  };
  industry: string | null;
  activeUsers: number;
  churnRiskScore: number;
  createdAt: string;
};

export type SubscriptionMapPinDto = {
  companyId: number;
  companyName: string;
  lat: number;
  lng: number;
  tier: SubscriptionDisplayTier;
  seatsUsed: number;
  seatsPurchased: number;
  modulesEnabled: string[];
  renewalDate: string | null;
  status: string;
};

export type SubscriptionSummaryDto = {
  totalCompanies: number;
  totalActiveUsers: number;
  totalSeatsPurchased: number;
  totalSeatsUsed: number;
  averageSeatsPerCompany: number;
  topTierAdoption: { tier: string; count: number };
  fastestGrowingModule: { module: string; growthPercent: number };
  companiesAtRisk: number;
  companiesNearSeatLimit: number;
  adoptionByTier: Record<string, number>;
  adoptionByModule: Record<string, number>;
};

export type SubscriptionGrowthDto = {
  newCompaniesByMonth: Record<string, number>;
  newUsersByMonth: Record<string, number>;
  seatUpgradesByMonth: Record<string, number>;
};
