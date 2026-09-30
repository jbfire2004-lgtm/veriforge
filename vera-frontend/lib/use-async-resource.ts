"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/** Discriminated UI state shared by the verify views and similar single-resource pages. */
export type AsyncResource<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "not-found"; id: number }
  | { status: "error"; message: string };

/** What the parser returns. */
export type ParsedAsyncTarget =
  | { kind: "none" }
  | { kind: "invalid"; raw: string }
  | { kind: "ok"; id: number }
  | { kind: "ok-ref"; ref: string };

const PUBLIC_QR_TOKEN_RE = /^[we]-[a-f0-9-]{20,}$/i;

/** Public verify ref: unguessable token or legacy positive integer. */
export function parseVerifyRefTarget(raw: string | null): ParsedAsyncTarget {
  if (raw == null) return { kind: "none" };
  const trimmed = raw.trim();
  if (trimmed === "") return { kind: "none" };
  if (PUBLIC_QR_TOKEN_RE.test(trimmed)) return { kind: "ok-ref", ref: trimmed };
  return parsePositiveIntTarget(trimmed);
}

/** Default parser: positive integer in canonical form, with no leading zeros. */
export function parsePositiveIntTarget(raw: string | null): ParsedAsyncTarget {
  if (raw == null) return { kind: "none" };
  const trimmed = raw.trim();
  if (trimmed === "") return { kind: "none" };
  if (!/^\d+$/.test(trimmed) || Number(trimmed) < 1) {
    return { kind: "invalid", raw: trimmed };
  }
  return { kind: "ok", id: Number(trimmed) };
}

/** Loader result shape. Pairs with `apiGetSafe`-style modules. */
export type LoaderResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { kind: "NOT_FOUND" | "FAILED"; message: string };
    };

export type UseAsyncResourceOptions<T> = {
  /** Raw identifier driving the resource — typically `searchParams.get("id")`. */
  rawId: string | null;
  /** Defaults to {@link parsePositiveIntTarget}. */
  parser?: (raw: string | null) => ParsedAsyncTarget;
  /** Loader invoked once per parsed numeric id. */
  loader: (id: number) => Promise<LoaderResult<T>>;
  /** Loader for token-based public refs (`ok-ref`). */
  loaderRef?: (ref: string) => Promise<LoaderResult<T>>;
  /** Override the error message for an invalid id. */
  invalidMessage?: string;
};

export type UseAsyncResourceReturn<T> = {
  /** Discriminated state for the UI. */
  result: AsyncResource<T>;
  /** True whenever the parsed target is valid but no loaded record matches it yet. */
  isLoading: boolean;
  /** Surface a transient local error (e.g. malformed QR scan). Cleared on retry. */
  setLocalError: (message: string | null) => void;
  /** Force a reload by clearing the cached record. */
  retry: () => void;
};

type LoadedRecord<T> =
  | { key: string; ok: true; data: T }
  | { key: string; ok: false; kind: "NOT_FOUND" | "FAILED"; message: string };

const DEFAULT_INVALID_MESSAGE = "Enter a positive numeric ID.";

/**
 * Shared async-resource hook for single-record pages driven by a URL parameter.
 *
 * - The URL (or any external string source) is the single source of truth.
 * - All `setState` calls happen after `await`, so the hook is lint-clean under
 *   `react-hooks/set-state-in-effect`.
 * - 404 from the loader maps to a `not-found` UI state; other errors map to `error`.
 * - `setLocalError` lets event handlers (e.g. a QR scan handler) report an error
 *   without going through a load.
 */
export function useAsyncResource<T>(
  options: UseAsyncResourceOptions<T>
): UseAsyncResourceReturn<T> {
  const {
    rawId,
    loader,
    loaderRef,
    parser = parsePositiveIntTarget,
    invalidMessage = DEFAULT_INVALID_MESSAGE,
  } = options;

  const target = useMemo(() => parser(rawId), [parser, rawId]);

  const targetKey =
    target.kind === "ok"
      ? `id:${target.id}`
      : target.kind === "ok-ref"
        ? `ref:${target.ref}`
        : "";

  const [loaded, setLoaded] = useState<LoadedRecord<T> | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading =
    (target.kind === "ok" || target.kind === "ok-ref") &&
    (loaded === null || loaded.key !== targetKey);

  useEffect(() => {
    if (target.kind !== "ok" && target.kind !== "ok-ref") return;
    let cancelled = false;
    void (async () => {
      const res =
        target.kind === "ok-ref"
          ? await (loaderRef ?? loader as (ref: string) => Promise<LoaderResult<T>>)(
              target.ref,
            )
          : await loader(target.id);
      if (cancelled) return;
      if (res.ok) {
        setLoaded({ key: targetKey, ok: true, data: res.data });
      } else {
        setLoaded({
          key: targetKey,
          ok: false,
          kind: res.error.kind,
          message: res.error.message,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [target, targetKey, loader, loaderRef]);

  const result = useMemo<AsyncResource<T>>(() => {
    if (localError != null) return { status: "error", message: localError };
    if (target.kind === "invalid") return { status: "error", message: invalidMessage };
    if (target.kind === "none") return { status: "idle" };
    if (loaded == null || loaded.key !== targetKey) return { status: "loading" };
    if (loaded.ok) return { status: "ok", data: loaded.data };
    if (loaded.kind === "NOT_FOUND") {
      return {
        status: "not-found",
        id: target.kind === "ok" ? target.id : 0,
      };
    }
    return { status: "error", message: loaded.message };
  }, [localError, target, targetKey, loaded, invalidMessage]);

  const retry = useCallback(() => {
    setLocalError(null);
    if (target.kind === "ok" || target.kind === "ok-ref") setLoaded(null);
  }, [target]);

  return { result, isLoading, setLocalError, retry };
}
