export type CorrelationLink = {
  leftModule: string;
  leftEntityId: string;
  rightModule: string;
  rightEntityId: string;
  correlationType: string;
  strength: number;
  evidence: string[];
};

export class CailCorrelationEngine {
  hazardToJha(hazardId: string, jhaIds: string[]): CorrelationLink[] {
    return jhaIds.map((jhaId) => ({
      leftModule: 'hazard',
      leftEntityId: hazardId,
      rightModule: 'jha_flha',
      rightEntityId: jhaId,
      correlationType: 'hazard_jha',
      strength: 0.85,
      evidence: [`hazard ${hazardId} referenced in JHA ${jhaId}`],
    }));
  }

  hazardToIncident(hazardId: string, incidentIds: string[]): CorrelationLink[] {
    return incidentIds.map((incId) => ({
      leftModule: 'hazard',
      leftEntityId: hazardId,
      rightModule: 'incident',
      rightEntityId: incId,
      correlationType: 'hazard_incident',
      strength: 0.9,
      evidence: [`hazard ${hazardId} linked to incident ${incId}`],
    }));
  }

  workerToCapa(workerId: number, capaIds: string[]): CorrelationLink[] {
    return capaIds.map((capaId) => ({
      leftModule: 'worker',
      leftEntityId: String(workerId),
      rightModule: 'corrective_action',
      rightEntityId: capaId,
      correlationType: 'worker_capa',
      strength: 0.8,
      evidence: [`worker ${workerId} assigned or linked to CAPA ${capaId}`],
    }));
  }

  equipmentToInspection(
    equipmentId: number,
    inspectionIds: string[],
  ): CorrelationLink[] {
    return inspectionIds.map((inspId) => ({
      leftModule: 'equipment',
      leftEntityId: String(equipmentId),
      rightModule: 'inspection',
      rightEntityId: inspId,
      correlationType: 'equipment_inspection',
      strength: 0.75,
      evidence: [`equipment ${equipmentId} failed inspection ${inspId}`],
    }));
  }

  controlToCapa(controlId: string, capaIds: string[]): CorrelationLink[] {
    return capaIds.map((capaId) => ({
      leftModule: 'control',
      leftEntityId: controlId,
      rightModule: 'corrective_action',
      rightEntityId: capaId,
      correlationType: 'control_capa',
      strength: 0.82,
      evidence: [`weak control ${controlId} drove CAPA ${capaId}`],
    }));
  }
}
