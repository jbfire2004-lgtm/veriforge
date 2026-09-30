import { MusterAttendanceStatus } from '@prisma/client';

export class MissingWorkerEngine {
  detect(input: {
    expectedRoster: string[];
    checkedInWorkerIds: string[];
  }): { missingWorkers: string[]; attendanceRate: number } {
    const checkedSet = new Set(input.checkedInWorkerIds);
    const missingWorkers = input.expectedRoster.filter((id) => !checkedSet.has(id));
    const expected = input.expectedRoster.length;
    const attendanceRate =
      expected === 0 ? 100 : Math.round((input.checkedInWorkerIds.length / expected) * 100);

    return { missingWorkers, attendanceRate };
  }
}

export class NotificationEngine {
  buildEmergencyMessage(input: {
    type: string;
    severity: string;
    projectId?: string | null;
    description?: string | null;
  }): string {
    const parts = [
      `EMERGENCY: ${input.type.toUpperCase()}`,
      `Severity: ${input.severity}`,
    ];
    if (input.projectId) parts.push(`Project: ${input.projectId}`);
    if (input.description) parts.push(input.description);
    return parts.join(' | ');
  }
}

export function mapLockoutMode(emergencyType: string): string {
  switch (emergencyType) {
    case 'fire':
    case 'hazmat':
    case 'security':
      return 'lockdown';
    case 'evacuation':
    case 'weather':
      return 'evacuation';
    default:
      return 'muster';
  }
}

export const missingWorkerEngine = new MissingWorkerEngine();
export const notificationEngine = new NotificationEngine();

export function defaultAttendanceStatus(
  status?: string,
): MusterAttendanceStatus {
  if (status === 'absent') return MusterAttendanceStatus.absent;
  if (status === 'evacuated') return MusterAttendanceStatus.evacuated;
  if (status === 'unknown') return MusterAttendanceStatus.unknown;
  return MusterAttendanceStatus.present;
}
