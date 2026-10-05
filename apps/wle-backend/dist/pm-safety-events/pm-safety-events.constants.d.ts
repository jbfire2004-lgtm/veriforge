import { PmSafetyEventType } from '@prisma/client';
export declare const DEFAULT_ROOT_CAUSES: {
    code: string;
    label: string;
    category: string;
}[];
export declare const DEFAULT_CONTRIBUTING_FACTORS: {
    code: string;
    label: string;
    category: string;
}[];
export declare const EVENT_TYPE_KEYWORDS: Record<PmSafetyEventType, string[]>;
export declare const SEVERITY_MATRIX: Record<string, {
    severity: 'low' | 'medium' | 'high' | 'critical';
    likelihood: number;
}>;
