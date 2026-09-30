import { z } from "zod";

export const AlertSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export type MarketplaceListing = {
  id: string;
  sellerHash: string;
  category: string;
  resourceType: string;
  region: string;
  quantity: number;
  readinessScore: number;
  complianceOk: boolean;
  skills?: string[];
};

export type MarketplaceDemand = {
  id: string;
  buyerHash: string;
  category: string;
  resourceType: string;
  region: string;
  quantity: number;
  urgency: "emergency" | "high" | "normal" | "low";
  requiredSkills?: string[];
};

export type MarketplaceContextInput = {
  companyId?: string;
  region?: string;
  offline?: boolean;
  listings?: MarketplaceListing[];
  demands?: MarketplaceDemand[];
  totalWorkers?: number;
  totalEquipment?: number;
  totalProviders?: number;
  industryRiskScore?: number;
  industryReadinessScore?: number;
  networkSafetyScore?: number;
};

export type MarketplaceMatch = {
  id: string;
  listingId: string;
  demandId: string;
  category: string;
  score: number;
  factors: string[];
  anonymized: boolean;
};

export type CategoryMarketplace = {
  category: string;
  matches: MarketplaceMatch[];
  availabilityMap: { region: string; supply: number; demand: number }[];
  shortagePredictions: { resource: string; deficit: number; region: string }[];
  surplusPredictions: { resource: string; surplus: number; region: string }[];
  recommendations: string[];
};

export type MatchingResult = {
  matches: MarketplaceMatch[];
  skillMatches: number;
  complianceMatches: number;
  readinessMatches: number;
  locationMatches: number;
};

export type PriceQuote = {
  id: string;
  matchId: string;
  basePrice: number;
  adjustedPrice: number;
  factors: string[];
  currency: string;
};

export type PricingResult = {
  quotes: PriceQuote[];
  surgeRegions: string[];
  dynamicMultiplier: number;
};

export type MarketplacePolicy = {
  id: string;
  domain: string;
  rule: string;
  enforced: boolean;
  version: string;
  violation?: boolean;
};

export type ReputationScore = {
  entityHash: string;
  entityType: string;
  score: number;
  reliability: number;
  compliance: number;
  safety: number;
};

export type MarketplaceSimulation = {
  id: string;
  scenario: string;
  supply: number;
  demand: number;
  gap: number;
  recommendation: string;
};

export type MarketplaceDashboard = {
  generatedAt: string;
  listingCount: number;
  demandCount: number;
  matchCount: number;
  transactionReady: number;
  avgMatchScore: number;
  workforceShortages: number;
  equipmentShortages: number;
};

export type MarketplaceReport = {
  generatedAt: string;
  context: MarketplaceContextInput;
  workforce: CategoryMarketplace;
  equipment: CategoryMarketplace;
  training: CategoryMarketplace;
  providers: CategoryMarketplace;
  safetyServices: CategoryMarketplace;
  complianceServices: CategoryMarketplace;
  automation: CategoryMarketplace;
  matching: MatchingResult;
  pricing: PricingResult;
  policies: MarketplacePolicy[];
  reputation: ReputationScore[];
  simulations: MarketplaceSimulation[];
  dashboard: MarketplaceDashboard;
};
