/** Normalized Levenshtein similarity 0–1 */
export declare function fuzzyScore(a: string, b: string): number;
export declare function normalize(s: string): string;
export declare function bestMatch<T extends {
    id: string;
    name: string;
}>(query: string, items: T[], threshold?: number): {
    item: T;
    score: number;
} | null;
//# sourceMappingURL=fuzzy.d.ts.map