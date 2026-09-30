"use client";

import { useCallback, useState } from "react";
import {
  createSafetyObservation,
  deleteSafetyObservation,
  updateSafetyObservation,
  type CreateSafetyObservationPayload,
  type SafetyObservationDto,
  type UpdateSafetyObservationPayload,
} from "@/src/api/safety-observation";
import { unknownToErrorMessage } from "@/lib/core";

export function useSafetyObservationMutations() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const create = useCallback(
    async (
      payload: CreateSafetyObservationPayload
    ): Promise<SafetyObservationDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const created = await createSafetyObservation(payload);
        setSuccess(`Recorded observation #${created.id} — ${created.title}.`);
        return created;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed. Ensure POST /api/v1/safety-observations is available."
        );
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteSafetyObservation(id);
      setSuccess(`Safety observation ${id} deleted.`);
    } catch (e) {
      const msg = unknownToErrorMessage(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setBusy(false);
    }
  }, []);

  const update = useCallback(
    async (
      id: number,
      payload: UpdateSafetyObservationPayload
    ): Promise<SafetyObservationDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await updateSafetyObservation(id, payload);
        setSuccess(`Safety observation ${updated.id} updated.`);
        return updated;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed while updating safety observation."
        );
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  return { busy, error, success, clearMessages, create, update, remove };
}

