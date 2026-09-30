"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon } from "./icons";

export type WorkflowType =
  | "training"
  | "verification"
  | "compliance"
  | "incident"
  | "audit";

export type WorkflowNodeKind = "start" | "action" | "decision" | "end" | "warning";
export type WorkflowNodeShape = "rectangle" | "diamond" | "hex";
export type WorkflowTrigger = "time" | "event" | "completion" | "manual";
export type WorkflowActionType =
  | "assign_training"
  | "start_verification"
  | "send_notification"
  | "run_compliance"
  | "open_incident"
  | "ingest_audit";

export type WorkflowNodeLocal = {
  nodeId: string;
  type: WorkflowNodeKind;
  shape: WorkflowNodeShape;
  label: string;
  x: number;
  y: number;
  timestamp: string;
  trigger?: WorkflowTrigger;
  actionType?: WorkflowActionType;
  condition?: string;
};

export type WorkflowConnectorLocal = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  branch?: "yes" | "no" | "default";
};

export type WorkflowDefinitionLocal = {
  id: string;
  name: string;
  type: WorkflowType;
  description: string;
  nodes: WorkflowNodeLocal[];
  connectors: WorkflowConnectorLocal[];
};

type DragState = {
  nodeId: string;
  offsetX: number;
  offsetY: number;
} | null;

const NODE_W = 140;
const NODE_H = 56;

function seedWorkflow(type: WorkflowType): WorkflowDefinitionLocal {
  const ts = new Date().toISOString();
  const actionByType: Record<
    WorkflowType,
    { label: string; actionType: WorkflowActionType }
  > = {
    training: { label: "Assign Training", actionType: "assign_training" },
    verification: { label: "Start forgeCheck", actionType: "start_verification" },
    compliance: { label: "Run Compliance", actionType: "run_compliance" },
    incident: { label: "Open Incident", actionType: "open_incident" },
    audit: { label: "Ingest Audit", actionType: "ingest_audit" },
  };
  const action = actionByType[type];
  return {
    id: `wf-${type}-local`,
    name: `${type.toUpperCase()} Workflow`,
    type,
    description: `Industrial ${type} workflow rail with decision branching.`,
    nodes: [
      {
        nodeId: "n-start",
        type: "start",
        shape: "hex",
        label: "START",
        x: 36,
        y: 150,
        timestamp: ts,
        trigger: "manual",
      },
      {
        nodeId: "n-action",
        type: "action",
        shape: "rectangle",
        label: action.label,
        x: 230,
        y: 145,
        timestamp: ts,
        actionType: action.actionType,
        trigger: "event",
      },
      {
        nodeId: "n-decision",
        type: "decision",
        shape: "diamond",
        label: "Success?",
        x: 450,
        y: 130,
        timestamp: ts,
        condition: "outcome === pass",
      },
      {
        nodeId: "n-end",
        type: "end",
        shape: "rectangle",
        label: "END",
        x: 680,
        y: 70,
        timestamp: ts,
      },
      {
        nodeId: "n-warn",
        type: "warning",
        shape: "rectangle",
        label: "BREAK",
        x: 680,
        y: 230,
        timestamp: ts,
      },
    ],
    connectors: [
      { id: "c1", fromNodeId: "n-start", toNodeId: "n-action", branch: "default" },
      { id: "c2", fromNodeId: "n-action", toNodeId: "n-decision", branch: "default" },
      {
        id: "c3",
        fromNodeId: "n-decision",
        toNodeId: "n-end",
        label: "YES",
        branch: "yes",
      },
      {
        id: "c4",
        fromNodeId: "n-decision",
        toNodeId: "n-warn",
        label: "NO",
        branch: "no",
      },
    ],
  };
}

function nodeShapeClass(shape: WorkflowNodeShape, type: WorkflowNodeKind) {
  if (shape === "diamond" || type === "decision") {
    return "rotate-45";
  }
  if (shape === "hex" || type === "start") {
    return "[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]";
  }
  return "";
}

function nodeTone(type: WorkflowNodeKind, active: boolean) {
  if (type === "start") {
    return active
      ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#174F86_0%,#1E6FB8_55%,#3a0d0d_100%)] shadow-[0_0_22px_rgba(30, 111, 184,.55)]"
      : "border-[#1E6FB8] bg-[linear-gradient(145deg,#4a1212_0%,#1A5F9E_55%,#2a0a0a_100%)] shadow-[0_0_14px_rgba(30, 111, 184,.35)]";
  }
  if (type === "action") {
    return active
      ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a2a2a_0%,#1a1a1a_100%)] shadow-[0_0_18px_rgba(30, 111, 184,.4)]"
      : "border-[#1E6FB8] bg-[linear-gradient(145deg,#2a2a2a_0%,#1a1a1a_100%)]";
  }
  if (type === "decision") {
    return active
      ? "border-[#1E6FB8] bg-[linear-gradient(145deg,#3a1515_0%,#1f1010_100%)] shadow-[0_0_18px_rgba(30, 111, 184,.45)]"
      : "border-[#6a6a6a] bg-[linear-gradient(145deg,#2f2f2f_0%,#1c1c1c_100%)]";
  }
  if (type === "warning") {
    return "border-[#6a6a6a] bg-[#2a2a2a] text-[#d8d8d8]";
  }
  return active
    ? "border-[#8a8a8a] bg-[linear-gradient(145deg,#1a1a1a_0%,#0f0f0f_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_0_14px_rgba(30, 111, 184,.25)]"
    : "border-[#5a5a5a] bg-[linear-gradient(145deg,#1a1a1a_0%,#0f0f0f_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]";
}

export function VeriForgeWorkflowBuilder() {
  const { push } = useVeriForgeNotifications();
  const [workflowType, setWorkflowType] = React.useState<WorkflowType>("verification");
  const [workflow, setWorkflow] = React.useState<WorkflowDefinitionLocal>(() =>
    seedWorkflow("verification"),
  );
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("n-start");
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState<DragState>(null);
  const [previewing, setPreviewing] = React.useState(false);
  const [activePath, setActivePath] = React.useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);
  const [decisionPass, setDecisionPass] = React.useState(true);
  const [runLog, setRunLog] = React.useState<string[]>([]);
  const [name, setName] = React.useState("forgeCheck Verification Rail");
  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const previewTimer = React.useRef<number | null>(null);
  const nodeSeq = React.useRef(100);

  React.useEffect(() => {
    return () => {
      if (previewTimer.current) window.clearInterval(previewTimer.current);
    };
  }, []);

  const loadType = (type: WorkflowType) => {
    const next = seedWorkflow(type);
    setWorkflowType(type);
    setWorkflow(next);
    setName(next.name);
    setSelectedNodeId("n-start");
    setConnectFrom(null);
    setActivePath([]);
    setActiveNodeId(null);
    setRunLog([]);
  };

  const selected = workflow.nodes.find((node) => node.nodeId === selectedNodeId) ?? null;

  const onPointerDownNode = (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const node = workflow.nodes.find((item) => item.nodeId === nodeId);
    if (!node || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedNodeId(nodeId);
    setDrag({
      nodeId,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    });
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.width - NODE_W - 8, event.clientX - rect.left - drag.offsetX));
    const y = Math.max(8, Math.min(rect.height - NODE_H - 8, event.clientY - rect.top - drag.offsetY));
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.nodeId === drag.nodeId
          ? { ...node, x, y, timestamp: new Date().toISOString() }
          : node,
      ),
    }));
  };

  const onPointerUp = () => setDrag(null);

  const addNode = (type: WorkflowNodeKind) => {
    const shape: WorkflowNodeShape =
      type === "decision" ? "diamond" : type === "start" ? "hex" : "rectangle";
    const actionType: WorkflowActionType | undefined =
      type === "action"
        ? workflowType === "training"
          ? "assign_training"
          : workflowType === "verification"
            ? "start_verification"
            : workflowType === "compliance"
              ? "run_compliance"
              : workflowType === "incident"
                ? "open_incident"
                : "ingest_audit"
        : undefined;
    const node: WorkflowNodeLocal = {
      nodeId: `n-${nodeSeq.current++}`,
      type,
      shape,
      label:
        type === "start"
          ? "START"
          : type === "end"
            ? "END"
            : type === "decision"
              ? "IF / ELSE"
              : type === "warning"
                ? "BREAK"
                : "ACTION",
      x: 120 + workflow.nodes.length * 12,
      y: 80 + (workflow.nodes.length % 4) * 40,
      timestamp: new Date().toISOString(),
      actionType,
      trigger: type === "action" ? "event" : type === "start" ? "manual" : undefined,
      condition: type === "decision" ? "outcome === pass" : undefined,
    };
    setWorkflow((prev) => ({ ...prev, nodes: [...prev.nodes, node] }));
    setSelectedNodeId(node.nodeId);
  };

  const beginConnect = () => {
    if (!selectedNodeId) return;
    setConnectFrom(selectedNodeId);
  };

  const completeConnect = (toNodeId: string) => {
    if (!connectFrom || connectFrom === toNodeId) {
      setConnectFrom(null);
      return;
    }
    setWorkflow((prev) => ({
      ...prev,
      connectors: [
        ...prev.connectors,
        {
          id: `c-${nodeSeq.current++}`,
          fromNodeId: connectFrom,
          toNodeId,
          branch: "default",
          label: "LINK",
        },
      ],
    }));
    setConnectFrom(null);
  };

  const updateSelected = (patch: Partial<WorkflowNodeLocal>) => {
    if (!selectedNodeId) return;
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.nodeId === selectedNodeId
          ? { ...node, ...patch, timestamp: new Date().toISOString() }
          : node,
      ),
    }));
  };

  const resolveNext = (
    currentId: string,
    pass: boolean,
    def: WorkflowDefinitionLocal,
  ) => {
    const current = def.nodes.find((node) => node.nodeId === currentId);
    const outgoing = def.connectors.filter((item) => item.fromNodeId === currentId);
    if (!current) return null;
    if (current.type === "decision") {
      const branch = pass ? "yes" : "no";
      return (
        outgoing.find((item) => item.branch === branch)?.toNodeId ??
        outgoing[0]?.toNodeId ??
        null
      );
    }
    return outgoing[0]?.toNodeId ?? null;
  };

  const runPreview = () => {
    if (previewing) return;
    const start = workflow.nodes.find((node) => node.type === "start");
    if (!start) return;
    setPreviewing(true);
    setActivePath([start.nodeId]);
    setActiveNodeId(start.nodeId);
    setRunLog([`START · ${start.nodeId}`]);

    let currentId: string | null = start.nodeId;
    const path = [start.nodeId];
    const logs = [`START · ${start.nodeId}`];
    let steps = 0;

    previewTimer.current = window.setInterval(() => {
      if (!currentId || steps > 12) {
        if (previewTimer.current) window.clearInterval(previewTimer.current);
        setPreviewing(false);
        return;
      }
      steps += 1;
      const current = workflow.nodes.find((node) => node.nodeId === currentId);
      if (!current) {
        if (previewTimer.current) window.clearInterval(previewTimer.current);
        setPreviewing(false);
        return;
      }

      if (current.type === "action" && current.actionType === "send_notification") {
        push({
          category: "system",
          tone: "info",
          title: "WORKFLOW ACTION",
          message: `Node ${current.nodeId} sent notification.`,
          forgeStatus: "forged",
          userId: 1,
        });
      }
      if (current.type === "action" && current.actionType === "start_verification") {
        push({
          category: "verification",
          tone: "info",
          title: "FORGECHECK STARTED",
          message: "Workflow builder triggered forgeCheck.",
          forgeStatus: "pending",
          userId: 1,
        });
      }
      if (current.type === "action" && current.actionType === "assign_training") {
        push({
          category: "training",
          tone: "success",
          title: "TRAINING ASSIGNED",
          message: "Workflow builder assigned training module.",
          forgeStatus: "forged",
          userId: 1,
        });
      }

      if (current.type === "end" || current.type === "warning") {
        logs.push(
          current.type === "warning"
            ? `BREAK · ${current.nodeId}`
            : `END · ${current.nodeId}`,
        );
        setRunLog([...logs]);
        setActiveNodeId(current.nodeId);
        if (previewTimer.current) window.clearInterval(previewTimer.current);
        setPreviewing(false);
        return;
      }

      const nextId = resolveNext(currentId, decisionPass, workflow);
      if (!nextId) {
        logs.push(`BREAK · no connector from ${currentId}`);
        setRunLog([...logs]);
        setActiveNodeId(currentId);
        if (previewTimer.current) window.clearInterval(previewTimer.current);
        setPreviewing(false);
        return;
      }
      path.push(nextId);
      logs.push(`MOVE · ${currentId} → ${nextId}`);
      currentId = nextId;
      setActivePath([...path]);
      setActiveNodeId(nextId);
      setRunLog([...logs]);
    }, 700);
  };

  const center = (node: WorkflowNodeLocal) => ({
    x: node.x + NODE_W / 2,
    y: node.y + NODE_H / 2,
  });

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Workflow Builder
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Drag nodes, wire angular connectors, preview metallic execution.
            </p>
          </div>
          <AnvilIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <VeriForgeSelect
            label="Workflow Type"
            value={workflowType}
            onChange={(event) => loadType(event.target.value as WorkflowType)}
            options={[
              { label: "Training", value: "training" },
              { label: "Verification (forgeCheck)", value: "verification" },
              { label: "Compliance", value: "compliance" },
              { label: "Incident", value: "incident" },
              { label: "Audit", value: "audit" },
            ]}
          />
          <VeriForgeTextField
            label="Workflow Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setWorkflow((prev) => ({ ...prev, name: event.target.value }));
            }}
          />
          <VeriForgeSelect
            label="Decision Branch"
            value={decisionPass ? "yes" : "no"}
            onChange={(event) => setDecisionPass(event.target.value === "yes")}
            options={[
              { label: "YES path", value: "yes" },
              { label: "NO path", value: "no" },
            ]}
          />
          <div className="flex items-end">
            <VeriForgeButton className="w-full" onClick={runPreview} disabled={previewing}>
              {previewing ? "Executing…" : "Preview Workflow"}
            </VeriForgeButton>
          </div>
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-3">
          <h3 className={cn(veriforgeTypography.heading, "text-xs text-[#FAFAFA]")}>
            Node Palette
          </h3>
          <VeriForgeDivider className="my-2" />
          <div className="space-y-2">
            {(
              [
                ["start", "Start Node"],
                ["action", "Action Node"],
                ["decision", "Decision Node"],
                ["end", "End Node"],
                ["warning", "Warning / Break"],
              ] as const
            ).map(([type, label]) => (
              <VeriForgeButton
                key={type}
                variant="secondary"
                className="w-full"
                size="sm"
                onClick={() => addNode(type)}
              >
                {label}
              </VeriForgeButton>
            ))}
          </div>
          <VeriForgeDivider className="my-3" />
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
            Triggers: time · event · completion · manual
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
            Actions: assign training · forgeCheck · notify
          </p>
          <div className="mt-3 space-y-2">
            <VeriForgeButton
              size="sm"
              className="w-full"
              variant="secondary"
              onClick={beginConnect}
              disabled={!selectedNodeId}
            >
              Connect From Selected
            </VeriForgeButton>
            {connectFrom ? (
              <p className="text-xs text-[#ffd0d0]">
                Connecting from {connectFrom}. Click target node.
              </p>
            ) : null}
          </div>
        </VeriForgeFrame>

        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative min-h-[520px] overflow-hidden border border-[#424242] bg-[#1A1A1A]"
          style={{
            backgroundImage:
              "linear-gradient(#424242 1px, transparent 1px), linear-gradient(90deg, #424242 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            backgroundPosition: "-1px -1px",
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="vf-connector" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5a5a5a" />
                <stop offset="50%" stopColor="#c8c8c8" />
                <stop offset="100%" stopColor="#1E6FB8" />
              </linearGradient>
            </defs>
            {workflow.connectors.map((connector) => {
              const from = workflow.nodes.find((node) => node.nodeId === connector.fromNodeId);
              const to = workflow.nodes.find((node) => node.nodeId === connector.toNodeId);
              if (!from || !to) return null;
              const a = center(from);
              const b = center(to);
              const midX = (a.x + b.x) / 2;
              const active =
                activePath.includes(connector.fromNodeId) &&
                activePath.includes(connector.toNodeId);
              return (
                <g key={connector.id}>
                  <polyline
                    points={`${a.x},${a.y} ${midX},${a.y} ${midX},${b.y} ${b.x},${b.y}`}
                    fill="none"
                    stroke={active ? "#1E6FB8" : "url(#vf-connector)"}
                    strokeWidth={active ? 3 : 2}
                    strokeLinejoin="miter"
                    className={active ? "animate-pulse" : undefined}
                  />
                  {connector.label ? (
                    <text
                      x={midX + 6}
                      y={(a.y + b.y) / 2 - 6}
                      fill="#d0d0d0"
                      fontSize="10"
                    >
                      {connector.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {workflow.nodes.map((node) => {
            const active = activeNodeId === node.nodeId;
            const inPath = activePath.includes(node.nodeId);
            const diamond = node.shape === "diamond" || node.type === "decision";
            return (
              <div
                key={node.nodeId}
                onPointerDown={(event) => onPointerDownNode(event, node.nodeId)}
                onClick={() => {
                  if (connectFrom) completeConnect(node.nodeId);
                  else setSelectedNodeId(node.nodeId);
                }}
                className={cn(
                  "absolute cursor-grab touch-none select-none active:cursor-grabbing",
                  selectedNodeId === node.nodeId && "z-10",
                )}
                style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
              >
                <div
                  className={cn(
                    "grid h-full w-full place-items-center border text-center",
                    nodeTone(node.type, active || inPath),
                    nodeShapeClass(node.shape, node.type),
                    active && "animate-pulse",
                  )}
                >
                  <div className={cn(diamond && "-rotate-45")}>
                    <p
                      className={cn(
                        veriforgeTypography.heading,
                        "px-2 text-[10px] leading-tight text-[#FAFAFA]",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-[#cfcfcf]">
                      {node.type}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-3">
          <h3 className={cn(veriforgeTypography.heading, "text-xs text-[#FAFAFA]")}>
            Node Inspector
          </h3>
          <VeriForgeDivider className="my-2" />
          {!selected ? (
            <p className="text-sm text-[#b5b5b5]">Select a node to edit metadata.</p>
          ) : (
            <div className="space-y-2">
              <VeriForgeTextField
                label="Label"
                value={selected.label}
                onChange={(event) => updateSelected({ label: event.target.value })}
              />
              <VeriForgeSelect
                label="Shape"
                value={selected.shape}
                onChange={(event) =>
                  updateSelected({ shape: event.target.value as WorkflowNodeShape })
                }
                options={[
                  { label: "Rectangle", value: "rectangle" },
                  { label: "Diamond", value: "diamond" },
                  { label: "Hex", value: "hex" },
                ]}
              />
              {selected.type === "action" ? (
                <VeriForgeSelect
                  label="Action"
                  value={selected.actionType ?? "send_notification"}
                  onChange={(event) =>
                    updateSelected({
                      actionType: event.target.value as WorkflowActionType,
                    })
                  }
                  options={[
                    { label: "Assign Training", value: "assign_training" },
                    { label: "Start Verification", value: "start_verification" },
                    { label: "Send Notification", value: "send_notification" },
                    { label: "Run Compliance", value: "run_compliance" },
                    { label: "Open Incident", value: "open_incident" },
                    { label: "Ingest Audit", value: "ingest_audit" },
                  ]}
                />
              ) : null}
              {selected.type === "action" || selected.type === "start" ? (
                <VeriForgeSelect
                  label="Trigger"
                  value={selected.trigger ?? "manual"}
                  onChange={(event) =>
                    updateSelected({ trigger: event.target.value as WorkflowTrigger })
                  }
                  options={[
                    { label: "Manual", value: "manual" },
                    { label: "Event", value: "event" },
                    { label: "Time", value: "time" },
                    { label: "Completion", value: "completion" },
                  ]}
                />
              ) : null}
              {selected.type === "decision" ? (
                <VeriForgeTextField
                  label="Condition"
                  value={selected.condition ?? ""}
                  onChange={(event) => updateSelected({ condition: event.target.value })}
                />
              ) : null}
              <div className="border border-[#424242] bg-[#151515] p-2 text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                <p>nodeId: {selected.nodeId}</p>
                <p>type: {selected.type}</p>
                <p>timestamp: {selected.timestamp}</p>
              </div>
            </div>
          )}

          <VeriForgeDivider className="my-3" />
          <div className="mb-2 flex items-center gap-2">
            <HeatEdgeIcon className="text-[#1E6FB8]" />
            <h4 className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Execution Log
            </h4>
          </div>
          <div className="max-h-48 space-y-1 overflow-auto border border-[#424242] bg-[#151515] p-2">
            {runLog.length === 0 ? (
              <p className="text-xs text-[#8f8f8f]">Run preview to animate the rail.</p>
            ) : (
              runLog.map((line) => (
                <p key={line} className="text-[11px] text-[#d2d2d2]">
                  <ForgeBoltIcon className="mr-1 inline h-3 w-3 text-[#1E6FB8]" />
                  {line}
                </p>
              ))
            )}
          </div>
        </VeriForgeFrame>
      </div>
    </div>
  );
}
