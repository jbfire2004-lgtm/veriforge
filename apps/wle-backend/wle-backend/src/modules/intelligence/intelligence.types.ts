import type { IntelligenceBundle, NlpResponse } from '@vera/intelligence';

export type IntelligenceQueryDto = {
  companyId?: number;
  projectId?: number;
  workerId?: number;
  equipmentId?: number;
  unionHallId?: number;
};

export type AskVeraDto = { question: string; companyId?: number };

export type IntelligenceApiBundle = IntelligenceBundle & {
  scope: { companyId?: number; projectId?: number };
};

export type { NlpResponse };
