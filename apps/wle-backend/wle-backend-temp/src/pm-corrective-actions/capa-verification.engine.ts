import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CapaVerificationEngine {
  private readonly allowedRoles = [
    'supervisor',
    'safety_officer',
    'project_manager',
  ];

  assertRole(role: string) {
    if (!this.allowedRoles.includes(role)) {
      throw new BadRequestException(
        `Verifier role must be one of: ${this.allowedRoles.join(', ')}`,
      );
    }
  }

  nextStatus(outcome: 'approve' | 'reject'): 'verified' | 'in_progress' {
    return outcome === 'approve' ? 'verified' : 'in_progress';
  }
}
