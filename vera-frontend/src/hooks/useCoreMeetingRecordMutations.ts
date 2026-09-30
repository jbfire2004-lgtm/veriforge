"use client";

import { useCallback, useState } from "react";
import {
  createCoreMeetingRecord,
  deleteCoreMeetingRecord,
  updateCoreMeetingRecord,
  type CoreMeetingRecordDto,
  type CreateCoreMeetingRecordPayload,
  type UpdateCoreMeetingRecordPayload,
} from "@/src/api/core-meeting-record";
import { unknownToErrorMessage } from "@/lib/core";

export function useCoreMeetingRecordMutations() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const create = useCallback(
    async (
      payload: CreateCoreMeetingRecordPayload
    ): Promise<CoreMeetingRecordDto> => {
      setBusy(true);
      clearMessages();
      try {
        const row = await createCoreMeetingRecord(payload);
        setSuccess(`Saved meeting record #${row.id} — ${row.title}.`);
        return row;
      } catch (e) {
        const msg = unknownToErrorMessage(
          e,
          "Could not save. Check API and POST /api/v1/core-meeting-records."
        );
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages]
  );

  const update = useCallback(
    async (
      id: number,
      payload: UpdateCoreMeetingRecordPayload
    ): Promise<CoreMeetingRecordDto> => {
      setBusy(true);
      clearMessages();
      try {
        const row = await updateCoreMeetingRecord(id, payload);
        setSuccess(`Meeting record ${row.id} updated.`);
        return row;
      } catch (e) {
        const msg = unknownToErrorMessage(e, "Request failed while updating meeting record.");
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages]
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      setBusy(true);
      clearMessages();
      try {
        await deleteCoreMeetingRecord(id);
        setSuccess(`Meeting record ${id} deleted.`);
      } catch (e) {
        const msg = unknownToErrorMessage(e);
        setError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [clearMessages]
  );

  return { busy, error, success, clearMessages, create, update, remove };
}

