import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TrainingService } from './training.service';
import { VerificationService } from './verification.service';

export type WorkflowType =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incident'
  | 'audit';

export type WorkflowNodeKind =
  | 'start'
  | 'action'
  | 'decision'
  | 'end'
  | 'warning';

export type WorkflowNodeShape = 'rectangle' | 'diamond' | 'hex';

export type WorkflowTrigger = 'time' | 'event' | 'completion' | 'manual';

export type WorkflowActionType =
  | 'assign_training'
  | 'start_verification'
  | 'send_notification'
  | 'run_compliance'
  | 'open_incident'
  | 'ingest_audit';

export type WorkflowNode = {
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
  metadata?: Record<string, unknown>;
};

export type WorkflowConnector = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  branch?: 'yes' | 'no' | 'default';
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  type: WorkflowType;
  description: string;
  nodes: WorkflowNode[];
  connectors: WorkflowConnector[];
  createdAt: string;
  updatedAt: string;
  userId: number;
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  activeNodeId: string | null;
  path: string[];
  logs: Array<{ nodeId: string; message: string; timestamp: string }>;
  startedAt: string;
  finishedAt: string | null;
  userId: number;
};

function nowIso() {
  return new Date().toISOString();
}

function seedVerificationWorkflow(userId: number): WorkflowDefinition {
  const ts = nowIso();
  return {
    id: 'wf-verification-1',
    name: 'forgeCheck Verification Rail',
    type: 'verification',
    description: 'Start → forgeCheck action → pass/fail decision → end.',
    userId,
    createdAt: ts,
    updatedAt: ts,
    nodes: [
      {
        nodeId: 'n-start',
        type: 'start',
        shape: 'hex',
        label: 'START',
        x: 40,
        y: 160,
        timestamp: ts,
        trigger: 'manual',
      },
      {
        nodeId: 'n-action',
        type: 'action',
        shape: 'rectangle',
        label: 'Start forgeCheck',
        x: 220,
        y: 150,
        timestamp: ts,
        actionType: 'start_verification',
        trigger: 'event',
      },
      {
        nodeId: 'n-decision',
        type: 'decision',
        shape: 'diamond',
        label: 'forgeStatus Pass?',
        x: 430,
        y: 140,
        timestamp: ts,
        condition: 'forgeStatus === verified',
      },
      {
        nodeId: 'n-end-ok',
        type: 'end',
        shape: 'rectangle',
        label: 'END · VERIFIED',
        x: 650,
        y: 80,
        timestamp: ts,
      },
      {
        nodeId: 'n-warn',
        type: 'warning',
        shape: 'rectangle',
        label: 'BREAK · RETRY',
        x: 650,
        y: 230,
        timestamp: ts,
      },
    ],
    connectors: [
      {
        id: 'c1',
        fromNodeId: 'n-start',
        toNodeId: 'n-action',
        branch: 'default',
      },
      {
        id: 'c2',
        fromNodeId: 'n-action',
        toNodeId: 'n-decision',
        branch: 'default',
      },
      {
        id: 'c3',
        fromNodeId: 'n-decision',
        toNodeId: 'n-end-ok',
        label: 'YES',
        branch: 'yes',
      },
      {
        id: 'c4',
        fromNodeId: 'n-decision',
        toNodeId: 'n-warn',
        label: 'NO',
        branch: 'no',
      },
    ],
  };
}

@Injectable()
export class WorkflowBuilderService {
  private nextWorkflowId = 2;
  private nextRunId = 1;
  private nextNodeSeq = 100;

  private workflows: WorkflowDefinition[] = [seedVerificationWorkflow(1)];
  private runs: WorkflowRun[] = [];

  constructor(
    private readonly notifications: NotificationService,
    private readonly training: TrainingService,
    private readonly verification: VerificationService,
  ) {}

  list() {
    return [...this.workflows];
  }

  getById(id: string) {
    const workflow = this.workflows.find((item) => item.id === id);
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`);
    return workflow;
  }

  create(
    input: {
      name: string;
      type: WorkflowType;
      description?: string;
      nodes?: WorkflowNode[];
      connectors?: WorkflowConnector[];
    },
    userId: number,
  ) {
    const ts = nowIso();
    const workflow: WorkflowDefinition = {
      id: `wf-${this.nextWorkflowId++}`,
      name: input.name,
      type: input.type,
      description: input.description ?? '',
      nodes: input.nodes ?? this.defaultNodesForType(input.type, ts),
      connectors: input.connectors ?? this.defaultConnectorsForType(input.type),
      createdAt: ts,
      updatedAt: ts,
      userId,
    };
    this.workflows.unshift(workflow);
    return workflow;
  }

  update(
    id: string,
    input: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      connectors?: WorkflowConnector[];
    },
    userId: number,
  ) {
    const workflow = this.getById(id);
    if (input.name) workflow.name = input.name;
    if (typeof input.description === 'string')
      workflow.description = input.description;
    if (input.nodes) {
      workflow.nodes = input.nodes.map((node) => ({
        ...node,
        timestamp: node.timestamp || nowIso(),
        nodeId: node.nodeId || `n-${this.nextNodeSeq++}`,
      }));
    }
    if (input.connectors) workflow.connectors = input.connectors;
    workflow.updatedAt = nowIso();
    workflow.userId = userId;
    return workflow;
  }

  addNode(
    workflowId: string,
    input: {
      type: WorkflowNodeKind;
      label: string;
      x: number;
      y: number;
      shape?: WorkflowNodeShape;
      actionType?: WorkflowActionType;
      trigger?: WorkflowTrigger;
      condition?: string;
    },
    userId: number,
  ) {
    const workflow = this.getById(workflowId);
    const shape =
      input.shape ??
      (input.type === 'decision'
        ? 'diamond'
        : input.type === 'start'
        ? 'hex'
        : 'rectangle');
    const node: WorkflowNode = {
      nodeId: `n-${this.nextNodeSeq++}`,
      type: input.type,
      shape,
      label: input.label,
      x: input.x,
      y: input.y,
      timestamp: nowIso(),
      actionType: input.actionType,
      trigger: input.trigger,
      condition: input.condition,
      metadata: { userId },
    };
    workflow.nodes.push(node);
    workflow.updatedAt = nowIso();
    return { workflow, node };
  }

  connect(
    workflowId: string,
    input: {
      fromNodeId: string;
      toNodeId: string;
      label?: string;
      branch?: 'yes' | 'no' | 'default';
    },
  ) {
    const workflow = this.getById(workflowId);
    const connector: WorkflowConnector = {
      id: `c-${Date.now()}`,
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      label: input.label,
      branch: input.branch ?? 'default',
    };
    workflow.connectors.push(connector);
    workflow.updatedAt = nowIso();
    return { workflow, connector };
  }

  listRuns() {
    return [...this.runs];
  }

  execute(workflowId: string, userId: number, decisionPass = true) {
    const workflow = this.getById(workflowId);
    const start = workflow.nodes.find((node) => node.type === 'start');
    if (!start) {
      throw new NotFoundException(`Workflow ${workflowId} missing start node`);
    }

    const run: WorkflowRun = {
      id: `run-${this.nextRunId++}`,
      workflowId,
      status: 'running',
      activeNodeId: start.nodeId,
      path: [start.nodeId],
      logs: [
        {
          nodeId: start.nodeId,
          message: 'Workflow started',
          timestamp: nowIso(),
        },
      ],
      startedAt: nowIso(),
      finishedAt: null,
      userId,
    };
    this.runs.unshift(run);

    let current = start;
    let guard = 0;
    while (current && guard < 20) {
      guard += 1;
      run.activeNodeId = current.nodeId;
      this.applyNodeAction(current, userId, run);

      if (current.type === 'end' || current.type === 'warning') {
        run.status = current.type === 'warning' ? 'failed' : 'completed';
        run.finishedAt = nowIso();
        run.activeNodeId = current.nodeId;
        break;
      }

      const nextId = this.resolveNextNodeId(workflow, current, decisionPass);
      if (!nextId) {
        run.status = 'failed';
        run.finishedAt = nowIso();
        run.logs.push({
          nodeId: current.nodeId,
          message: 'No outgoing connector — workflow break',
          timestamp: nowIso(),
        });
        break;
      }
      const next = workflow.nodes.find((node) => node.nodeId === nextId);
      if (!next) {
        run.status = 'failed';
        run.finishedAt = nowIso();
        break;
      }
      run.path.push(next.nodeId);
      current = next;
    }

    if (run.status === 'running') {
      run.status = 'completed';
      run.finishedAt = nowIso();
    }

    return { run, workflow };
  }

  private applyNodeAction(
    node: WorkflowNode,
    userId: number,
    run: WorkflowRun,
  ) {
    if (node.type !== 'action' || !node.actionType) {
      run.logs.push({
        nodeId: node.nodeId,
        message: `Visited ${node.type}: ${node.label}`,
        timestamp: nowIso(),
      });
      return;
    }

    if (node.actionType === 'assign_training') {
      this.training.assign({ moduleId: 'm-101', userId });
      run.logs.push({
        nodeId: node.nodeId,
        message: 'Assigned training module m-101',
        timestamp: nowIso(),
      });
      return;
    }

    if (node.actionType === 'start_verification') {
      const result = this.verification.forgeCheck({
        targetId: `user-${userId}`,
        checkType: 'workflow-builder',
        userId,
      });
      run.logs.push({
        nodeId: node.nodeId,
        message: `Started forgeCheck ${result.id}`,
        timestamp: nowIso(),
      });
      return;
    }

    if (node.actionType === 'send_notification') {
      this.notifications.enqueue({
        title: 'WORKFLOW ACTION',
        message: `Workflow node ${node.nodeId} triggered notification.`,
        category: 'system',
        forgeStatus: 'forged',
      });
      run.logs.push({
        nodeId: node.nodeId,
        message: 'Notification sent',
        timestamp: nowIso(),
      });
      return;
    }

    run.logs.push({
      nodeId: node.nodeId,
      message: `Executed action ${node.actionType}`,
      timestamp: nowIso(),
    });
  }

  private resolveNextNodeId(
    workflow: WorkflowDefinition,
    current: WorkflowNode,
    decisionPass: boolean,
  ) {
    const outgoing = workflow.connectors.filter(
      (item) => item.fromNodeId === current.nodeId,
    );
    if (current.type === 'decision') {
      const branch = decisionPass ? 'yes' : 'no';
      const match = outgoing.find((item) => item.branch === branch);
      return match?.toNodeId ?? outgoing[0]?.toNodeId ?? null;
    }
    return outgoing[0]?.toNodeId ?? null;
  }

  private defaultNodesForType(type: WorkflowType, ts: string): WorkflowNode[] {
    const actionLabel =
      type === 'training'
        ? 'Assign Training'
        : type === 'verification'
        ? 'Start forgeCheck'
        : type === 'compliance'
        ? 'Run Compliance'
        : type === 'incident'
        ? 'Open Incident'
        : 'Ingest Audit';
    const actionType: WorkflowActionType =
      type === 'training'
        ? 'assign_training'
        : type === 'verification'
        ? 'start_verification'
        : type === 'compliance'
        ? 'run_compliance'
        : type === 'incident'
        ? 'open_incident'
        : 'ingest_audit';

    return [
      {
        nodeId: 'n-start',
        type: 'start',
        shape: 'hex',
        label: 'START',
        x: 40,
        y: 160,
        timestamp: ts,
        trigger: 'manual',
      },
      {
        nodeId: 'n-action',
        type: 'action',
        shape: 'rectangle',
        label: actionLabel,
        x: 240,
        y: 150,
        timestamp: ts,
        actionType,
        trigger: 'event',
      },
      {
        nodeId: 'n-decision',
        type: 'decision',
        shape: 'diamond',
        label: 'Success?',
        x: 460,
        y: 140,
        timestamp: ts,
        condition: 'outcome === pass',
      },
      {
        nodeId: 'n-end',
        type: 'end',
        shape: 'rectangle',
        label: 'END',
        x: 680,
        y: 80,
        timestamp: ts,
      },
      {
        nodeId: 'n-warn',
        type: 'warning',
        shape: 'rectangle',
        label: 'BREAK',
        x: 680,
        y: 230,
        timestamp: ts,
      },
    ];
  }

  private defaultConnectorsForType(_type: WorkflowType): WorkflowConnector[] {
    return [
      {
        id: 'c1',
        fromNodeId: 'n-start',
        toNodeId: 'n-action',
        branch: 'default',
      },
      {
        id: 'c2',
        fromNodeId: 'n-action',
        toNodeId: 'n-decision',
        branch: 'default',
      },
      {
        id: 'c3',
        fromNodeId: 'n-decision',
        toNodeId: 'n-end',
        label: 'YES',
        branch: 'yes',
      },
      {
        id: 'c4',
        fromNodeId: 'n-decision',
        toNodeId: 'n-warn',
        label: 'NO',
        branch: 'no',
      },
    ];
  }
}
