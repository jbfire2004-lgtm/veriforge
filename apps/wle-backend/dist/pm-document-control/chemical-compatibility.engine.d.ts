export type ChemicalStorageIssue = {
    itemId: string;
    otherItemId: string;
    reason: string;
    severity: 'high' | 'medium';
};
export declare class ChemicalCompatibilityEngine {
    evaluateSiteInventory(items: Array<{
        id: string;
        storageClass?: string | null;
        incompatibleWith?: unknown;
        locationNote?: string | null;
    }>): ChemicalStorageIssue[];
    private pairConflict;
}
