import { Injectable } from '@nestjs/common';

export type TrainingRecordLike = {
  expiresAt: Date | null;
  completedAt: Date | null;
  issuedAt: Date;
  certificateSignedAt?: Date | null;
  certificateUrl?: string | null;
  certificateNumber?: string | null;
};

@Injectable()
export class TrainingExpiryEngine {
  deriveStatus(record: TrainingRecordLike, expiresInDays = 365): string {
    const now = new Date();
    const expiry =
      record.expiresAt ??
      new Date(record.issuedAt.getTime() + expiresInDays * 86400000);
    if (expiry < now) return 'expired';
    if (record.certificateSignedAt) return 'verified';
    if (record.completedAt) return 'completed';
    if (record.certificateUrl || record.certificateNumber) return 'in_progress';
    return 'assigned';
  }

  daysUntilExpiry(record: TrainingRecordLike, expiresInDays = 365): number {
    const expiry =
      record.expiresAt ??
      new Date(record.issuedAt.getTime() + expiresInDays * 86400000);
    return Math.ceil((expiry.getTime() - Date.now()) / 86400000);
  }

  isBlocking(record: TrainingRecordLike, expiresInDays = 365): boolean {
    return this.deriveStatus(record, expiresInDays) === 'expired';
  }
}
