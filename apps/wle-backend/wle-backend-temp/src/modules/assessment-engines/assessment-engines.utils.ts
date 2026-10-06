import type { CompetencyLevel } from '../training-assessment/training-assessment.types';

export function courseCodeFromName(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'COURSE';
}

export function mapVerificationStatus(
  status: string | null | undefined,
): 'Pending' | 'Verified' | 'Rejected' | undefined {
  if (!status) return undefined;
  const s = status.toLowerCase();
  if (s.includes('verified') && !s.includes('un')) return 'Verified';
  if (s.includes('reject')) return 'Rejected';
  return 'Pending';
}

export function inferCompetencyLevel(
  role: string | null | undefined,
): CompetencyLevel {
  const r = (role ?? '').toLowerCase();
  if (r.includes('instructor') || r.includes('trainer')) return 'Instructor';
  if (r.includes('supervisor') || r.includes('foreman')) return 'Supervisor';
  if (r.includes('operator')) return 'Operator';
  return 'Awareness';
}
