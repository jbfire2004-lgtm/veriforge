export declare class VeriAgentRedactionService {
    redactText(text: string): {
        text: string;
        ok: boolean;
    };
    redactJsonContext(value: unknown, depth?: number): unknown;
    hashForAudit(text: string): string;
    sanitizeModelJson<T extends Record<string, unknown>>(data: T): T;
}
