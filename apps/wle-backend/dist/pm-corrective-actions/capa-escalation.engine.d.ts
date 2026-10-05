export type EscalationTrigger = {
    level: number;
    reason: string;
    shouldNotify: boolean;
};
export declare class CapaEscalationEngine {
    evaluate(input: {
        dueAt?: Date | null;
        severity: string;
        sifLinked?: boolean;
        hecaLinked?: boolean;
        equipmentUnsafe?: boolean;
        currentLevel?: number;
        status: string;
    }): EscalationTrigger | null;
}
