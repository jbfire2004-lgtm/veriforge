"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, ShieldGridIcon } from "./icons";

export type TrainingModuleLocal = {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  materialName: string | null;
  contentSections: string[];
  quiz: Array<{ id: string; prompt: string; options: string[]; correctIndex: number }>;
  passScore: number;
};

export type TrainingAssignmentLocal = {
  id: string;
  moduleId: string;
  targetType: "user" | "role" | "department";
  targetLabel: string;
  userId: number;
  status: "assigned" | "in_progress" | "completed" | "overdue" | "failed";
  progress: number;
  score: number | null;
  dueAt: string;
  timestamp: string;
  updatedAt: string;
};

export type TrainingCertificateLocal = {
  id: string;
  userName: string;
  moduleTitle: string;
  moduleId: string;
  score: number;
  timestamp: string;
  userId: number;
};

export type TrainingAnalyticsSnapshot = {
  completionRate: number;
  averageScore: number;
  overdueModules: number;
  inProgress: number;
  completed: number;
  totalModules: number;
  totalAssignments: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.training.analytics";

export function persistTrainingAnalytics(snapshot: TrainingAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:training-analytics", { detail: snapshot }),
  );
}

export function readTrainingAnalytics(): TrainingAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrainingAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useTrainingAnalyticsSync(
  fallback: TrainingAnalyticsSnapshot = {
    completionRate: 0,
    averageScore: 0,
    overdueModules: 0,
    inProgress: 0,
    completed: 0,
    totalModules: 3,
    totalAssignments: 0,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<TrainingAnalyticsSnapshot>(
    () => readTrainingAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as TrainingAnalyticsSnapshot);
      } catch {
        // ignore
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<TrainingAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:training-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:training-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function seedModules(): TrainingModuleLocal[] {
  return [
    {
      id: "m-101",
      title: "Lockout-Tagout",
      description: "Control hazardous energy during maintenance operations.",
      category: "safety",
      durationMinutes: 45,
      materialName: "loto-guide.pdf",
      contentSections: [
        "Identify energy sources",
        "Apply lockout devices",
        "Verify zero energy state",
        "Restore equipment safely",
      ],
      quiz: [
        {
          id: "q1",
          prompt: "What must be verified before maintenance begins?",
          options: ["Zero energy state", "Shift schedule", "Tool inventory"],
          correctIndex: 0,
        },
        {
          id: "q2",
          prompt: "Who may remove a lockout device?",
          options: ["Any supervisor", "The worker who applied it", "Any contractor"],
          correctIndex: 1,
        },
      ],
      passScore: 80,
    },
    {
      id: "m-102",
      title: "High-Heat Response",
      description: "Respond to thermal incidents in forge environments.",
      category: "emergency",
      durationMinutes: 30,
      materialName: "heat-response.pdf",
      contentSections: [
        "Recognize heat stress indicators",
        "Activate cooling protocols",
        "Evacuate and report",
      ],
      quiz: [
        {
          id: "q1",
          prompt: "First action for heat stress?",
          options: ["Continue work", "Move to cool zone", "Increase pace"],
          correctIndex: 1,
        },
      ],
      passScore: 80,
    },
    {
      id: "m-103",
      title: "Heavy Lift Safety",
      description: "Safe lifting practices for industrial loads.",
      category: "operations",
      durationMinutes: 40,
      materialName: "lift-safety.pdf",
      contentSections: [
        "Assess load and path",
        "Use approved lifting gear",
        "Communicate lift signals",
      ],
      quiz: [
        {
          id: "q1",
          prompt: "Before a heavy lift, confirm:",
          options: ["Load path clear", "Break schedule", "Uniform color"],
          correctIndex: 0,
        },
      ],
      passScore: 75,
    },
  ];
}

function computeAnalytics(
  modules: TrainingModuleLocal[],
  assignments: TrainingAssignmentLocal[],
): TrainingAnalyticsSnapshot {
  const completed = assignments.filter((item) => item.status === "completed").length;
  const overdueModules = assignments.filter((item) => item.status === "overdue").length;
  const inProgress = assignments.filter((item) => item.status === "in_progress").length;
  const scores = assignments
    .map((item) => item.score)
    .filter((score): score is number => typeof score === "number");
  const averageScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

  return {
    totalModules: modules.length,
    totalAssignments: assignments.length,
    completionRate:
      assignments.length === 0
        ? 0
        : Math.round((completed / assignments.length) * 100),
    averageScore,
    overdueModules,
    inProgress,
    completed,
    timestamp: new Date().toISOString(),
  };
}

export function VeriForgeTrainingEngine() {
  const { push } = useVeriForgeNotifications();
  const [modules, setModules] = React.useState<TrainingModuleLocal[]>(() => seedModules());
  const [assignments, setAssignments] = React.useState<TrainingAssignmentLocal[]>([]);
  const [certificates, setCertificates] = React.useState<TrainingCertificateLocal[]>([]);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("safety");
  const [duration, setDuration] = React.useState("45");
  const [materialName, setMaterialName] = React.useState("");

  const [assignModuleId, setAssignModuleId] = React.useState("m-101");
  const [targetType, setTargetType] = React.useState<"user" | "role" | "department">("role");
  const [targetLabel, setTargetLabel] = React.useState("Worker");
  const [dueAt, setDueAt] = React.useState("");

  const [activeAssignmentId, setActiveAssignmentId] = React.useState<string | null>(null);
  const [sectionIndex, setSectionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [lastResult, setLastResult] = React.useState<{
    score: number;
    passed: boolean;
    passScore: number;
  } | null>(null);

  const liveAssignments = React.useMemo(() => {
    // Overdue classification requires wall-clock comparison.
    // eslint-disable-next-line react-hooks/purity -- intentional overdue evaluation
    const now = Date.now();
    return assignments.map((item) => {
      if (
        item.status !== "completed" &&
        item.status !== "failed" &&
        new Date(item.dueAt).getTime() < now
      ) {
        return { ...item, status: "overdue" as const };
      }
      return item;
    });
  }, [assignments]);

  const analytics = React.useMemo(
    () => computeAnalytics(modules, liveAssignments),
    [liveAssignments, modules],
  );

  React.useEffect(() => {
    persistTrainingAnalytics(analytics);
  }, [analytics]);

  const notifiedOverdueRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const overdue = liveAssignments.filter((item) => item.status === "overdue");
    for (const item of overdue) {
      if (notifiedOverdueRef.current.has(item.id)) continue;
      notifiedOverdueRef.current.add(item.id);
      push({
        category: "training",
        tone: "critical",
        title: "TRAINING OVERDUE",
        message: `Module ${item.moduleId} overdue for ${item.targetLabel}.`,
        forgeStatus: "failed",
        userId: item.userId,
        actionLabel: "Open Training",
      });
    }
  }, [liveAssignments, push]);

  const activeAssignment = liveAssignments.find((item) => item.id === activeAssignmentId) ?? null;
  const activeModule = activeAssignment
    ? modules.find((item) => item.id === activeAssignment.moduleId) ?? null
    : null;

  const createModule = () => {
    if (!title.trim() || !description.trim()) return;
    const created: TrainingModuleLocal = {
      id: `m-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      durationMinutes: Number(duration) || 30,
      materialName: materialName.trim() || null,
      contentSections: ["Introduction", "Core procedure", "Validation"],
      quiz: [
        {
          id: "q1",
          prompt: `Primary objective of ${title.trim()}?`,
          options: ["Operational safety", "Schedule compression", "Cost reduction only"],
          correctIndex: 0,
        },
        {
          id: "q2",
          prompt: "When is training considered complete?",
          options: ["After viewing slides", "After passing score", "After login"],
          correctIndex: 1,
        },
      ],
      passScore: 80,
    };
    setModules((prev) => [created, ...prev]);
    setAssignModuleId(created.id);
    setTitle("");
    setDescription("");
    setMaterialName("");
  };

  const assignModule = () => {
    const now = new Date().toISOString();
    const due =
      dueAt ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const assignment: TrainingAssignmentLocal = {
      id: `assign-${Date.now()}`,
      moduleId: assignModuleId,
      targetType,
      targetLabel,
      userId: 1,
      status: "assigned",
      progress: 0,
      score: null,
      dueAt: new Date(due).toISOString(),
      timestamp: now,
      updatedAt: now,
    };
    setAssignments((prev) => [assignment, ...prev]);
    setActiveAssignmentId(assignment.id);
    setSectionIndex(0);
    setAnswers([]);
    setLastResult(null);
  };

  const startDelivery = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    setSectionIndex(0);
    setAnswers([]);
    setLastResult(null);
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === assignmentId
          ? {
              ...item,
              status: item.status === "overdue" ? "overdue" : "in_progress",
              progress: Math.max(item.progress, 10),
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const advanceSection = () => {
    if (!activeAssignment || !activeModule) return;
    const nextIndex = Math.min(
      sectionIndex + 1,
      activeModule.contentSections.length - 1,
    );
    const progress = Math.round(
      ((nextIndex + 1) / activeModule.contentSections.length) * 80,
    );
    setSectionIndex(nextIndex);
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === activeAssignment.id
          ? {
              ...item,
              progress,
              status: "in_progress",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const submitQuiz = () => {
    if (!activeAssignment || !activeModule) return;
    let correct = 0;
    activeModule.quiz.forEach((question, index) => {
      if (answers[index] === question.correctIndex) correct += 1;
    });
    const score =
      activeModule.quiz.length === 0
        ? 100
        : Math.round((correct / activeModule.quiz.length) * 100);
    const passed = score >= activeModule.passScore;
    setLastResult({ score, passed, passScore: activeModule.passScore });
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === activeAssignment.id
          ? {
              ...item,
              score,
              progress: 100,
              status: passed ? "completed" : "failed",
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    if (passed) {
      setCertificates((prev) => [
        {
          id: `cert-${Date.now()}`,
          userName: activeAssignment.targetLabel,
          moduleTitle: activeModule.title,
          moduleId: activeModule.id,
          score,
          timestamp: new Date().toISOString(),
          userId: activeAssignment.userId,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Training Engine
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Module creation, delivery, scoring, certification, and analytics.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Completion" value={`${analytics.completionRate}%`} />
          <Metric label="Avg Score" value={`${analytics.averageScore}%`} />
          <Metric
            label="Overdue"
            value={String(analytics.overdueModules)}
            critical={analytics.overdueModules > 0}
          />
          <Metric label="In Progress" value={String(analytics.inProgress)} />
        </div>
        <div className="mt-3">
          <VeriForgeProgressBar
            label="Fleet Training Progress"
            value={analytics.completionRate}
          />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            1. Module Creation
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeTextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Module title"
            />
            <VeriForgeTextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Module description"
            />
            <VeriForgeSelect
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={[
                { label: "Safety", value: "safety" },
                { label: "Emergency", value: "emergency" },
                { label: "Operations", value: "operations" },
                { label: "Compliance", value: "compliance" },
              ]}
            />
            <VeriForgeTextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
            <div className="border border-[#424242] bg-[linear-gradient(160deg,#222_0%,#171717_100%)] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[#d0d0d0]">
                Training Material Upload
              </p>
              <VeriForgeTextField
                label="Material File"
                value={materialName}
                onChange={(event) => setMaterialName(event.target.value)}
                placeholder="module-guide.pdf"
              />
            </div>
            <VeriForgeButton className="w-full" onClick={createModule}>
              Create Module
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Module Assignment
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <VeriForgeSelect
              label="Module"
              value={assignModuleId}
              onChange={(event) => setAssignModuleId(event.target.value)}
              options={modules.map((item) => ({
                label: item.title,
                value: item.id,
              }))}
            />
            <VeriForgeSelect
              label="Assign To"
              value={targetType}
              onChange={(event) =>
                setTargetType(event.target.value as "user" | "role" | "department")
              }
              options={[
                { label: "User", value: "user" },
                { label: "Role", value: "role" },
                { label: "Department", value: "department" },
              ]}
            />
            <VeriForgeTextField
              label="Target Label"
              value={targetLabel}
              onChange={(event) => setTargetLabel(event.target.value)}
              placeholder="Worker / SafetyManager / Bay A"
            />
            <VeriForgeTextField
              label="Due Date"
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={assignModule}>
              Assign Module
            </VeriForgeButton>
          </div>
          <div className="mt-3 space-y-2">
            {liveAssignments.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="border border-[#1E6FB8] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d8d8d8]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>
                    {item.moduleId} → {item.targetType}:{item.targetLabel}
                  </span>
                  <VeriForgeButton
                    size="sm"
                    variant="secondary"
                    onClick={() => startDelivery(item.id)}
                  >
                    Deliver
                  </VeriForgeButton>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                  status: {item.status} · progress: {item.progress}% · userId: {item.userId}
                </p>
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Training Delivery
          </h3>
          <VeriForgeDivider className="my-3" />
          {!activeModule || !activeAssignment ? (
            <p className="text-sm text-[#b5b5b5]">
              Assign a module and select Deliver to open the content viewer.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="border border-[#424242] bg-[linear-gradient(145deg,#242424_0%,#161616_100%)] p-4">
                <p className={cn(veriforgeTypography.heading, "text-xs text-[#ffd0d0]")}>
                  {activeModule.title}
                </p>
                <p className="mt-2 text-sm text-[#e0e0e0]">
                  {activeModule.contentSections[sectionIndex]}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeModule.contentSections.map((section, index) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setSectionIndex(index)}
                      className={cn(
                        "border px-2 py-1 text-[10px] uppercase tracking-[0.1em]",
                        index === sectionIndex
                          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.22)] text-[#FAFAFA] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                          : "border-[#424242] bg-[#1f1f1f] text-[#c8c8c8]",
                      )}
                    >
                      Section {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              <VeriForgeProgressBar
                label="Module Completion"
                value={activeAssignment.progress}
              />
              <div className="flex gap-2">
                <VeriForgeButton
                  variant="secondary"
                  onClick={() => setSectionIndex(Math.max(0, sectionIndex - 1))}
                >
                  Previous
                </VeriForgeButton>
                <VeriForgeButton onClick={advanceSection}>Next Section</VeriForgeButton>
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                timestamp: {activeAssignment.updatedAt} · moduleId: {activeAssignment.moduleId} ·
                progress: {activeAssignment.progress}%
              </p>
            </div>
          )}
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Scoring
          </h3>
          <VeriForgeDivider className="my-3" />
          {!activeModule || !activeAssignment ? (
            <p className="text-sm text-[#b5b5b5]">Open a delivery session to unlock scoring.</p>
          ) : (
            <div className="space-y-3">
              {activeModule.quiz.map((question, qIndex) => (
                <div key={question.id} className="border border-[#424242] bg-[#1f1f1f] p-3">
                  <p className="text-sm text-[#f0f0f0]">{question.prompt}</p>
                  <div className="mt-2 space-y-1">
                    {question.options.map((option, oIndex) => {
                      const selected = answers[qIndex] === oIndex;
                      const showCorrect =
                        lastResult && oIndex === question.correctIndex;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[qIndex] = oIndex;
                              return next;
                            })
                          }
                          className={cn(
                            "block w-full border px-2 py-1.5 text-left text-xs",
                            showCorrect
                              ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffe0e0]"
                              : selected
                                ? "border-[#1E6FB8] bg-[#241818] text-[#FAFAFA]"
                                : "border-[#424242] bg-[#181818] text-[#d0d0d0]",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <VeriForgeButton className="w-full" onClick={submitQuiz}>
                Submit Score
              </VeriForgeButton>
              {lastResult ? (
                <div className="border border-[#424242] bg-[#1f1f1f] p-3">
                  <p className="text-sm text-[#d8d8d8]">
                    Score: {lastResult.score}% · Pass threshold: {lastResult.passScore}%
                  </p>
                  {lastResult.passed ? (
                    <span className="mt-2 inline-flex border border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#ffe0e0] shadow-[0_0_12px_rgba(30, 111, 184,.4)]">
                      Passing Score
                    </span>
                  ) : (
                    <span className="mt-2 inline-flex border border-[#424242] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#cfcfcf]">
                      Failed — Retake Required
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldGridIcon className="text-[#1E6FB8]" />
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              5. Certification
            </h3>
          </div>
          <VeriForgeDivider className="mb-3" />
          <div className="space-y-2">
            {certificates.length === 0 ? (
              <p className="text-sm text-[#b5b5b5]">
                Pass a module quiz to forge a certificate card.
              </p>
            ) : (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="border border-[#1E6FB8] bg-[linear-gradient(145deg,#1f1f1f_0%,#141414_100%)] p-4 shadow-[0_0_0_1px_rgba(30, 111, 184,.25),0_0_18px_rgba(30, 111, 184,.2)]"
                >
                  <p className={cn(veriforgeTypography.heading, "text-xs text-[#FAFAFA]")}>
                    VeriForge Certificate
                  </p>
                  <p className="mt-2 text-sm text-[#e8e8e8]">{cert.userName}</p>
                  <p className="text-xs text-[#c0c0c0]">Module: {cert.moduleTitle}</p>
                  <p className="text-xs text-[#c0c0c0]">Score: {cert.score}%</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                    timestamp: {cert.timestamp} · userId: {cert.userId} · moduleId:{" "}
                    {cert.moduleId}
                  </p>
                </div>
              ))
            )}
          </div>
        </VeriForgeFrame>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Analytics
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            {[
              { label: "Completion rate", value: analytics.completionRate },
              { label: "Average score", value: analytics.averageScore },
              {
                label: "Overdue pressure",
                value: Math.min(
                  100,
                  analytics.overdueModules * 25 + analytics.inProgress * 5,
                ),
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.12em] text-[#d0d0d0]">
                    {row.label}
                  </span>
                  <span className="text-[#ffb8b8]">{row.value}%</span>
                </div>
                <div className="h-3 border border-[#424242] bg-[#151515]">
                  <div
                    className="h-full bg-[linear-gradient(90deg,#174F86_0%,#1E6FB8_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <Metric label="Modules" value={String(analytics.totalModules)} />
            <Metric label="Assignments" value={String(analytics.totalAssignments)} />
            <Metric label="Completed" value={String(analytics.completed)} />
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.id}
            className="border border-[#1E6FB8] bg-[#1A1A1A] p-3 shadow-[inset_0_0_0_1px_rgba(30, 111, 184,.15)]"
          >
            <div className="flex items-start gap-2">
              <ForgeBoltIcon className="mt-0.5 text-[#1E6FB8]" />
              <div>
                <h4 className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                  {module.title}
                </h4>
                <p className="mt-1 text-xs text-[#c8c8c8]">{module.description}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#ffcfcf]">
                  {module.category} · {module.durationMinutes} min
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-[#424242] bg-[#1f1f1f] px-3 py-2",
        critical && "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{label}</p>
      <p className="mt-1 text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}
