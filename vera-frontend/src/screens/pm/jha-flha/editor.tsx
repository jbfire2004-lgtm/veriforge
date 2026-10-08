"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addJhaControl,
  addJhaFlhaAttachment,
  addJhaHazard,
  createJhaFlha,
  createLibraryControl,
  createLibraryHazard,
  evaluateJhaFlha,
  generateJhaFlhaEngine,
  fetchIndustryPacks,
  fetchJhaFlhaOrchestrator,
  fetchLibrarySuggest,
  getJhaFlha,
  lockJhaFlha,
  reviewJhaFlha,
  setJhaCrew,
  setJhaEquipment,
  setJhaEnergySources,
  signJhaFlha,
  submitJhaFlha,
  updateJhaFlhaDraft,
  type JhaEvaluation,
  type JhaFlhaEngineOutput,
  type JhaFlhaKind,
  type VeraOrchestratorAnalysis,
} from "@/lib/jha-flha";
import { useJhaHazardControlCatalog } from "@/hooks/useJhaHazardControlLibrary";
import {
  ControlSelector,
  HazardSelector,
  JhaAutoSuggestPanel,
  SafetyWorkflowAiPanel,
  SafetyContentGeneratorPanel,
} from "@/components/jha-flha";
import { JhaEnergyWheelPanel } from "@/src/components/pm/JhaEnergyWheelPanel";
import { FlhaReadinessChecklist } from "@/src/components/pm/FlhaReadinessChecklist";
import { JhaJobStepsSection } from "@/src/components/pm/JhaJobStepsSection";
import { deriveEnergyTypes } from "@/src/components/pm/jha-energy-analysis";
import { controlTypeLabel } from "@/src/components/pm/JhaCreatableSelect";
import { type LibraryEntry } from "@/src/components/pm/JhaLibraryPicker";
import {
  getJhaFlhaTemplate,
  type JobStep,
} from "@/src/screens/pm/jha-flha/jha-flha-templates";
import {
  buildSmsWorkflowSteps,
  SmsWorkflowPage,
  SmsWorkflowStepPanel,
  useSmsWorkflowNav,
  type SmsWorkflowToolAction,
} from "@/src/components/sms/workflow";
import { SfButton, SfCard, SfInput, SfSearchSelect } from "@/src/components/safety-forms/ui";
import { SfFloatingTextarea } from "@/src/components/safety-forms/ui/SfFloatingTextarea";

type HazardRow = {
  id: string;
  description: string;
  category?: string | null;
  subcategory?: string | null;
  severity: number;
  likelihood: number;
  energyTypes?: unknown;
};

type ControlRow = {
  id: string;
  hazardId?: string | null;
  controlType: string;
  description: string;
  adequate?: boolean | null;
};

type WorkerRow = {
  id: string;
  workerId: number;
  role?: string | null;
  signedAt?: string | null;
};

type EquipmentRow = {
  id: string;
  equipmentId: number;
  authorized: boolean;
  equipment?: { id: number; name: string };
};

type AttachmentRow = {
  id: string;
  fileName: string;
  mimeType?: string | null;
  dataUrl?: string | null;
  createdAt?: string;
};

type Props = {
  id?: string;
  projectId: number;
  companyId: number;
  /** Set from /new/flha or /new/jha — locks form type for new records */
  initialKind?: JhaFlhaKind;
};

export default function JhaFlhaEditorPage({ id, projectId, companyId, initialKind }: Props) {
  const router = useRouter();
  const [recordId, setRecordId] = useState(id);
  const [kind, setKind] = useState<JhaFlhaKind>(initialKind ?? "FLHA");
  const template = useMemo(() => getJhaFlhaTemplate(kind), [kind]);
  const [taskDescription, setTaskDescription] = useState("");
  const [workScope, setWorkScope] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [weather, setWeather] = useState("");
  const [musterPoint, setMusterPoint] = useState("");
  const [firstAidLocation, setFirstAidLocation] = useState("");
  const [permitsInPlace, setPermitsInPlace] = useState("");
  const [conditionsChanged, setConditionsChanged] = useState("");
  const [referenceJhaNote, setReferenceJhaNote] = useState("");
  const [requiredTraining, setRequiredTraining] = useState("");
  const [readinessChecks, setReadinessChecks] = useState<Record<string, boolean>>({});
  const [jobSteps, setJobSteps] = useState<JobStep[]>([]);
  const [selectedJobStepId, setSelectedJobStepId] = useState("");
  const [hazards, setHazards] = useState<HazardRow[]>([]);
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [equipmentLinks, setEquipmentLinks] = useState<EquipmentRow[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [equipmentIdInput, setEquipmentIdInput] = useState("");
  const [selectedEnergy, setSelectedEnergy] = useState<string[]>([]);
  const [crewWorkerId, setCrewWorkerId] = useState("");
  const [selectedHazardId, setSelectedHazardId] = useState<string>("");
  const [evaluation, setEvaluation] = useState<JhaEvaluation | null>(null);
  const [orchestrator, setOrchestrator] = useState<VeraOrchestratorAnalysis | null>(null);
  const [engineOutput, setEngineOutput] = useState<JhaFlhaEngineOutput | null>(null);
  const [engineBusy, setEngineBusy] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [suggestedHazards, setSuggestedHazards] = useState<LibraryEntry[]>([]);
  const [suggestedControls, setSuggestedControls] = useState<LibraryEntry[]>([]);
  const [suggestionWarnings, setSuggestionWarnings] = useState<string[]>([]);
  const [crewOftenAdds, setCrewOftenAdds] = useState<{
    hazards: LibraryEntry[];
    controls: LibraryEntry[];
  }>({ hazards: [], controls: [] });
  const [missedHazards, setMissedHazards] = useState<LibraryEntry[]>([]);
  const [missedControls, setMissedControls] = useState<LibraryEntry[]>([]);
  const [hecaNotes, setHecaNotes] = useState<string[]>([]);
  const [matchedProfiles, setMatchedProfiles] = useState<string[]>([]);
  const [industryPackLabels, setIndustryPackLabels] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (id) setRecordId(id);
  }, [id]);

  function buildEnvironmentalJson() {
    return {
      weather,
      musterPoint,
      firstAidLocation,
      permitsInPlace,
      conditionsChanged,
      referenceJhaNote,
      requiredTraining,
      readinessChecks,
      jobSteps,
    };
  }

  async function persistScope() {
    if (!recordId) return;
    await updateJhaFlhaDraft(recordId, {
      taskDescription: taskDescription || (kind === "JHA" ? "Job analysis" : "Daily field work"),
      workScope: workScope || undefined,
      locationNote,
      environmentalJson: buildEnvironmentalJson(),
    }).catch(() => undefined);
  }

  function persistScopeFields(next: Partial<ReturnType<typeof buildEnvironmentalJson>>) {
    if (next.readinessChecks !== undefined) setReadinessChecks(next.readinessChecks);
    if (next.jobSteps !== undefined) {
      setJobSteps(next.jobSteps);
      if (next.jobSteps.length && !selectedJobStepId) {
        setSelectedJobStepId(next.jobSteps[0].id);
      }
    }
    if (recordId) {
      void updateJhaFlhaDraft(recordId, {
        environmentalJson: { ...buildEnvironmentalJson(), ...next },
      }).catch(() => undefined);
    }
  }

  const load = useCallback(async (overrideId?: string) => {
    const idToLoad = overrideId ?? recordId;
    if (!idToLoad) return;
    const row = await getJhaFlha(idToLoad);
    if (!mountedRef.current) return;
    if (overrideId) setRecordId(overrideId);
    setTaskDescription(String(row.taskDescription ?? ""));
    setWorkScope(String(row.workScope ?? ""));
    setLocationNote(String(row.locationNote ?? ""));
    setKind((row.kind as JhaFlhaKind) ?? initialKind ?? "FLHA");
    setStatus(String(row.status ?? "DRAFT"));
    const env = (row.environmentalJson ?? {}) as Record<string, unknown>;
    setWeather(String(env.weather ?? ""));
    setMusterPoint(String(env.musterPoint ?? ""));
    setFirstAidLocation(String(env.firstAidLocation ?? ""));
    setPermitsInPlace(String(env.permitsInPlace ?? ""));
    setConditionsChanged(String(env.conditionsChanged ?? ""));
    setReferenceJhaNote(String(env.referenceJhaNote ?? ""));
    setRequiredTraining(String(env.requiredTraining ?? ""));
    setReadinessChecks((env.readinessChecks as Record<string, boolean>) ?? {});
    const loadedSteps = (env.jobSteps as JobStep[]) ?? [];
    setJobSteps(loadedSteps);
    if (loadedSteps.length) setSelectedJobStepId(loadedSteps[0].id);
    const nextHazards = (row.hazards as HazardRow[]) ?? [];
    setHazards(nextHazards);
    setControls((row.controls as ControlRow[]) ?? []);
    setWorkers((row.workers as WorkerRow[]) ?? []);
    setEquipmentLinks((row.equipmentLinks as EquipmentRow[]) ?? []);
    setAttachments((row.attachments as AttachmentRow[]) ?? []);
    const energySources = (row.energySources as Array<{ energyType: string }>) ?? [];
    setSelectedEnergy(energySources.map((e) => e.energyType));
    if (nextHazards.length) {
      setSelectedHazardId((prev) =>
        prev && nextHazards.some((h) => h.id === prev) ? prev : nextHazards[0].id,
      );
    }
  }, [recordId]);

  const {
    hazards: hazardCatalog,
    controls: controlCatalog,
    hazardCounts,
    controlCounts,
    ready: catalogReady,
    error: catalogError,
    aiLoading,
    aiResult,
    aiError,
    runAiIdentify,
    reload: reloadCatalog,
    session,
    tokenReady,
    authLoading: catalogAuthLoading,
  } = useJhaHazardControlCatalog(companyId, projectId);

  const hazardLibrary = useMemo(
    () => hazardCatalog as unknown as Array<Record<string, unknown>>,
    [hazardCatalog],
  );
  const controlLibrary = useMemo(
    () => controlCatalog as unknown as Array<Record<string, unknown>>,
    [controlCatalog],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchIndustryPacks(companyId)
      .then((res) => {
        if (!cancelled && mountedRef.current) setIndustryPackLabels(res.labels ?? []);
      })
      .catch(() => undefined);
    if (recordId) void load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [recordId, companyId, projectId, load]);

  const derivedEnergy = useMemo(
    () => deriveEnergyTypes(hazards, controls, controlLibrary),
    [hazards, controls, controlLibrary],
  );

  useEffect(() => {
    if (derivedEnergy.length === 0) return;
    setSelectedEnergy((prev) => {
      const missing = derivedEnergy.filter((e) => !prev.includes(e));
      if (missing.length === 0) return prev;
      const merged = Array.from(new Set([...prev, ...missing]));
      if (recordId) {
        void setJhaEnergySources(
          recordId,
          merged.map((energyType) => ({ energyType, exposureLevel: 3 })),
        ).catch(() => undefined);
      }
      return merged;
    });
  }, [derivedEnergy, recordId]);

  const selectedHazard = useMemo(
    () => hazards.find((h) => h.id === selectedHazardId),
    [hazards, selectedHazardId],
  );
  const selectedHazardEnergies = useMemo(
    () =>
      Array.isArray(selectedHazard?.energyTypes)
        ? (selectedHazard.energyTypes as string[])
        : [],
    [selectedHazard],
  );

  useEffect(() => {
    if (hazards.length === 0) return;
    const valid = hazards.some((h) => h.id === selectedHazardId);
    if (!valid) {
      setSelectedHazardId(hazards[0].id);
    }
  }, [hazards, selectedHazardId]);

  useEffect(() => {
    let cancelled = false;
    if (!taskDescription.trim()) {
      setSuggestLoading(false);
      setSuggestError(null);
      return;
    }
    setSuggestLoading(true);
    setSuggestError(null);
    void fetchLibrarySuggest({
      companyId,
      projectId,
      taskDescription,
      locationNote,
      weather,
      hazardCategories: hazards.map((h) => h.category).filter(Boolean) as string[],
      energyTypes: selectedEnergy,
      existingHazardDescriptions: hazards.map((h) => h.description),
      existingControlDescriptions: controls.map((c) => c.description),
      focusedHazardCategory: selectedHazard?.category ?? undefined,
      focusedHazardEnergyTypes: selectedHazardEnergies,
      focusedHazardDescription: selectedHazard?.description,
    })
      .then((res) => {
        if (cancelled || !mountedRef.current) return;
        setSuggestedHazards(
          (res.suggestedHazards ?? []).map((h) => ({
            id: String(h.id ?? h.description),
            category: String(h.category ?? ""),
            description: String(h.description),
            score: h.score,
            reason: h.reason,
          })),
        );
        setSuggestedControls(
          (res.suggestedControls ?? []).map((c) => ({
            id: String(c.id ?? c.description),
            controlType: String(c.controlType ?? ""),
            description: String(c.description),
            controlClass: String(c.controlClass ?? "alternative"),
            score: c.score,
            reason: c.reason,
          })),
        );
        setSuggestionWarnings(res.warnings ?? []);
        setMissedHazards(
          (res.missedHazards ?? []).map((h) => ({
            id: String(h.id ?? h.description),
            category: String(h.category ?? ""),
            description: String(h.description),
            score: h.score,
            reason: h.reason,
          })),
        );
        setMissedControls(
          (res.missedControls ?? []).map((c) => ({
            id: String(c.id ?? c.description),
            controlType: String(c.controlType ?? ""),
            description: String(c.description),
            controlClass: String(c.controlClass ?? "alternative"),
            score: c.score,
            reason: c.reason,
          })),
        );
        setHecaNotes(res.hecaNotes ?? []);
        setMatchedProfiles(res.matchedTaskProfiles ?? []);
        setCrewOftenAdds({
          hazards: (res.crewOftenAdds?.hazards ?? []).map((h) => ({
            description: h.description,
            category: h.category,
            count: h.count,
            reason: h.reason,
          })),
          controls: (res.crewOftenAdds?.controls ?? []).map((c) => ({
            description: c.description,
            controlType: c.controlType,
            count: c.count,
            reason: c.reason,
          })),
        });
        const required = res.requiredEnergyTypes ?? [];
        const missingEnergy = required.filter((e) => !selectedEnergy.includes(e));
        if (missingEnergy.length > 0) {
          const merged = Array.from(new Set([...selectedEnergy, ...missingEnergy]));
          setSelectedEnergy(merged);
          if (recordId) {
            void setJhaEnergySources(
              recordId,
              merged.map((energyType) => ({ energyType, exposureLevel: 3 })),
            ).catch(() => undefined);
          }
        }
      })
      .catch((e) => {
        if (!cancelled && mountedRef.current) {
          setSuggestError(e instanceof Error ? e.message : "Suggestions unavailable");
        }
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) setSuggestLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    companyId,
    projectId,
    taskDescription,
    locationNote,
    weather,
    hazards,
    controls,
    selectedEnergy,
    selectedHazardId,
    selectedHazard,
    selectedHazardEnergies,
  ]);

  async function ensureRecord() {
    if (recordId) {
      await updateJhaFlhaDraft(recordId, {
        taskDescription: taskDescription || (kind === "JHA" ? "Job analysis" : "Daily field work"),
        workScope: workScope || undefined,
        locationNote,
        environmentalJson: buildEnvironmentalJson(),
      }).catch(() => undefined);
      return recordId;
    }
    const row = await createJhaFlha({
      kind,
      companyId,
      projectId,
      taskDescription: taskDescription || (kind === "JHA" ? "Job analysis" : "Daily field work"),
      workScope: workScope || undefined,
      locationNote,
      environmentalJson: buildEnvironmentalJson(),
    });
    const newId = String(row.id);
    setRecordId(newId);
    router.replace(`/pm/jha-flha/${newId}?projectId=${projectId}&companyId=${companyId}`);
    return newId;
  }

  async function afterMutation(rid: string) {
    await load(rid);
    if (!mountedRef.current) return;
    const ev = await evaluateJhaFlha(rid);
    if (!mountedRef.current) return;
    setEvaluation(ev);
  }

  async function persistEnergy(types: string[]) {
    setSelectedEnergy(types);
    if (!recordId) return;
    await setJhaEnergySources(
      recordId,
      types.map((energyType) => ({ energyType, exposureLevel: 3 })),
    );
    await load();
  }

  async function addHazardFromLibrary(entry: Record<string, unknown>) {
    const rid = await ensureRecord();
    const stepRef =
      template.sections.jobSteps && selectedJobStepId
        ? `step:${selectedJobStepId}`
        : undefined;
    await addJhaHazard(rid, {
      description: String(entry.description),
      category: String(entry.category ?? ""),
      subcategory: stepRef,
      severity: Number(entry.defaultSeverity ?? 3),
      likelihood: Number(entry.defaultLikelihood ?? 3),
      energyTypes: (entry.defaultEnergyTypes as string[]) ?? [],
    });
    await afterMutation(rid);
  }

  async function addCustomHazard(description?: string, category = "Field") {
    const text = (description ?? "").trim();
    if (!text) return;
    const rid = await ensureRecord();
    const stepRef =
      template.sections.jobSteps && selectedJobStepId
        ? `step:${selectedJobStepId}`
        : undefined;
    await addJhaHazard(rid, { description: text, category, subcategory: stepRef });
    await afterMutation(rid);
  }

  async function addControlFromLibrary(entry: Record<string, unknown>) {
    const rid = await ensureRecord();
    await addJhaControl(rid, {
      hazardId: selectedHazardId || undefined,
      controlType: String(entry.controlType ?? "administrative"),
      description: String(entry.description),
      adequate: true,
    });
    await afterMutation(rid);
  }

  async function addCustomControl(description?: string, controlType = "administrative") {
    const text = (description ?? "").trim();
    if (!text) return;
    const rid = await ensureRecord();
    await addJhaControl(rid, {
      hazardId: selectedHazardId || undefined,
      controlType,
      description: text,
      adequate: true,
    });
    await afterMutation(rid);
  }

  async function refreshLibraries() {
    await reloadCatalog();
  }

  async function addCrewMember() {
    const workerId = parseInt(crewWorkerId, 10);
    if (!workerId) return;
    const rid = await ensureRecord();
    const existing = workers.map((w) => ({ workerId: w.workerId, role: w.role ?? undefined }));
    await setJhaCrew(rid, [...existing, { workerId, role: "WORKER" }]);
    setCrewWorkerId("");
    await load();
  }

  async function addEquipmentLink() {
    const equipmentId = parseInt(equipmentIdInput, 10);
    if (!equipmentId) return;
    const rid = await ensureRecord();
    const items = [
      ...equipmentLinks.map((e) => ({
        equipmentId: e.equipmentId,
        authorized: e.authorized,
      })),
      { equipmentId, authorized: true },
    ];
    await setJhaEquipment(rid, items);
    setEquipmentIdInput("");
    await load();
  }

  async function toggleEquipmentAuthorized(equipmentId: number, authorized: boolean) {
    if (!recordId) return;
    const items = equipmentLinks.map((e) => ({
      equipmentId: e.equipmentId,
      authorized: e.equipmentId === equipmentId ? authorized : e.authorized,
    }));
    await setJhaEquipment(recordId, items);
    await load();
  }

  async function onAttachmentFile(file: File) {
    const rid = await ensureRecord();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    await addJhaFlhaAttachment(rid, {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataUrl,
    });
    await load();
  }

  async function runGenerateEngine() {
    if (!taskDescription.trim()) return;
    setEngineBusy(true);
    setError(null);
    try {
      const out = await generateJhaFlhaEngine({
        task_description: taskDescription,
        task_steps: jobSteps.map((s) => s.title),
        environment: {
          weather,
          location: locationNote,
          confined_space: workScope.toLowerCase().includes("confined"),
          heights:
            workScope.toLowerCase().includes("height") ||
            workScope.toLowerCase().includes("ladder") ||
            workScope.toLowerCase().includes("roof"),
          traffic: workScope.toLowerCase().includes("traffic") || workScope.toLowerCase().includes("vehicle"),
        },
        kind,
        companyId,
        projectId,
      });
      setEngineOutput(out);
      const rid = await ensureRecord();
      if (template.sections.jobSteps) {
        const steps: JobStep[] = out.jha_steps.map((s, i) => ({
          id: `engine-step-${i}`,
          order: i + 1,
          title: s.step.replace(/^\d+[\).\]]\s*/, ""),
        }));
        await persistScopeFields({ jobSteps: steps });
      }
      for (const step of out.jha_steps) {
        for (const h of step.hazards) {
          await addJhaHazard(rid, {
            description: h.description,
            category: h.category,
            severity: h.sif_potential ? 4 : 3,
            likelihood: 3,
          });
        }
        for (const c of step.controls) {
          await addJhaControl(rid, {
            controlType: c.hierarchy === "ppe" ? "ppe" : c.hierarchy,
            description: c.description,
            adequate: true,
          });
        }
      }
      const energies = out.energy_wheel.map((w) => w.energy_type);
      if (energies.length) {
        await setJhaEnergySources(
          rid,
          energies.map((energyType) => ({ energyType, exposureLevel: 3 })),
        );
      }
      await afterMutation(rid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Engine generation failed");
    } finally {
      setEngineBusy(false);
    }
  }

  async function runEvaluate() {
    const rid = await ensureRecord();
    const [ev, orch] = await Promise.all([
      evaluateJhaFlha(rid),
      fetchJhaFlhaOrchestrator(rid).catch(() => null),
    ]);
    setEvaluation(ev);
    setOrchestrator(orch);
  }

  async function runSubmit() {
    setError(null);
    setSaving(true);
    try {
      const rid = await ensureRecord();
      if (selectedEnergy.length) {
        await setJhaEnergySources(
          rid,
          selectedEnergy.map((energyType) => ({ energyType, exposureLevel: 3 })),
        );
      }
      await submitJhaFlha(rid);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  async function runWorkerSign(workerId: number) {
    if (!recordId) return;
    await signJhaFlha(recordId, {
      role: "WORKER",
      workerId,
      signatureData: `worker-${workerId}-${Date.now()}`,
      signerName: `Worker ${workerId}`,
    });
    await load();
  }

  async function runApprove() {
    if (!recordId) return;
    await signJhaFlha(recordId, {
      role: "SUPERVISOR",
      signatureData: `supervisor-${Date.now()}`,
      signerName: "Supervisor",
    });
    await reviewJhaFlha(recordId, "approve", reviewNotes || undefined);
    await load();
  }

  async function runReviewAction(action: "reject" | "request_changes") {
    if (!recordId) return;
    await reviewJhaFlha(recordId, action, reviewNotes || undefined);
    await load();
  }

  async function runLock() {
    if (!recordId) return;
    await lockJhaFlha(recordId);
    await load();
  }

  const controlClassByDesc = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of controlLibrary) {
      map.set(String(c.description), String(c.controlClass ?? "alternative"));
    }
    for (const c of controls) {
      if (!map.has(c.description)) {
        map.set(c.description, c.controlType === "ppe" || c.controlType === "administrative" ? "alternative" : "direct");
      }
    }
    return map;
  }, [controlLibrary, controls]);

  const controlClassCounts = useMemo(() => {
    let direct = 0;
    let alternative = 0;
    for (const c of controlLibrary) {
      if (c.controlClass === "direct") direct += 1;
      else alternative += 1;
    }
    return { direct, alternative };
  }, [controlLibrary]);

  const editable = status === "DRAFT" || status === "REJECTED";
  const kindLocked = Boolean(recordId || initialKind);

  const hazardsByStep = useMemo(() => {
    if (!template.sections.jobSteps) return null;
    const groups = new Map<string, HazardRow[]>();
    for (const h of hazards) {
      const key = h.subcategory?.startsWith("step:") ? h.subcategory.slice(5) : "_unassigned";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(h);
    }
    return groups;
  }, [hazards, template.sections.jobSteps]);

  const [activeStep, setActiveStep] = useState("overview");
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const workflowSteps = useMemo(
    () =>
      buildSmsWorkflowSteps({
        hazards: { label: "Hazards", shortLabel: "Hazards" },
        controls: { label: "Controls", shortLabel: "Controls" },
      }),
    [],
  );
  const workflowNav = useSmsWorkflowNav(workflowSteps, activeStep, setActiveStep);

  const toolActions: SmsWorkflowToolAction[] = [
    {
      id: "photo",
      label: "Add photo",
      onClick: () => {
        setActiveStep("attachments");
        attachmentInputRef.current?.click();
      },
      disabled: !editable,
    },
    {
      id: "hazard",
      label: "Add hazard",
      onClick: () => setActiveStep("hazards"),
      disabled: !editable,
    },
    {
      id: "corrective_action",
      label: "Add control",
      onClick: () => setActiveStep("controls"),
      disabled: !editable,
    },
    {
      id: "note",
      label: "Add note",
      onClick: () => setActiveStep("overview"),
      disabled: !editable,
    },
    {
      id: "signature",
      label: "Add signature",
      onClick: () => setActiveStep("signatures"),
      disabled: !editable,
    },
  ];

  return (
    <SmsWorkflowPage
      title={recordId ? template.shortTitle : `New ${template.shortTitle}`}
      status={status}
      description={`${template.title} · project #${projectId}`}
      steps={workflowSteps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      toolActions={editable ? toolActions : undefined}
      showToolDrawer={editable}
      footer={{
        onBack: workflowNav.isFirst ? undefined : workflowNav.goBack,
        onNext: workflowNav.isLast ? undefined : workflowNav.goNext,
        onSaveDraft: editable ? () => void persistScope() : undefined,
        onSubmit: editable && workflowNav.isLast ? () => void runSubmit() : undefined,
        showBack: !workflowNav.isFirst,
        showNext: !workflowNav.isLast,
        showSaveDraft: editable,
        showSubmit: editable && workflowNav.isLast,
        submitLabel: saving ? "Submitting…" : template.labels.submit,
        saving,
        error,
        extra:
          activeStep === "review" && template.sections.riskEvaluation ? (
            <div className="mb-2">
              <SfButton type="button" onClick={() => void runEvaluate()}>
                Evaluate
              </SfButton>
            </div>
          ) : activeStep === "review" &&
              template.sections.supervisorApproval &&
              (status === "UNDER_REVIEW" || status === "SUBMITTED" || status === "APPROVED") &&
              recordId ? (
            <div className="mb-2 flex w-full flex-col gap-2">
              {(status === "UNDER_REVIEW" || status === "SUBMITTED") ? (
                <SfFloatingTextarea
                  label="Supervisor review notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(status === "UNDER_REVIEW" || status === "SUBMITTED") ? (
                  <>
                    <SfButton variant="secondary" type="button" onClick={() => void runApprove()}>
                      Approve
                    </SfButton>
                    <SfButton
                      variant="secondary"
                      type="button"
                      onClick={() => void runReviewAction("request_changes")}
                    >
                      Request changes
                    </SfButton>
                    <SfButton type="button" onClick={() => void runReviewAction("reject")}>
                      Reject
                    </SfButton>
                  </>
                ) : null}
                {status === "APPROVED" ? (
                  <SfButton variant="secondary" type="button" onClick={() => void runLock()}>
                    Lock record
                  </SfButton>
                ) : null}
              </div>
            </div>
          ) : undefined,
      }}
    >
      <SmsWorkflowStepPanel step="overview" activeStep={activeStep}>
      {!recordId ? (
        <SfCard className="space-y-3 p-4">
          {!kindLocked ? (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-[var(--sf-text-muted)]">Form type:</span>
              {(["FLHA", "JHA"] as JhaFlhaKind[]).map((k) => (
                <SfButton
                  key={k}
                  variant={kind === k ? "primary" : "secondary"}
                  type="button"
                  onClick={() => setKind(k)}
                >
                  {getJhaFlhaTemplate(k).shortTitle}
                </SfButton>
              ))}
            </div>
          ) : null}
          <p className="text-sm text-[var(--sf-text-muted)]">{template.purpose}</p>
        </SfCard>
      ) : (
        <SfCard className="p-4">
          <p className="text-sm font-medium">{template.title}</p>
          <p className="text-xs text-[var(--sf-text-muted)]">{template.purpose}</p>
        </SfCard>
      )}

      {(template.sections.workScopeBrief || template.sections.workScopeFull) ? (
      <SfCard className="space-y-4 p-5">
        <h2 className="font-medium">{template.labels.workScope}</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">{template.labels.workScopeHint}</p>
        <SfInput
          placeholder={template.labels.taskPlaceholder}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onBlur={() => void persistScope()}
          disabled={!editable}
        />
        {template.sections.workScopeFull ? (
          <SfFloatingTextarea
            label="Overall work scope / job description"
            value={workScope}
            onChange={(e) => setWorkScope(e.target.value)}
            onBlur={() => void persistScope()}
            disabled={!editable}
            rows={3}
          />
        ) : null}
        <SfInput
          placeholder="Work location / area"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          onBlur={() => void persistScope()}
          disabled={!editable}
        />
        <SfInput
          placeholder="Weather / site conditions"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          onBlur={() => void persistScope()}
          disabled={!editable}
        />
        {editable ? (
          <SfButton
            type="button"
            variant="secondary"
            disabled={!taskDescription.trim() || engineBusy}
            onClick={() => void runGenerateEngine()}
          >
            {engineBusy ? "Generating…" : "Generate hazards & controls (JHA_FLHA_ENGINE)"}
          </SfButton>
        ) : null}
        {template.sections.flhaConditionsChanged ? (
          <SfFloatingTextarea
            label="What changed since the job plan or last FLHA?"
            value={conditionsChanged}
            onChange={(e) => setConditionsChanged(e.target.value)}
            onBlur={() => void persistScope()}
            disabled={!editable}
            rows={2}
          />
        ) : null}
        {template.sections.flhaReferenceJha ? (
          <SfInput
            placeholder="Reference approved JHA (number, title, or link)"
            value={referenceJhaNote}
            onChange={(e) => setReferenceJhaNote(e.target.value)}
            onBlur={() => void persistScope()}
            disabled={!editable}
          />
        ) : null}
        {template.sections.siteReadiness ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <SfInput
                placeholder="Muster point / emergency assembly area"
                value={musterPoint}
                onChange={(e) => setMusterPoint(e.target.value)}
                onBlur={() => void persistScope()}
                disabled={!editable}
              />
              <SfInput
                placeholder="First aid kit / AED location"
                value={firstAidLocation}
                onChange={(e) => setFirstAidLocation(e.target.value)}
                onBlur={() => void persistScope()}
                disabled={!editable}
              />
            </div>
            <SfFloatingTextarea
              label="Permits in place (hot work, confined space, excavation, etc.)"
              value={permitsInPlace}
              onChange={(e) => setPermitsInPlace(e.target.value)}
              onBlur={() => void persistScope()}
              disabled={!editable}
              rows={2}
            />
          </>
        ) : null}
        {template.sections.flhaReadinessChecklist ? (
          <FlhaReadinessChecklist
            value={readinessChecks}
            onChange={(next) => persistScopeFields({ readinessChecks: next })}
            disabled={!editable}
          />
        ) : null}
      </SfCard>
      ) : null}

      {engineOutput ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">Toolbox talk summary</h2>
          <p className="text-sm">{engineOutput.field_summary}</p>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">
              Supervisor verification questions
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {engineOutput.verification_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </SfCard>
      ) : null}

      {template.sections.jobSteps ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">2. Job steps</h2>
          <JhaJobStepsSection
            steps={jobSteps}
            selectedStepId={selectedJobStepId}
            onSelectStep={setSelectedJobStepId}
            disabled={!editable}
            onChange={(next) => persistScopeFields({ jobSteps: next })}
          />
        </SfCard>
      ) : null}

      {template.sections.smartSuggestions && taskDescription.trim() ? (
        <SfCard className="space-y-3 border-indigo-200 bg-indigo-50/40 p-5">
          <JhaAutoSuggestPanel
            taskDescription={taskDescription}
            editable={editable}
            saving={saving}
            suggestLoading={suggestLoading}
            suggestError={suggestError}
            matchedTaskProfiles={matchedProfiles}
            taskHazardSuggestions={suggestedHazards.map((h) => ({
              id: h.id ?? h.description,
              category: h.category ?? "Field",
              description: h.description,
              defaultSeverity: 3,
              defaultLikelihood: 3,
              defaultEnergyTypes: h.defaultEnergyTypes ?? [],
              score: h.score ?? 0,
              reason: h.reason ?? "Suggested for this task",
            }))}
            hazardControlSuggestions={suggestedControls.map((c) => ({
              id: c.id ?? c.description,
              controlType: c.controlType ?? "administrative",
              description: c.description,
              hazardCategories: [],
              energyTypes: [],
              ppeRequired: false,
              controlClass: (c.controlClass === "direct" ? "direct" : "alternative") as
                | "direct"
                | "alternative",
              score: c.score ?? 0,
              reason: c.reason ?? "Suggested for selected hazards",
            }))}
            suggestionLimit={template.suggestionLimit}
            aiLoading={aiLoading}
            aiError={aiError}
            aiResult={aiResult}
            selectedHazardId={selectedHazardId}
            onRunAiIdentify={() =>
              void runAiIdentify({ taskDescription, workScope, locationNote }).then((res) => {
                if (!res?.hazards?.length) return;
                setSuggestedHazards(
                  res.hazards.map((h) => ({
                    id: h.id,
                    category: h.category,
                    description: h.description,
                    defaultEnergyTypes: h.defaultEnergyTypes,
                    score: h.score,
                    reason: h.reason,
                  })),
                );
                setMatchedProfiles(res.matchedTaskProfiles ?? []);
              })
            }
            onAddHazard={(h) =>
              void addHazardFromLibrary({
                description: h.description,
                category: h.category,
                defaultEnergyTypes: h.defaultEnergyTypes ?? [],
              })
            }
            onAddControl={(c) =>
              void addControlFromLibrary({
                controlType: c.controlType,
                description: c.description,
              })
            }
          />
          <p className="text-xs text-indigo-900">
            Control library: {controlLibrary.length} total ({controlClassCounts.direct} direct,{" "}
            {controlClassCounts.alternative} alternative).
          </p>
          {missedHazards.length > 0 || missedControls.length > 0 || hecaNotes.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50/80 p-3">
              <p className="text-xs font-semibold uppercase text-amber-900">Gap check — items you may have missed</p>
              {missedHazards.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-amber-800">Possible missing hazards</p>
                  <div className="flex flex-wrap gap-2">
                    {missedHazards.map((h) => (
                      <button
                        key={h.description}
                        type="button"
                        disabled={!editable || saving}
                        title={h.reason}
                        className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50"
                        onClick={() =>
                          void addHazardFromLibrary({
                            description: h.description,
                            category: h.category,
                            defaultEnergyTypes: h.defaultEnergyTypes ?? [],
                          })
                        }
                      >
                        + {h.description.slice(0, 48)}
                        {h.description.length > 48 ? "…" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {missedControls.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-amber-800">Possible missing controls</p>
                  <div className="flex flex-wrap gap-2">
                    {missedControls.map((c) => (
                      <button
                        key={c.description}
                        type="button"
                        disabled={!editable || saving || !selectedHazardId}
                        title={c.reason}
                        className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-950 hover:bg-amber-100 disabled:opacity-50"
                        onClick={() =>
                          void addControlFromLibrary({
                            controlType: c.controlType,
                            description: c.description,
                          })
                        }
                      >
                        + [{c.controlClass === "direct" ? "Direct" : "Alt"}] {c.description.slice(0, 40)}
                        {c.description.length > 40 ? "…" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {hecaNotes.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-xs text-amber-900">
                  {hecaNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : !suggestLoading && !suggestError ? (
            <p className="text-xs text-indigo-800">
              No gaps flagged yet — keep adding hazards and controls, or refine the task description.
            </p>
          ) : null}
          {suggestionWarnings.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-xs text-indigo-900">
              {suggestionWarnings.slice(0, 5).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </SfCard>
      ) : null}

      {taskDescription.trim() ? (
        <SfCard className="p-0">
          <SafetyWorkflowAiPanel
            task={taskDescription}
            companyId={companyId}
            projectId={projectId}
            workflowType={kind}
            workerIds={workers.map((w) => w.workerId)}
            taskSteps={jobSteps.map((s) => s.description).filter(Boolean)}
            workScope={workScope || undefined}
            locationNote={locationNote || undefined}
            equipment={equipmentLinks.map((e) => e.equipment?.name ?? `Equipment #${e.equipmentId}`)}
            environment={{
              weather: weather || undefined,
              location: locationNote || undefined,
            }}
            existingHazardDescriptions={hazards.map((h) => h.description)}
            existingControlDescriptions={controls.map((c) => c.description)}
            editable={editable}
          />
        </SfCard>
      ) : null}

      {taskDescription.trim() ? (
        <SfCard className="p-0">
          <SafetyContentGeneratorPanel
            companyId={companyId}
            projectId={projectId}
            defaultTask={taskDescription}
            defaultContentType={kind === "JHA" ? "jha_template" : "flha_template"}
          />
        </SfCard>
      ) : null}
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="hazards" activeStep={activeStep}>
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">{template.labels.hazards}</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">{template.labels.hazardsHint}</p>
        {template.sections.jobSteps && jobSteps.length > 0 ? (
          <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
            <span className="font-medium">Adding hazards to step:</span>{" "}
            {jobSteps.find((s) => s.id === selectedJobStepId)?.description ||
              "Select a step above"}
          </p>
        ) : template.sections.jobSteps && jobSteps.length === 0 ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Add job steps above before identifying hazards.
          </p>
        ) : null}
        {industryPackLabels.length > 0 ? (
          <p className="text-xs text-[var(--sf-text-muted)]">
            Your industry packs (for suggestions): {industryPackLabels.join(", ")} — full master catalog loaded (
            {hazardLibrary.length} hazards, {controlLibrary.length} controls)
          </p>
        ) : (
          <p className="text-xs text-[var(--sf-text-muted)]">
            Master catalog: {hazardLibrary.length} hazards, {controlLibrary.length} controls
          </p>
        )}
        {catalogError ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {catalogError}
          </p>
        ) : null}
        {!catalogReady && !catalogAuthLoading && tokenReady ? (
          <p className="text-xs text-[var(--sf-text-muted)]">Loading hazard and control library…</p>
        ) : null}
        {editable ? (
          <HazardSelector
            hazards={hazardCatalog}
            categoryCounts={hazardCounts}
            suggested={suggestedHazards}
            missed={missedHazards}
            crewOftenAdds={crewOftenAdds}
            warnings={suggestionWarnings.filter(
              (w) => !w.includes("Selected hazard") && !w.includes("typically needs engineering"),
            )}
            disabled={saving || (template.sections.jobSteps && jobSteps.length === 0)}
            onPick={(entry) =>
              void addHazardFromLibrary({
                description: entry.description,
                category: entry.category,
                defaultSeverity: 3,
                defaultLikelihood: 3,
                defaultEnergyTypes: entry.defaultEnergyTypes ?? [],
              })
            }
            onAddCustom={(text, meta) => {
              void createLibraryHazard({
                companyId,
                projectId,
                category: meta?.category ?? "Field",
                description: text,
              })
                .then(() => refreshLibraries())
                .catch(() => undefined);
              void addCustomHazard(text, meta?.category ?? "Field");
            }}
          />
        ) : null}
        {hazards.length > 0 ? (
          template.sections.jobSteps && hazardsByStep ? (
            <div className="space-y-4">
              {jobSteps.map((step, index) => {
                const stepHazards = hazardsByStep.get(step.id) ?? [];
                if (stepHazards.length === 0) return null;
                return (
                  <div key={step.id} className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
                    <div className="bg-[var(--sf-surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
                      Step {index + 1}: {step.description || "Untitled step"}
                    </div>
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                        <tr>
                          <th className="px-3 py-2 font-medium">Category</th>
                          <th className="px-3 py-2 font-medium">Hazard</th>
                          {template.sections.hazardRiskMatrix ? (
                            <th className="px-3 py-2 font-medium text-right">Risk (S×L)</th>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--sf-border)]">
                        {stepHazards.map((h) => (
                          <tr key={h.id} className="bg-[var(--sf-surface)]">
                            <td className="px-3 py-2">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                {h.category ?? "Field"}
                              </span>
                            </td>
                            <td className="px-3 py-2">{h.description}</td>
                            {template.sections.hazardRiskMatrix ? (
                              <td className="px-3 py-2 text-right tabular-nums text-[var(--sf-text-muted)]">
                                {h.severity}×{h.likelihood}
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              {(hazardsByStep.get("_unassigned")?.length ?? 0) > 0 ? (
                <div className="overflow-hidden rounded-lg border border-amber-300">
                  <div className="bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                    Not linked to a step
                  </div>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-[var(--sf-border)]">
                      {hazardsByStep.get("_unassigned")!.map((h) => (
                        <tr key={h.id}>
                          <td className="px-3 py-2">{h.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--sf-surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Hazard</th>
                  {template.sections.hazardRiskMatrix ? (
                    <th className="px-3 py-2 font-medium text-right">Risk (S×L)</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sf-border)]">
                {hazards.map((h) => (
                  <tr key={h.id} className="bg-[var(--sf-surface)]">
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {h.category ?? "Field"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{h.description}</td>
                    {template.sections.hazardRiskMatrix ? (
                      <td className="px-3 py-2 text-right tabular-nums text-[var(--sf-text-muted)]">
                        {h.severity}×{h.likelihood}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        ) : (
          <p className="text-sm text-[var(--sf-text-muted)]">No hazards identified yet.</p>
        )}
      </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="controls" activeStep={activeStep}>
      {template.sections.controlsPerHazard ? (
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">{template.labels.controls}</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">{template.labels.controlsHint}</p>
        {controlLibrary.length === 0 && hazardLibrary.length > 0 ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Control library did not load — refresh the page. Expected 100+ controls (direct and alternative).
          </p>
        ) : null}
        {editable ? (
          <>
            {hazards.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Add at least one hazard in step 2 first — then choose which hazard to link controls to.
              </div>
            ) : (
              <SfSearchSelect
                label="Hazard to control"
                placeholder="Select hazard…"
                value={selectedHazardId || hazards[0]?.id || ""}
                onChange={setSelectedHazardId}
                disabled={saving}
                options={hazards.map((h) => ({
                  value: h.id,
                  label: h.description,
                  sublabel: h.category ?? undefined,
                }))}
              />
            )}
            <ControlSelector
              controls={controlCatalog}
              controlTypeCounts={controlCounts}
              suggested={suggestedControls}
              missed={missedControls}
              crewOftenAdds={crewOftenAdds}
              warnings={suggestionWarnings}
              selectedHazardCategory={selectedHazard?.category ?? undefined}
              focusedHazardLabel={selectedHazard?.description}
              disabled={saving || hazards.length === 0}
              onPick={(entry) =>
                void addControlFromLibrary({
                  controlType: entry.controlType,
                  description: entry.description,
                })
              }
              onAddCustom={(text, meta) => {
                const hazardCategory =
                  hazards.find((h) => h.id === selectedHazardId)?.category ?? undefined;
                void createLibraryControl({
                  companyId,
                  projectId,
                  controlType: meta?.controlType ?? "administrative",
                  description: text,
                  hazardCategories: hazardCategory ? [hazardCategory] : undefined,
                })
                  .then(() => refreshLibraries())
                  .catch(() => undefined);
                void addCustomControl(text, meta?.controlType ?? "administrative");
              }}
            />
          </>
        ) : null}
        {controls.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-[var(--sf-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--sf-surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Control type</th>
                  <th className="px-3 py-2 font-medium">Measure</th>
                  <th className="px-3 py-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sf-border)]">
                {controls.map((c) => (
                  <tr key={c.id} className="bg-[var(--sf-surface)]">
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          controlClassByDesc.get(c.description) === "direct"
                            ? "bg-indigo-50 text-indigo-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {controlClassByDesc.get(c.description) === "direct" ? "Direct" : "Alternative"}
                      </span>
                      <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                        {controlTypeLabel(c.controlType)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{c.description}</td>
                    <td className="px-3 py-2 text-right">
                      {c.adequate === false ? (
                        <span className="text-amber-700">Gap</span>
                      ) : (
                        <span className="text-green-700">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--sf-text-muted)]">No controls added yet.</p>
        )}
      </SfCard>
      ) : null}

      {template.sections.energyWheel ? (
      <SfCard className="p-5">
        <JhaEnergyWheelPanel
          hazards={hazards}
          controls={controls}
          controlLibrary={controlLibrary}
          value={selectedEnergy}
          onChange={(types) => void persistEnergy(types)}
          disabled={!editable}
          compact={!template.sections.energyWheelDetailed}
        />
      </SfCard>
      ) : null}

      {template.sections.jhaTrainingRequirements ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">5. Training & competency</h2>
          <SfFloatingTextarea
            label="Required training, certifications, or competency for this job"
            value={requiredTraining}
            onChange={(e) => setRequiredTraining(e.target.value)}
            onBlur={() => void persistScope()}
            disabled={!editable}
            rows={3}
          />
        </SfCard>
      ) : null}

      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Equipment authorization</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">
          Link equipment used on this job. Required for safety station JHA gates.
        </p>
        {editable ? (
          <div className="flex gap-2">
            <SfInput
              placeholder="Equipment ID"
              value={equipmentIdInput}
              onChange={(e) => setEquipmentIdInput(e.target.value)}
            />
            <SfButton type="button" onClick={() => void addEquipmentLink()}>
              Link equipment
            </SfButton>
          </div>
        ) : null}
        {equipmentLinks.length ? (
          <ul className="divide-y text-sm">
            {equipmentLinks.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2">
                <span>
                  #{e.equipmentId}
                  {e.equipment?.name ? ` — ${e.equipment.name}` : ""}
                </span>
                {editable ? (
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={e.authorized}
                      onChange={(ev) =>
                        void toggleEquipmentAuthorized(e.equipmentId, ev.target.checked)
                      }
                    />
                    Authorized
                  </label>
                ) : (
                  <span className={e.authorized ? "text-green-700" : "text-amber-700"}>
                    {e.authorized ? "Authorized" : "Not authorized"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--sf-text-muted)]">No equipment linked.</p>
        )}
      </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="attachments" activeStep={activeStep}>
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Attachments</h2>
        {editable ? (
          <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Upload photo or document
            <input
              ref={attachmentInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onAttachmentFile(f);
                e.target.value = "";
              }}
            />
          </label>
        ) : null}
        {attachments.length ? (
          <ul className="space-y-2 text-sm">
            {attachments.map((a) => (
              <li key={a.id} className="rounded border p-2">
                <p className="font-medium">{a.fileName}</p>
                {a.dataUrl?.startsWith("data:image") ? (
                  <img src={a.dataUrl} alt="" className="mt-2 max-h-32 rounded object-cover" />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--sf-text-muted)]">No attachments.</p>
        )}
      </SfCard>
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="signatures" activeStep={activeStep}>
      {template.sections.crewSignatures ? (
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">{template.labels.crew}</h2>
        {editable ? (
          <div className="flex gap-2">
            <SfInput
              placeholder="Worker ID"
              value={crewWorkerId}
              onChange={(e) => setCrewWorkerId(e.target.value)}
            />
            <SfButton type="button" onClick={() => void addCrewMember()}>
              Add crew
            </SfButton>
          </div>
        ) : null}
        {workers.length > 0 ? (
          <ul className="divide-y text-sm">
            {workers.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2">
                <span>
                  Worker #{w.workerId} {w.role ? `(${w.role})` : ""}
                </span>
                {w.signedAt ? (
                  <span className="text-green-600">Signed</span>
                ) : editable ? (
                  <SfButton
                    variant="secondary"
                    type="button"
                    onClick={() => void runWorkerSign(w.workerId)}
                  >
                    Sign
                  </SfButton>
                ) : (
                  <span className="text-[var(--sf-text-muted)]">Pending</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--sf-text-muted)]">No crew assigned.</p>
        )}
      </SfCard>
      ) : (
        <SfCard className="p-5">
          <p className="text-sm text-[var(--sf-text-muted)]">
            No crew signatures are configured for this form template.
          </p>
        </SfCard>
      )}
      </SmsWorkflowStepPanel>

      <SmsWorkflowStepPanel step="review" activeStep={activeStep}>
      {orchestrator ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">VERA analysis — {orchestrator.moduleType}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Facts</p>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {orchestrator.facts.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Analysis</p>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {orchestrator.analysis.map((line) => (
                  <li key={line} className={line.includes("SIF") ? "font-medium text-red-700" : undefined}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-[var(--sf-text-muted)]">Actions</p>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {orchestrator.actions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </SfCard>
      ) : null}

      {template.sections.riskEvaluation && evaluation ? (
        <SfCard className="space-y-2 p-5">
          <h2 className="font-medium">Risk scoring</h2>
          <p className="text-sm">
            SIF {evaluation.sifPotential ? "YES" : "no"} (score {evaluation.sifScore}) · Quality{" "}
            {evaluation.qualityScore} · HECA energy{" "}
            {evaluation.highEnergyFlag ? "HIGH" : "normal"} · Controls{" "}
            {evaluation.controlsAdequate ? "OK" : "gaps"}
            {evaluation.requiresSupervisorReview ? " · Supervisor review required" : ""}
          </p>
          {evaluation.supervisorReviewFlags && evaluation.supervisorReviewFlags.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {evaluation.supervisorReviewFlags.map((f) => (
                <li
                  key={`${f.code}-${f.message}`}
                  className={
                    f.severity === "critical"
                      ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-red-900"
                      : f.severity === "warning"
                        ? "rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"
                        : "rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
                  }
                >
                  {f.message}
                </li>
              ))}
            </ul>
          ) : null}
          {evaluation.missingControls.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-amber-700">
              {evaluation.missingControls.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
          {evaluation.blockSubmission ? (
            <p className="text-sm text-red-600">
              Submission blocked: {evaluation.blockReasons.join("; ")}
            </p>
          ) : null}
        </SfCard>
      ) : null}
      </SmsWorkflowStepPanel>
    </SmsWorkflowPage>
  );
}
