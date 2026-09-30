"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import {
  fetchCoreUploadConfig,
  uploadCoreFile,
  type CoreFileDto,
} from "@/lib/core-upload";
import { uploadTrainingIngestFile } from "@/lib/training-ingestion-v1";
import type { TrainingIngestionRun } from "@/lib/training-ingestion-v1";

type MutationState<TResult> = {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: TResult | null;
};

type QueryState<TResult> = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: TResult | null;
};

function useSimpleMutation<TPayload, TResult>(
  request: (payload: TPayload) => Promise<TResult>
) {
  const [state, setState] = useState<MutationState<TResult>>({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: null,
  });

  const mutate = (payload: TPayload) => {
    setState({
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });

    void request(payload)
      .then((data) => {
        setState({
          isPending: false,
          isSuccess: true,
          isError: false,
          error: null,
          data,
        });
      })
      .catch((error: unknown) => {
        setState({
          isPending: false,
          isSuccess: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
          data: null,
        });
      });
  };

  return { ...state, mutate };
}

function useSimpleQuery<TParams, TResult>(
  request: (params: TParams) => Promise<TResult>,
  params: TParams,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [state, setState] = useState<QueryState<TResult>>({
    isLoading: enabled,
    isError: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let active = true;
    setState({
      isLoading: true,
      isError: false,
      error: null,
      data: null,
    });

    void request(params)
      .then((data) => {
        if (!active) return;
        setState({
          isLoading: false,
          isError: false,
          error: null,
          data,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(String(error)),
          data: null,
        });
      });

    return () => {
      active = false;
    };
  }, [enabled, params, request]);

  return state;
}

/**
 * Legacy-compatible hook surface. Uploads target VERA Core (`/api/v1/core/uploads`)
 * or training ingestion (`/api/v1/training-ingestion/upload`), not removed SPA paths.
 */
export const api = {
  upload: {
    uploadBulkTraining: {
      useMutation: () =>
        useSimpleMutation<
          { companyId: string; file: File },
          TrainingIngestionRun
        >((payload) =>
          uploadTrainingIngestFile(
            payload.file,
            parseInt(payload.companyId, 10),
            {}
          )
        ),
    },
    uploadScanner: {
      useMutation: () =>
        useSimpleMutation<{ workerId: string; file: File }, CoreFileDto>(
          async (payload) => {
            const cfg = await fetchCoreUploadConfig();
            return uploadCoreFile(payload.file, cfg, {
              purpose: `scanner:worker:${payload.workerId}`,
            });
          }
        ),
    },
    uploadBase64: {
      /** Prefer raw `File` upload via Core (no legacy `/upload/base64` route). */
      useMutation: () =>
        useSimpleMutation<{ workerId: string; file: File }, CoreFileDto>(
          async (payload) => {
            const cfg = await fetchCoreUploadConfig();
            return uploadCoreFile(payload.file, cfg, {
              purpose: `camera:worker:${payload.workerId}`,
            });
          }
        ),
    },
    uploadPDF: {
      useMutation: () =>
        useSimpleMutation<{ workerId: string; file: File }, CoreFileDto>(
          async (payload) => {
            const cfg = await fetchCoreUploadConfig();
            return uploadCoreFile(payload.file, cfg, {
              purpose: `pdf:worker:${payload.workerId}`,
            });
          }
        ),
    },
  },
  access: {
    check: {
      useQuery: <TResult = unknown>(
        params: { workerId: string; siteId: string },
        options?: { enabled?: boolean }
      ) =>
        useSimpleQuery<typeof params, TResult>(
          (input) =>
            apiGet(
              `/access/${encodeURIComponent(input.workerId)}/${encodeURIComponent(input.siteId)}`
            ),
          useMemo(() => params, [params.workerId, params.siteId]),
          options
        ),
    },
  },
};
