"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anomalyEngine = exports.AnomalyEngine = void 0;
class AnomalyEngine {
    detectFromNormalization(report) {
        const findings = [];
        for (const id of report.outliers) {
            findings.push({
                sourceModule: id.split(':')[0] ?? 'unknown',
                sourceId: id.split(':')[1] ?? id,
                reason: 'Numeric outlier detected during normalization',
                severity: 'high',
            });
        }
        for (const id of report.anomalies) {
            findings.push({
                sourceModule: id.split(':')[0] ?? 'unknown',
                sourceId: id.split(':')[1] ?? id,
                reason: 'Payload flagged as anomaly',
                severity: 'medium',
            });
        }
        for (const id of report.conflicts) {
            findings.push({
                sourceModule: id.split(':')[0] ?? 'unknown',
                sourceId: id.split(':')[1] ?? id,
                reason: 'Data conflict detected',
                severity: 'medium',
            });
        }
        return findings;
    }
    detectFromFeature(feature) {
        const findings = [];
        const severity = feature.numeric.severity ?? feature.numeric.severityScore;
        if (severity !== undefined && (severity > 100 || severity < 0)) {
            findings.push({
                sourceModule: feature.sourceModule,
                sourceId: feature.sourceId,
                reason: `Severity out of expected range: ${severity}`,
                severity: 'high',
            });
        }
        if (feature.tags.includes('sif') && feature.tags.includes('overdue')) {
            findings.push({
                sourceModule: feature.sourceModule,
                sourceId: feature.sourceId,
                reason: 'SIF potential combined with overdue status',
                severity: 'high',
            });
        }
        if (Object.keys(feature.numeric).length === 0 && Object.keys(feature.categorical).length <= 2) {
            findings.push({
                sourceModule: feature.sourceModule,
                sourceId: feature.sourceId,
                reason: 'Sparse feature vector',
                severity: 'low',
            });
        }
        return findings;
    }
}
exports.AnomalyEngine = AnomalyEngine;
exports.anomalyEngine = new AnomalyEngine();
