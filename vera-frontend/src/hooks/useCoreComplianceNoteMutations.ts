"use client";

import { useCallback, useState } from "react";
import {
  createCoreComplianceNote,
  deleteCoreComplianceNote,
  updateCoreComplianceNote,
  type CoreComplianceNoteDto,
  type CreateCoreComplianceNotePayload,
  type UpdateCoreComplianceNotePayload,
} from "@/src/api/core-compliance-note";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreComplianceNoteMutations() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const create = useCallback(
    async (
      payload: CreateCoreComplianceNotePayload
    ): Promise<CoreComplianceNoteDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const created = await createCoreComplianceNote(payload);
        setSuccess(`Saved compliance note #${created.id} — ${created.title}.`);
        return created;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed. Ensure POST /api/v1/core-compliance-notes is available."
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
      await deleteCoreComplianceNote(id);
      setSuccess(`Compliance note ${id} deleted.`);
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
      payload: UpdateCoreComplianceNotePayload
    ): Promise<CoreComplianceNoteDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await updateCoreComplianceNote(id, payload);
        setSuccess(`Compliance note ${updated.id} updated.`);
        return updated;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed while updating compliance note."
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

