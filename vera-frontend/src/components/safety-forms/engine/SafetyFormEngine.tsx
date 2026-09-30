"use client";

import {
  ClipboardList,
  FileWarning,
  MapPin,
  PenLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { safetyFormErrorMessage } from "@/lib/safety-form-errors";
import {
  SfButton,
  SfFormHeader,
  SfProgressTracker,
  SfSection,
  type ProgressStep,
} from "../ui";
import type { SafetyFormEngineProps } from "./types";
import { useSafetyForm } from "./useSafetyForm";
import { visibleFields } from "./conditional";
import { FieldRenderer } from "./FieldRenderer";
import {
  groupFieldsIntoSections,
  isSectionComplete,
} from "./groupFields";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  context: <MapPin className="h-5 w-5" />,
  details: <ClipboardList className="h-5 w-5" />,
  hazards: <FileWarning className="h-5 w-5" />,
  evidence: <PenLine className="h-5 w-5" />,
};

export function SafetyFormEngine({
  definition,
  formId,
  initialData,
  projectId,
  workerId,
  companyId,
  equipmentId,
  readOnly,
  onSaved,
  onSubmitted,
}: SafetyFormEngineProps) {
  const router = useRouter();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState(false);

  const { data, setField, saveDraft, submit, saving, error, formId: activeId } =
    useSafetyForm({
      definition,
      formId,
      initialData,
      projectId,
      workerId,
      companyId,
      equipmentId,
    });

  const visible = visibleFields(definition, data);
  const visibleIds = visible.map((f) => f.id);
  const requiredIds = new Set(
    visible.filter((f) => f.required).map((f) => f.id),
  );

  const sections = useMemo(
    () => groupFieldsIntoSections(definition, visibleIds),
    [definition, visibleIds],
  );

  const progressSteps: ProgressStep[] = useMemo(
    () =>
      sections.map((s, i) => ({
        id: s.id,
        label: s.title,
        complete: isSectionComplete(s, data, requiredIds),
        current: i === 0 || sections[i - 1] ? isSectionComplete(sections[i - 1] ?? s, data, requiredIds) : false,
      })),
    [sections, data, requiredIds],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    try {
      const signatures: Array<{ fieldId: string; signatureData: string }> = [];
      for (const f of definition.fields) {
        if (f.type === "signature" && data[f.id]) {
          signatures.push({
            fieldId: f.id,
            signatureData: String(data[f.id]),
          });
        }
      }
      const id = await submit(signatures);
      onSubmitted?.(id);
      router.push(`/pm/safety-forms/${id}`);
    } catch (err) {
      setSubmitError(safetyFormErrorMessage(err, "Submit failed"));
    }
  }

  function scrollToSection(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="pb-24 lg:pb-8">
      <SfFormHeader
        title={definition.name}
        subtitle={`${definition.category.replace(/-/g, " ")} · v${definition.version}${
          definition.workflow?.requiresSupervisor ? " · Supervisor review" : ""
        }`}
        saving={saving}
        saved={lastSaved && !saving}
        flags={{
          sif: Boolean(data.sifFlag),
          heca: Boolean(data.hecaFlag),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {sections.map((section) => (
            <article
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
            >
              <SfSection
                title={section.title}
                description={section.description}
                icon={SECTION_ICONS[section.id]}
                completed={isSectionComplete(section, data, requiredIds)}
              >
                {section.fieldIds.map((fid) => {
                  const field = definition.fields.find((f) => f.id === fid);
                  if (!field || !visibleIds.includes(fid)) return null;
                  return (
                    <FieldRenderer
                      key={fid}
                      field={field}
                      value={data[fid]}
                      data={data}
                      disabled={readOnly || saving}
                      onChange={setField}
                    />
                  );
                })}
              </SfSection>
            </article>
          ))}

          {(error || submitError) && (
            <p className="rounded-[var(--sf-radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error ?? submitError}
            </p>
          )}
        </div>

        <SfProgressTracker steps={progressSteps} onStepClick={scrollToSection} />
      </div>

      {!readOnly ? (
        <footer className="sf-glass fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--sf-border)] px-4 py-3 lg:static lg:mt-8 lg:rounded-[var(--sf-radius-lg)] lg:border lg:px-6">
          <div className="mx-auto flex max-w-3xl gap-3 lg:max-w-none lg:justify-end">
            <SfButton
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() =>
                void saveDraft().then((id) => {
                  if (id) {
                    setLastSaved(true);
                    onSaved?.(id);
                  }
                })
              }
            >
              Save draft
            </SfButton>
            <SfButton type="submit" disabled={saving} className="flex-1 lg:flex-none">
              {saving ? "Submitting…" : "Submit form"}
            </SfButton>
          </div>
        </footer>
      ) : null}
    </form>
  );
}
