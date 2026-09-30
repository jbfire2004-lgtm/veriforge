"use client";

import { useCallback, useState } from "react";
import {
  createCoreSiteRisk,
  deleteCoreSiteRisk,
  updateCoreSiteRisk,
  type CoreSiteRiskDto,
  type CreateCoreSiteRiskPayload,
  type UpdateCoreSiteRiskPayload,
} from "@/src/api/core-site-risk";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreSiteRiskMutations() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const create = useCallback(
    async (payload: CreateCoreSiteRiskPayload): Promise<CoreSiteRiskDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const created = await createCoreSiteRisk(payload);
        setSuccess(`Registered risk #${created.id} — ${created.title}.`);
        return created;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed. Ensure POST /api/v1/core-site-risks is available."
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
      await deleteCoreSiteRisk(id);
      setSuccess(`Site risk ${id} deleted.`);
    } catch (e) {
      const msg = unknownToErrorMessage(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setBusy(false);
    }
  }, []);

  const update = useCallback(
    async (id: number, payload: UpdateCoreSiteRiskPayload): Promise<CoreSiteRiskDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await updateCoreSiteRisk(id, payload);
        setSuccess(`Site risk ${updated.id} updated.`);
        return updated;
      } catch (e) {
        const msg = unknownToErrorMessage(e, "Request failed while updating site risk.");
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

