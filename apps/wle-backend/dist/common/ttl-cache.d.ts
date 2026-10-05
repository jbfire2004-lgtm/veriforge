export declare class TtlCache<V> {
    private readonly defaultTtlMs;
    private readonly maxEntries;
    private readonly store;
    constructor(defaultTtlMs: number, maxEntries?: number);
    get(key: string): V | undefined;
    set(key: string, value: V, ttlMs?: number): void;
    delete(key: string): void;
    deletePrefix(prefix: string): void;
    getOrSet(key: string, factory: () => Promise<V>, ttlMs?: number): Promise<V>;
}
export declare class ConcurrencyPool {
    private readonly maxConcurrent;
    private active;
    private readonly queue;
    constructor(maxConcurrent: number);
    run<T>(task: () => Promise<T>): Promise<T>;
    get pending(): number;
    get running(): number;
}
