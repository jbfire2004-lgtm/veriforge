import type { NetworkContextInput, PrivacyEnvelope } from "../types";

export class PrivacySecurityLayer {
  envelope(ctx: NetworkContextInput): PrivacyEnvelope {
    return {
      differentialPrivacyEpsilon: 0.8,
      federatedLearningRound: Math.floor(Date.now() / 86400000) % 1000,
      anonymizationLevel: "company-hash-only",
      companyIsolation: true,
      encryptedFederation: !ctx.offline,
    };
  }

  sanitizeCompanyData<T extends Record<string, unknown>>(data: T): T {
    const copy = { ...data };
    delete copy.companyId;
    delete copy.workerNames;
    delete copy.equipmentSerial;
    return copy;
  }
}
