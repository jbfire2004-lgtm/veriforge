import { BadRequestError } from '../utils/errors';

export class VerificationEngine {
  private readonly allowedRoles = ['supervisor', 'safety_officer', 'project_manager', 'company_admin', 'admin'];

  assertRole(roles: string[]) {
    if (!roles.some((r) => this.allowedRoles.includes(r.toLowerCase()))) {
      throw new BadRequestError(
        `Verifier role must be one of: ${this.allowedRoles.join(', ')}`,
      );
    }
  }

  outcomeToStatus(outcome: 'approved' | 'rejected'): 'verified' | 'in_progress' {
    return outcome === 'approved' ? 'verified' : 'in_progress';
  }
}

export const verificationEngine = new VerificationEngine();
