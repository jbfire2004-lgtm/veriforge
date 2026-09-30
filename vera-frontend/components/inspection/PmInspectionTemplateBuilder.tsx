"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  archivePmInspectionTemplate,
  createPmInspectionTemplate,
  getPmInspectionTemplate,
  newPmInspectionTemplateVersion,
  publishPmInspectionTemplate,
  updatePmInspectionTemplate,
  type PmInspectionTemplate,
} from "@/lib/pm-inspections";
import {
  buildTemplatePayload,
  CHECKLIST_ITEM_TYPES,
  defaultScoringRules,
  formatSelectOptions,
  isLeafShowIf,
  newChecklistItem,
  parseSelectOptions,
  parseShowIfEquals,
  reorderChecklistItems,
  RequiredSignatureRow,
  scoringRulesFromTemplate,
  showIfEqualsLabel,
  signaturesFromTemplate,
  TEMPLATE_CATEGORIES,
  TemplateScoringRules,
  validateBuilderForm,
} from "@/lib/pm-inspection-template-builder";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { VeraPageLayout } from "@/src/components/navigation";

type Props = {
  companyId: number;
  projectId: number;
  templateId?: string;
};

const PRESET_SIGNATURES: RequiredSignatureRow[] = [
  { role: "supervisor", label: "Supervisor" },
  { role: "worker", label: "Worker / Inspector" },
];

export function PmInspectionTemplateBuilder({
  companyId,
  projectId,
  templateId,
}: Props) {
  const [loading, setLoading] = useState(Boolean(templateId));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("CUSTOM");
  const [scoringMode, setScoringMode] = useState("pass_fail");
  const [scoringRules, setScoringRules] = useState<TemplateScoringRules>(
    defaultScoringRules(),
  );
  const [items, setItems] = useState<PmInspectionTemplate["items"]>([
    newChecklistItem(),
  ]);
  const [requiredSignatures, setRequiredSignatures] = useState<
    RequiredSignatureRow[]
  >([PRESET_SIGNATURES[0]]);
  const [customSigRole, setCustomSigRole] = useState("");
  const [customSigLabel, setCustomSigLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(templateId ?? null);
  const [status, setStatus] = useState<string>("draft");
  const [version, setVersion] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const readOnly = status === "published";

  const loadTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const tpl = await getPmInspectionTemplate(id);
      setDraftId(tpl.id);
      setName(tpl.name);
      setDescription(tpl.description ?? "");
      setCategory(tpl.category);
      setScoringMode(tpl.scoringMode);
      setScoringRules(scoringRulesFromTemplate(tpl));
      setItems(tpl.items?.length ? tpl.items : [newChecklistItem()]);
      setRequiredSignatures(
        signaturesFromTemplate(tpl).length
          ? signaturesFromTemplate(tpl)
          : [PRESET_SIGNATURES[0]],
      );
      setStatus(tpl.status);
      setVersion(tpl.version ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (templateId) void loadTemplate(templateId);
  }, [templateId, loadTemplate]);

  function togglePresetSignature(role: string, label: string) {
    setRequiredSignatures((list) => {
      const exists = list.some((row) => row.role === role);
      if (exists) return list.filter((row) => row.role !== role);
      return [...list, { role, label }];
    });
  }

  function addCustomSignature() {
    const role = customSigRole.trim();
    if (!role) return;
    if (requiredSignatures.some((row) => row.role === role)) {
      setError(`Signature role already added: ${role}`);
      return;
    }
    setRequiredSignatures((list) => [
      ...list,
      { role, label: customSigLabel.trim() || role },
    ]);
    setCustomSigRole("");
    setCustomSigLabel("");
    setError(null);
  }

  function removeSignature(role: string) {
    setRequiredSignatures((list) => list.filter((row) => row.role !== role));
  }

  function addItem() {
    setItems((list) => [...list, newChecklistItem()]);
  }

  function removeItem(index: number) {
    setItems((list) => {
      if (list.length <= 1) return list;
      return list.filter((_, i) => i !== index);
    });
  }

  function moveItem(index: number, direction: "up" | "down") {
    setItems((list) => reorderChecklistItems(list, index, direction));
  }

  async function archiveDraft() {
    if (!draftId) return;
    if (!window.confirm("Archive this template? It will no longer be available for new inspections.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const archived = await archivePmInspectionTemplate(draftId);
      setStatus(archived.status);
      setSuccess("Template archived");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to archive");
    } finally {
      setBusy(false);
    }
  }

  function updateItem(
    index: number,
    patch: Partial<PmInspectionTemplate["items"][number]>,
  ) {
    setItems((list) => {
      const next = [...list];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function saveDraft() {
    const validation = validateBuilderForm({ name, items });
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = buildTemplatePayload({
        companyId,
        projectId,
        name,
        description,
        category,
        scoringMode,
        items,
        scoringRules,
        requiredSignatures,
      });
      const tpl = draftId
        ? await updatePmInspectionTemplate(draftId, payload)
        : await createPmInspectionTemplate(payload);
      setDraftId(tpl.id);
      setStatus(tpl.status);
      setVersion(tpl.version ?? 1);
      setSuccess("Draft saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save draft");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const validation = validateBuilderForm({ name, items });
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      let id = draftId;
      if (!id || status === "published") {
        const payload = buildTemplatePayload({
          companyId,
          projectId,
          name,
          description,
          category,
          scoringMode,
          items,
          scoringRules,
          requiredSignatures,
        });
        const tpl = id
          ? await updatePmInspectionTemplate(id, payload)
          : await createPmInspectionTemplate(payload);
        id = tpl.id;
        setDraftId(id);
      } else {
        await saveDraftInternal(id);
      }
      const published = await publishPmInspectionTemplate(id);
      setStatus(published.status);
      setSuccess("Template published");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraftInternal(id: string) {
    const payload = buildTemplatePayload({
      companyId,
      projectId,
      name,
      description,
      category,
      scoringMode,
      items,
      scoringRules,
      requiredSignatures,
    });
    await updatePmInspectionTemplate(id, payload);
  }

  async function createNewVersion() {
    if (!draftId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await newPmInspectionTemplateVersion(draftId);
      setDraftId(next.id);
      setStatus(next.status);
      setVersion(next.version ?? version + 1);
      setSuccess(`Draft v${next.version} created — edit and publish when ready`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create version");
    } finally {
      setBusy(false);
    }
  }

  const listHref = `/pm/inspections/templates?projectId=${projectId}&companyId=${companyId}`;

  return (
    <VeraPageLayout
      title={templateId ? "Edit checklist template" : "Build checklist template"}
      description={
        draftId
          ? `${category} · v${version} · ${status}`
          : "Define items, visibility rules, signatures, and scoring"
      }
      actions={
        <Link
          href={listHref}
          className="text-sm text-[var(--sf-primary)] hover:underline"
        >
          ← Templates
        </Link>
      }
    >
      {loading ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading template…</p>
      ) : null}

      {readOnly ? (
        <SfCard className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This template is published and read-only. Create a new version to make
          changes.
          <div className="mt-3">
            <SfButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void createNewVersion()}
            >
              New version
            </SfButton>
          </div>
        </SfCard>
      ) : null}

      <SfCard className="space-y-4 p-5">
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
            value={name}
            disabled={readOnly}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
            rows={2}
            value={description}
            disabled={readOnly}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Category
          <select
            className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
            value={category}
            disabled={readOnly}
            onChange={(e) => setCategory(e.target.value)}
          >
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Scoring mode
          <select
            className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
            value={scoringMode}
            disabled={readOnly}
            onChange={(e) => setScoringMode(e.target.value)}
          >
            <option value="pass_fail">Pass / fail</option>
            <option value="weighted">Weighted</option>
          </select>
        </label>
      </SfCard>

      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">Scoring rules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Fail threshold (%)
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
              value={scoringRules.failThresholdPercent ?? ""}
              disabled={readOnly}
              onChange={(e) =>
                setScoringRules((rules) => ({
                  ...rules,
                  failThresholdPercent: Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="block text-sm">
            Review threshold (risk score)
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
              value={scoringRules.reviewThresholdRisk ?? ""}
              disabled={readOnly}
              onChange={(e) =>
                setScoringRules((rules) => ({
                  ...rules,
                  reviewThresholdRisk: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>
        <p className="text-xs text-[var(--sf-text-muted)]">
          Inspection fails below the fail threshold. Supervisor review is flagged
          when risk exceeds the review threshold.
        </p>
      </SfCard>

      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">Required signatures</h2>
        {PRESET_SIGNATURES.map((preset) => (
          <label key={preset.role} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requiredSignatures.some((row) => row.role === preset.role)}
              disabled={readOnly}
              onChange={() =>
                togglePresetSignature(preset.role, preset.label ?? preset.role)
              }
            />
            Require {preset.label} signature before submit
          </label>
        ))}
        <ul className="space-y-1 text-sm">
          {requiredSignatures
            .filter(
              (row) => !PRESET_SIGNATURES.some((p) => p.role === row.role),
            )
            .map((row) => (
              <li
                key={row.role}
                className="flex items-center justify-between rounded border px-2 py-1"
              >
                <span>
                  {row.label ?? row.role}{" "}
                  <span className="text-xs text-[var(--sf-text-muted)]">
                    ({row.role})
                  </span>
                </span>
                {!readOnly ? (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => removeSignature(row.role)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
        </ul>
        {!readOnly ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              Custom role
              <input
                className="mt-0.5 block rounded border px-2 py-1 text-sm"
                value={customSigRole}
                onChange={(e) => setCustomSigRole(e.target.value)}
              />
            </label>
            <label className="text-xs">
              Label
              <input
                className="mt-0.5 block rounded border px-2 py-1 text-sm"
                value={customSigLabel}
                onChange={(e) => setCustomSigLabel(e.target.value)}
              />
            </label>
            <SfButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={addCustomSignature}
            >
              Add signature
            </SfButton>
          </div>
        ) : null}
      </SfCard>

      <SfCard className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Checklist items</h2>
          {!readOnly ? (
            <SfButton type="button" variant="secondary" size="sm" onClick={addItem}>
              Add item
            </SfButton>
          ) : null}
        </div>
        {items.map((item, idx) => (
          <div key={item.id} className="space-y-2 rounded border p-3">
            <div className="flex items-start justify-between gap-2">
              <input
                className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                value={item.label}
                disabled={readOnly}
                onChange={(e) => updateItem(idx, { label: e.target.value })}
              />
              <div className="flex shrink-0 flex-col gap-1">
                {!readOnly ? (
                  <>
                    <button
                      type="button"
                      className="text-xs text-[var(--sf-text-muted)] hover:underline disabled:opacity-40"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, "up")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="text-xs text-[var(--sf-text-muted)] hover:underline disabled:opacity-40"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, "down")}
                    >
                      ↓
                    </button>
                  </>
                ) : null}
                {!readOnly && items.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => removeItem(idx)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <select
              className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
              value={item.type}
              disabled={readOnly}
              onChange={(e) => updateItem(idx, { type: e.target.value })}
            >
              {CHECKLIST_ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(item.required)}
                  disabled={readOnly}
                  onChange={(e) => updateItem(idx, { required: e.target.checked })}
                />
                Required
              </label>
              {(item.type === "pass_fail" || item.type === "numeric") && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(item.critical)}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateItem(idx, { critical: e.target.checked })
                    }
                  />
                  Critical if failed
                </label>
              )}
            </div>
            {item.type === "select" ? (
              <label className="block text-xs">
                Options (comma-separated)
                <input
                  className="mt-0.5 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                  value={formatSelectOptions(item.options)}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateItem(idx, { options: parseSelectOptions(e.target.value) })
                  }
                />
              </label>
            ) : null}
            {scoringMode === "weighted" &&
            (item.type === "pass_fail" || item.type === "numeric") ? (
              <label className="block text-xs">
                Weight
                <input
                  type="number"
                  min={0}
                  className="mt-0.5 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                  value={item.weight ?? 1}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateItem(idx, { weight: Number(e.target.value) })
                  }
                />
              </label>
            ) : null}
            {idx > 0 ? (
              <div className="space-y-1 text-xs text-[var(--sf-text-muted)]">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(item.showIf)}
                    disabled={readOnly}
                    onChange={(e) => {
                      const parent = items[idx - 1];
                      updateItem(
                        idx,
                        e.target.checked
                          ? { showIf: { itemId: parent.id, equals: true } }
                          : { showIf: undefined },
                      );
                    }}
                  />
                  Conditional visibility (showIf)
                </label>
                {item.showIf && isLeafShowIf(item.showIf) ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block">
                      When item
                      <select
                        className="mt-0.5 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                        value={item.showIf.itemId}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateItem(idx, {
                            showIf: {
                              itemId: e.target.value,
                              equals: item.showIf && isLeafShowIf(item.showIf)
                                ? item.showIf.equals
                                : true,
                            },
                          })
                        }
                      >
                        {items.slice(0, idx).map((prior) => (
                          <option key={prior.id} value={prior.id}>
                            {prior.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      Equals
                      <select
                        className="mt-0.5 w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                        value={showIfEqualsLabel(
                          isLeafShowIf(item.showIf) ? item.showIf.equals : true,
                        )}
                        disabled={readOnly}
                        onChange={(e) =>
                          updateItem(idx, {
                            showIf: {
                              itemId: isLeafShowIf(item.showIf)
                                ? item.showIf.itemId
                                : items[idx - 1].id,
                              equals: parseShowIfEquals(e.target.value),
                            },
                          })
                        }
                      >
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="needs review">Text: needs review</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </SfCard>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-700" role="status">
          {success}
          {status === "published" && draftId ? (
            <>
              {" "}
              <Link
                href={`/pm/inspections/new?templateId=${draftId}`}
                className="underline"
              >
                Start inspection
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap gap-3">
          <SfButton type="button" disabled={busy} onClick={() => void saveDraft()}>
            {busy ? "Saving…" : "Save draft"}
          </SfButton>
          <SfButton
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void publish()}
          >
            {busy ? "Publishing…" : "Publish"}
          </SfButton>
          {draftId && status === "draft" ? (
            <SfButton
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void archiveDraft()}
            >
              Archive
            </SfButton>
          ) : null}
        </div>
      ) : null}
    </VeraPageLayout>
  );
}
