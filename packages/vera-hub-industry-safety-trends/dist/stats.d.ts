/** Small numeric helpers for trend analytics */
export declare function mean(values: number[]): number | null;
export declare function stddev(values: number[]): number | null;
/** Ordinary least-squares slope for y over index 0..n-1 */
export declare function linearSlope(values: number[]): number | null;
export declare function pearson(xs: number[], ys: number[]): number | null;
export declare function clamp(n: number, min?: number, max?: number): number;
export declare function round(n: number, digits?: number): number;
export declare function finiteNumbers(values: Array<number | null | undefined>): number[];
export type Direction = "improving" | "worsening" | "stable" | "insufficient";
/** For rates where lower is better */
export declare function directionFromSlope(slope: number | null, opts?: {
    lowerIsBetter?: boolean;
    epsilon?: number;
}): Direction;
export declare function correlationStrength(r: number | null, n: number): "strong" | "moderate" | "weak" | "none" | "insufficient";
