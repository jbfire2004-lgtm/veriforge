"use client";

import { useCallback, useState } from "react";
import {
  createCoreActionItem,
  deleteCoreActionItem,
  updateCoreActionItem,
  type CoreActionItemDto,
  type CreateCoreActionItemPayload,
  type UpdateCoreActionItemPayload,
} from "@/src/api/core-action-items";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreActionItemMutations() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const create = useCallback(
    async (payload: CreateCoreActionItemPayload): Promise<CoreActionItemDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const created = await createCoreActionItem(payload);
        setSuccess(`Saved. Core action item id: ${created.id} — title "${created.title}".`);
        return created;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Request failed. Ensure the API implements POST /api/v1/core-action-items."
        );
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteCoreActionItem(id);
      setSuccess(`Action item ${id} deleted.`);
    } catch (e) {
      const msg = unknownToErrorMessage(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setBusy(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, payload: UpdateCoreActionItemPayload): Promise<CoreActionItemDto> => {
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        const updated = await updateCoreActionItem(id, payload);
        setSuccess(`Action item ${updated.id} updated.`);
        return updated;
      } catch (e) {
        const msg = unknownToErrorMessage(e, "Request failed while updating action item.");
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

