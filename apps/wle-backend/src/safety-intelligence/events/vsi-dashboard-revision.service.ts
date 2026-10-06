import { Injectable } from '@nestjs/common';

type RevisionListener = (projectId: number, revision: number) => void;

@Injectable()
export class VsiDashboardRevisionService {
  private readonly revisions = new Map<number, number>();
  private readonly listeners = new Set<RevisionListener>();

  getRevision(projectId: number): number {
    return this.revisions.get(projectId) ?? 0;
  }

  bump(projectId: number): number {
    const next = (this.revisions.get(projectId) ?? 0) + 1;
    this.revisions.set(projectId, next);
    for (const listener of this.listeners) {
      listener(projectId, next);
    }
    return next;
  }

  subscribe(listener: RevisionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
