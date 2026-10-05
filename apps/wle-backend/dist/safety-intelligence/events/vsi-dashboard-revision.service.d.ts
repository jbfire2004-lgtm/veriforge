type RevisionListener = (projectId: number, revision: number) => void;
export declare class VsiDashboardRevisionService {
    private readonly revisions;
    private readonly listeners;
    getRevision(projectId: number): number;
    bump(projectId: number): number;
    subscribe(listener: RevisionListener): () => void;
}
export {};
