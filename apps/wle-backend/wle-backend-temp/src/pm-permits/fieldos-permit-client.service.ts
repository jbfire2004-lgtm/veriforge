import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type FieldOsPermitTaskPayload = {
  external_permit_id: string;
  company_id: number;
  project_id: number;
  job_id?: string | null;
  asset_id?: string | null;
  contractor_id?: number | null;
  permit_type: string;
  risk_level: string;
  required_signatures: string[];
  required_documents: string[];
  required_ppe: string[];
  start_time?: string | null;
  end_time?: string | null;
  title?: string;
};

export type FieldOsPermitTask = {
  task_id: string;
  external_permit_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  signatures: Array<{ role: string; name?: string; signedAt?: string }>;
  photos: Array<{ id: string; url: string; caption?: string }>;
  notes: string[];
  hazard_controls_applied: string[];
  completed_at?: string | null;
  payload: FieldOsPermitTaskPayload;
};

/**
 * FieldOS Permit Task client.
 * Uses in-process task registry by default; set FIELDOS_PERMIT_API_URL to push externally.
 */
@Injectable()
export class FieldOsPermitClient {
  private readonly logger = new Logger(FieldOsPermitClient.name);
  private readonly tasks = new Map<string, FieldOsPermitTask>();

  async createPermitTask(
    payload: FieldOsPermitTaskPayload,
  ): Promise<FieldOsPermitTask> {
    const baseUrl = process.env.FIELDOS_PERMIT_API_URL;
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/tasks/permits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.FIELDOS_PERMIT_API_KEY
              ? {
                  Authorization: `Bearer ${process.env.FIELDOS_PERMIT_API_KEY}`,
                }
              : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`FieldOS create failed (${res.status})`);
        }
        const json = (await res.json()) as Partial<FieldOsPermitTask> & {
          task_id?: string;
          id?: string;
        };
        const task: FieldOsPermitTask = {
          task_id: json.task_id ?? json.id ?? randomUUID(),
          external_permit_id: payload.external_permit_id,
          status: json.status ?? 'open',
          created_at: json.created_at ?? new Date().toISOString(),
          updated_at: json.updated_at ?? new Date().toISOString(),
          signatures: json.signatures ?? [],
          photos: json.photos ?? [],
          notes: json.notes ?? [],
          hazard_controls_applied: json.hazard_controls_applied ?? [],
          completed_at: json.completed_at ?? null,
          payload,
        };
        this.tasks.set(task.task_id, task);
        return task;
      } catch (err) {
        this.logger.warn(
          `FieldOS HTTP create failed; falling back to local task: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    const now = new Date().toISOString();
    const task: FieldOsPermitTask = {
      task_id: `fos-permit-${randomUUID()}`,
      external_permit_id: payload.external_permit_id,
      status: 'open',
      created_at: now,
      updated_at: now,
      signatures: [],
      photos: [],
      notes: [],
      hazard_controls_applied: [],
      completed_at: null,
      payload,
    };
    this.tasks.set(task.task_id, task);
    return task;
  }

  getTask(taskId: string): FieldOsPermitTask | null {
    return this.tasks.get(taskId) ?? null;
  }

  listTasks(filter?: { projectId?: number; companyId?: number }) {
    return [...this.tasks.values()].filter((t) => {
      if (filter?.projectId && t.payload.project_id !== filter.projectId) {
        return false;
      }
      if (filter?.companyId && t.payload.company_id !== filter.companyId) {
        return false;
      }
      return true;
    });
  }

  applyWebhookUpdate(
    taskId: string,
    patch: Partial<FieldOsPermitTask>,
  ): FieldOsPermitTask | null {
    const existing = this.tasks.get(taskId);
    if (!existing) return null;
    const next: FieldOsPermitTask = {
      ...existing,
      ...patch,
      task_id: existing.task_id,
      external_permit_id: existing.external_permit_id,
      updated_at: new Date().toISOString(),
      signatures: patch.signatures ?? existing.signatures,
      photos: patch.photos ?? existing.photos,
      notes: patch.notes ?? existing.notes,
      hazard_controls_applied:
        patch.hazard_controls_applied ?? existing.hazard_controls_applied,
    };
    this.tasks.set(taskId, next);
    return next;
  }
}
