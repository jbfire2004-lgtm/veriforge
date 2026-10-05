export declare function isPrismaUniqueViolation(err: unknown): boolean;
export declare function replayOrConflict<T>(err: unknown, replay: () => Promise<T | null | undefined>, message?: string): Promise<T>;
