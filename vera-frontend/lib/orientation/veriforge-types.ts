export type OrientationDefinitionType =
  | "company"
  | "site"
  | "project"
  | "safety"
  | "trade";

export type OrientationContentMode = "uploaded" | "native" | "hybrid";

export type OrientationContentBlockType =
  | "slide"
  | "text"
  | "video"
  | "quiz"
  | "policy_ack";

export type OrientationContentBlock = {
  id: string;
  type: OrientationContentBlockType;
  title?: string;
  body?: string;
  mediaUrl?: string;
  quiz?: {
    prompt: string;
    choices: string[];
    answerIndex: number;
  };
  policyId?: string;
  order: number;
  meta?: Record<string, unknown>;
};

export type OrientationExpiryRules = {
  durationDays?: number;
  conditions?: string[];
};

export type OrientationDefinition = {
  id: string;
  companyId: number;
  title: string;
  type: OrientationDefinitionType;
  contentMode: OrientationContentMode;
  contentBlocks: OrientationContentBlock[] | unknown;
  version: string;
  isPublished: boolean;
  expiryRules?: OrientationExpiryRules | unknown;
  metadata?: Record<string, unknown> | unknown;
  sourceFileKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OrientationMustCompleteBefore =
  | "arrival"
  | "dispatch"
  | "assignment";

export type OrientationRequirement = {
  id: string;
  orientationId: string;
  companyId: number;
  projectId?: number | null;
  siteId?: number | null;
  tradeId?: string | null;
  unionDispatchType?: string | null;
  mustCompleteBefore: OrientationMustCompleteBefore;
  isActive: boolean;
  orientation?: Pick<
    OrientationDefinition,
    "id" | "title" | "type" | "version" | "isPublished"
  >;
};

export type OrientationCompletionStatus =
  | "completed"
  | "failed"
  | "expired"
  | "pending";

export type OrientationCompletion = {
  id: string;
  workerId: number;
  orientationId: string;
  companyId: number;
  projectId?: number | null;
  completedOn?: string | null;
  expiresOn?: string | null;
  score?: number | null;
  status: OrientationCompletionStatus;
  orientation?: { id: string; title: string; type: string; version: string };
};

export type WorkerOrientationGatingStatus = "allowed" | "blocked" | "warning";

export type WorkerOrientationProfile = {
  workerId: number;
  companyId?: number;
  projectId?: number | null;
  requiredOrientations: Array<{
    requirementId: string;
    orientationId: string;
    title: string;
    type: string;
    mustCompleteBefore: OrientationMustCompleteBefore;
    version: string;
  }>;
  completedOrientations: Array<{
    completionId: string;
    orientationId: string;
    title?: string;
    completedOn?: string | null;
    expiresOn?: string | null;
    score?: number | null;
    status: OrientationCompletionStatus;
  }>;
  missingOrientations: Array<{
    requirementId: string;
    orientationId: string;
    title: string;
    mustCompleteBefore: OrientationMustCompleteBefore;
  }>;
  gatingStatus: WorkerOrientationGatingStatus;
  reason?: string;
};

export type OrientationDeliveryAssignResult = {
  deliveryId: string;
  deepLink: string;
  walletCard: Record<string, unknown>;
  orientation: { id: string; title: string; version: string };
};

export type OrientationDeliveryLinks = {
  workerId: number;
  appDeepLinks: Array<{
    orientationId: string;
    title: string;
    deepLink: string;
    assignedAt: string;
  }>;
  walletCards: unknown[];
};

export function parseContentBlocks(
  raw: OrientationDefinition["contentBlocks"],
): OrientationContentBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b, i) => {
      const block = b as OrientationContentBlock;
      return {
        ...block,
        id: block.id || `block-${i + 1}`,
        order: block.order ?? i,
        type: block.type || "text",
      };
    })
    .sort((a, b) => a.order - b.order);
}
