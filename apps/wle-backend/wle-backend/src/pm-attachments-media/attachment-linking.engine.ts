const KNOWN_MODULE_TYPES = new Set([
  'jha_flha',
  'inspection',
  'incident',
  'capa',
  'equipment',
  'sds',
  'pm_task',
  'safety_station',
  'emergency',
  'document',
  'project',
  'hazard_control',
  'access',
  'meeting',
  'training',
  'worker_profile',
]);

export class AttachmentLinkingEngine {
  validateLink(moduleType: string, moduleRecordId: string): string | null {
    if (!KNOWN_MODULE_TYPES.has(moduleType)) {
      return `Unknown module_type: ${moduleType}`;
    }
    if (!moduleRecordId?.trim()) {
      return 'module_record_id is required';
    }
    return null;
  }

  workflowStatus(hasEntity: boolean, annotationCount: number): string {
    if (annotationCount > 0) return 'annotated';
    if (hasEntity) return 'linked';
    return 'processed';
  }
}
