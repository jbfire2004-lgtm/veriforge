"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOptionalFieldMode } from "@/components/field/FieldModeProvider";
import { submitSafetyFormV2Offline } from "@/lib/field/workflows/safety-form-v2";
import { safetyFormErrorMessage } from "@/lib/safety-form-errors";
import {
  createSafetyForm,
  fetchAutoPopulateContext,
  saveSafetyFormDraft,
  submitSafetyForm,
} from "@/lib/safety-forms";
import type { SafetyFormDefinition } from "./types";

const AUTOSAVE_MS = 4000;

function buildInitialFormData(opts: {
  initialData?: Record<string, unknown>;
  projectId?: number;
  workerId?: number;
  companyId?: number;
  equipmentId?: number;
}): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  return {
    workDate: today,
    ...(opts.projectId != null ? { projectId: opts.projectId } : {}),
    ...(opts.workerId != null ? { workerId: opts.workerId } : {}),
    ...(opts.companyId != null ? { companyId: opts.companyId } : {}),
    ...(opts.equipmentId != null ? { equipmentId: opts.equipmentId } : {}),
    ...(opts.initialData ?? {}),
  };
}

function parseId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function useSafetyForm(opts: {
  definition: SafetyFormDefinition;
  formId?: string;
  initialData?: Record<string, unknown>;
  projectId?: number;
  workerId?: number;
  companyId?: number;
  equipmentId?: number;
}) {
  const [formId, setFormId] = useState(opts.formId);
  const [data, setData] = useState<Record<string, unknown>>(() =>
    buildInitialFormData(opts),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const clientSyncId = useRef(
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : `draft-${Date.now()}`,
  );
  const field = useOptionalFieldMode();
  const offline = Boolean(
    field?.fieldModeActive &&
      !field.isOnline &&
      field.cache &&
      field.queue,
  );

  useEffect(() => {
    if (offline) return;
    const hasContextQuery =
      opts.workerId != null ||
      opts.projectId != null ||
      opts.companyId != null ||
      opts.equipmentId != null;
    if (!hasContextQuery) return;

    void fetchAutoPopulateContext({
      workerId: opts.workerId,
      projectId: opts.projectId,
      companyId: opts.companyId,
      equipmentId: opts.equipmentId,
    })
      .then((ctx) => setData((prev) => ({ ...ctx, ...prev })))
      .catch(() => undefined);
  }, [opts.workerId, opts.projectId, opts.companyId, opts.equipmentId, offline]);

  const ensureForm = useCallback(async () => {
    if (offline) return clientSyncId.current;
    if (formId) return formId;
    const row = await createSafetyForm({
      definitionId: opts.definition.id,
      formData: data,
      projectId: opts.projectId ?? parseId(data.projectId),
      workerId: opts.workerId ?? parseId(data.workerId),
      companyId: opts.companyId,
      equipmentId: opts.equipmentId,
      clientSyncId: clientSyncId.current,
    });
    if (!row?.id) {
      throw new Error("Server did not return a form id for this draft.");
    }
    setFormId(row.id);
    return row.id;
  }, [
    formId,
    data,
    opts.definition.id,
    opts.projectId,
    opts.workerId,
    opts.companyId,
    opts.equipmentId,
    offline,
  ]);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (offline && field?.cache && field?.queue) {
        await submitSafetyFormV2Offline(field.cache, field.queue, {
          definitionId: opts.definition.id,
          formData: data,
          companyId: opts.companyId,
          projectId: opts.projectId,
          siteId: undefined,
          workerId: opts.workerId,
          submit: false,
          draftId: clientSyncId.current,
        });
        return clientSyncId.current;
      }
      const id = await ensureForm();
      await saveSafetyFormDraft(id, data);
      return id;
    } catch (e) {
      setError(safetyFormErrorMessage(e, "Save failed"));
      return undefined;
    } finally {
      setSaving(false);
    }
  }, [
    ensureForm,
    data,
    offline,
    field?.cache,
    field?.queue,
    opts.definition.id,
    opts.companyId,
    opts.projectId,
    opts.workerId,
  ]);

  useEffect(() => {
    if (offline || !dirty) return;
    const t = setTimeout(() => {
      void saveDraft();
    }, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [data, saveDraft, dirty, offline]);

  const setField = useCallback((fieldId: string, value: unknown) => {
    setDirty(true);
    setData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const submit = useCallback(
    async (
      signatures?: Array<{
        fieldId?: string;
        signatureData: string;
        signerName?: string;
      }>,
    ) => {
      setSaving(true);
      setError(null);
      try {
        if (offline && field?.cache && field?.queue) {
          await submitSafetyFormV2Offline(field.cache, field.queue, {
            definitionId: opts.definition.id,
            formData: data,
            companyId: opts.companyId,
            projectId: opts.projectId,
            workerId: opts.workerId,
            submit: true,
            draftId: clientSyncId.current,
            signatures,
          });
          return clientSyncId.current;
        }
        const id = await ensureForm();
        const row = await submitSafetyForm(id, data, signatures);
        return row.id;
      } catch (e) {
        setError(safetyFormErrorMessage(e, "Submit failed"));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      ensureForm,
      data,
      offline,
      field?.cache,
      field?.queue,
      opts.definition.id,
      opts.companyId,
      opts.projectId,
      opts.workerId,
    ],
  );

  return {
    formId: offline ? clientSyncId.current : formId,
    data,
    setField,
    setData,
    saveDraft,
    submit,
    saving,
    error,
    offline: !!offline,
    dirty,
  };
}
