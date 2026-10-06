export type IngestRecord = {
  sourceModule: string;
  sourceId: string;
  featureJson: Record<string, unknown>;
  labelJson?: Record<string, unknown>;
  qualityScore: number;
  tags: string[];
};

export type IngestQualityReport = {
  records: IngestRecord[];
  missing: string[];
  conflicts: string[];
  outliers: string[];
  anomalies: string[];
};

export class CailDataIngestionEngine {
  normalize(
    raw: Array<{
      module: string;
      id: string;
      payload: Record<string, unknown>;
    }>,
  ): IngestQualityReport {
    const records: IngestRecord[] = [];
    const missing: string[] = [];
    const conflicts: string[] = [];
    const outliers: string[] = [];
    const anomalies: string[] = [];

    for (const row of raw) {
      if (!row.id || !row.module) {
        missing.push(
          `missing_id_or_module:${JSON.stringify(row).slice(0, 80)}`,
        );
        continue;
      }

      const severity = Number(
        row.payload.severity ?? row.payload.severityScore ?? 0,
      );
      if (severity > 100) {
        outliers.push(`${row.module}:${row.id}:severity=${severity}`);
      }

      const status = String(row.payload.status ?? '');
      if (status === 'conflict' || row.payload.conflict === true) {
        conflicts.push(`${row.module}:${row.id}`);
      }

      if (row.payload.anomaly === true) {
        anomalies.push(`${row.module}:${row.id}`);
      }

      const tags: string[] = [];
      if (severity >= 75) tags.push('critical');
      if (row.payload.sifPotential === true) tags.push('sif');
      if (row.payload.overdue === true) tags.push('overdue');

      records.push({
        sourceModule: row.module,
        sourceId: row.id,
        featureJson: row.payload,
        labelJson: row.payload.label as Record<string, unknown> | undefined,
        qualityScore: conflicts.includes(`${row.module}:${row.id}`) ? 0.5 : 1,
        tags,
      });
    }

    return { records, missing, conflicts, outliers, anomalies };
  }
}
