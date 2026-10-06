const REQUIRED: Record<string, string[]> = {
  'jhaFlha.sync': ['clientSyncId', 'companyId', 'projectId'],
  'pmInspections.sync': ['clientSyncId'],
  'pmIncidents.sync': ['clientSyncId'],
  'pmCapa.sync': ['clientSyncId'],
  'pmTraining.sync': ['clientSyncId'],
  'pmDocuments.sync': ['projectId'],
  'pmEquipment.sync': ['projectId'],
  'pmEmergency.sync': ['projectId'],
  'pmSiteAccess.sync': ['projectId'],
  'pmAttachments.sync': ['projectId'],
  'pmSafetyStations.sync': ['stationId'],
  'pmProjectManagement.sync': ['projectId'],
  'sifHeca.sync': ['clientSyncId'],
  'pmSafetyMeetings.sync': ['clientSyncId'],
  'safetyFormV2.submit': ['clientSyncId', 'definitionId'],
  'worker.link': ['workerId', 'companyId'],
  'equipment.link': ['equipmentId', 'companyId'],
  'project.assignWorker': ['projectId', 'workerId'],
  'inspection.submit': ['equipmentId'],
};

export class OfflineValidationEngine {
  validate(actionType: string, payload: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const required = REQUIRED[actionType];
    if (required) {
      for (const key of required) {
        if (payload[key] == null || payload[key] === '') {
          errors.push(`Missing required field: ${key}`);
        }
      }
    }
    if (!actionType?.trim()) {
      errors.push('Action type is required');
    }
    return errors;
  }
}
