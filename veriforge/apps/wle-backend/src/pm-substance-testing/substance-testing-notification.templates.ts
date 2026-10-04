export type SubstanceTestNotificationPayload = {
  testEventId: string;
  workerName: string;
  testType: string;
  outcome?: string;
  projectName?: string;
  scheduledAt?: string;
};

export const SUBSTANCE_TEST_NOTIFICATION_TEMPLATES = {
  testScheduled: (p: SubstanceTestNotificationPayload) => ({
    title: `Drug/alcohol test scheduled — ${p.workerName}`,
    body: `${p.testType.replace(/_/g, ' ')} test${
      p.scheduledAt ? ` on ${new Date(p.scheduledAt).toLocaleDateString()}` : ''
    }.${p.projectName ? ` Project: ${p.projectName}.` : ''}`,
    type: 'substance.test.scheduled' as const,
    metadata: p,
  }),

  testResultRecorded: (p: SubstanceTestNotificationPayload) => ({
    title: `Test result: ${p.outcome?.replace(/_/g, ' ') ?? 'recorded'} — ${
      p.workerName
    }`,
    body: `${p.testType.replace(/_/g, ' ')} test result requires review.${
      p.projectName ? ` ${p.projectName}.` : ''
    }`,
    type: 'substance.test.result' as const,
    metadata: p,
  }),

  nonNegativeAlert: (p: SubstanceTestNotificationPayload) => ({
    title: `NON-NEGATIVE result — ${p.workerName}`,
    body: `Immediate DER/HR review required. Worker site access may be restricted.`,
    type: 'substance.test.non_negative' as const,
    metadata: p,
  }),

  refusalAlert: (p: SubstanceTestNotificationPayload) => ({
    title: `Test REFUSAL — ${p.workerName}`,
    body: `Worker refused testing. Treat as non-negative per policy. Restrict site access.`,
    type: 'substance.test.refusal' as const,
    metadata: p,
  }),

  tamperedAlert: (p: SubstanceTestNotificationPayload) => ({
    title: `Tampered sample — ${p.workerName}`,
    body: `Specimen integrity compromised. Escalate to DER and safety immediately.`,
    type: 'substance.test.tampered' as const,
    metadata: p,
  }),

  custodyTransfer: (
    p: SubstanceTestNotificationPayload & { fromRole: string; toRole: string },
  ) => ({
    title: `Chain of custody update`,
    body: `Specimen transferred from ${p.fromRole} to ${p.toRole} for ${p.workerName}.`,
    type: 'substance.test.custody' as const,
    metadata: p,
  }),

  postIncidentRequired: (p: SubstanceTestNotificationPayload) => ({
    title: `Post-incident testing required`,
    body: `Incident linked test must be scheduled for ${p.workerName} within policy timeframe.`,
    type: 'substance.test.post_incident' as const,
    metadata: p,
  }),
};
