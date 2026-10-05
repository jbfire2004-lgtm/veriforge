import { PmSafetyEventType } from '@prisma/client';
export declare class EventClassificationEngine {
    classifyType(description: string, hint?: PmSafetyEventType): {
        eventType: PmSafetyEventType;
        confidence: number;
        explainability: string[];
    };
    suggestHecaCategory(description: string, energyHint?: string): string;
}
