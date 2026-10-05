export declare class CapaVerificationEngine {
    private readonly allowedRoles;
    assertRole(role: string): void;
    nextStatus(outcome: 'approve' | 'reject'): 'verified' | 'in_progress';
}
