"use client";

import { useCallback, useState } from "react";
import {
  createCoreDailyLog,
  deleteCoreDailyLog,
  updateCoreDailyLog,
  type CoreDailyLogDto,
  type CreateCoreDailyLogPayload,
  type UpdateCoreDailyLogPayload,
} from "@/src/api/core-daily-log";
import { unknownToErrorMessage } from "@/lib/core";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";

export function useCoreDailyLogMutations() {
  const { tokenReady } = useVeraAuthOrHook();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const guardToken = useCallback(() => {
    if (!tokenReady) {
      const msg = missingAuthTokenMessage("daily logs");
      setError(msg);
      throw new Error(msg);
    }
  }, [tokenReady]);

  const create = useCallback(
    async (payload: CreateCoreDailyLogPayload): Promise<CoreDailyLogDto> => {
      setBusy(true);
      clearMessages();
      try {
        guardToken();
        const row = await createCoreDailyLog(payload);
        setSuccess(`Saved daily log #${row.id} — ${row.title}.`);
        return row;
      } catch (e) {
        const msg = isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("create a daily log")
          : unknownToErrorMessage(
              e,
              "Request failed. Ensure POST /api/v1/core-daily-logs is available.",
            );
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages, guardToken],
  );

  const update = useCallback(
    async (
      id: number,
      payload: UpdateCoreDailyLogPayload,
    ): Promise<CoreDailyLogDto> => {
      setBusy(true);
      clearMessages();
      try {
        guardToken();
        const row = await updateCoreDailyLog(id, payload);
        setSuccess(`Daily log ${row.id} updated.`);
        return row;
      } catch (e) {
        const msg = isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("update a daily log")
          : unknownToErrorMessage(e, "Request failed while updating daily log.");
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages, guardToken],
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      setBusy(true);
      clearMessages();
      try {
        guardToken();
        await deleteCoreDailyLog(id);
        setSuccess(`Daily log ${id} deleted.`);
      } catch (e) {
        const msg = isMissingAuthTokenError(e)
          ? missingAuthTokenMessage("delete a daily log")
          : unknownToErrorMessage(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages, guardToken],
  );

  return { busy, error, success, clearMessages, create, update, remove, tokenReady };
}
