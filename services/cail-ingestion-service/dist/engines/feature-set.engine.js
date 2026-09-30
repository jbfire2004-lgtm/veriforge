"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureSetEngine = exports.FeatureSetEngine = void 0;
class FeatureSetEngine {
    buildFromRecord(companyId, record, meta) {
        const payload = record.featureJson;
        const numeric = {};
        const categorical = {};
        for (const [key, value] of Object.entries(payload)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
                numeric[key] = value;
            }
            else if (typeof value === 'boolean') {
                categorical[key] = value ? 'true' : 'false';
            }
            else if (typeof value === 'string' && value.length <= 128) {
                categorical[key] = value;
            }
        }
        return {
            eventName: meta?.eventName,
            sourceModule: record.sourceModule,
            sourceId: record.sourceId,
            companyId,
            projectId: meta?.projectId ?? stringOrUndefined(payload.projectId ?? payload.project_id),
            entityType: stringOrUndefined(payload.entityType ?? payload.entity_type),
            entityId: stringOrUndefined(payload.entityId ?? payload.entity_id),
            occurredAt: meta?.occurredAt ?? new Date().toISOString(),
            numeric,
            categorical,
            tags: record.tags,
            raw: payload,
        };
    }
    buildFromEvent(companyId, event) {
        const data = event.data ?? {};
        const numeric = {};
        const categorical = { event: event.name };
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'number' && Number.isFinite(value)) {
                numeric[key] = value;
            }
            else if (typeof value === 'boolean') {
                categorical[key] = value ? 'true' : 'false';
            }
            else if (typeof value === 'string' && value.length <= 128) {
                categorical[key] = value;
            }
        }
        const module = event.entityType ?? event.name.split('.')[0];
        return {
            eventName: event.name,
            sourceModule: module,
            sourceId: String(event.entityId ?? `${event.name}-${event.occurredAt}`),
            companyId,
            projectId: event.projectId !== undefined ? String(event.projectId) : undefined,
            entityType: event.entityType,
            entityId: event.entityId !== undefined ? String(event.entityId) : undefined,
            occurredAt: event.occurredAt,
            numeric,
            categorical,
            tags: deriveTags(event),
            raw: data,
        };
    }
}
exports.FeatureSetEngine = FeatureSetEngine;
function stringOrUndefined(value) {
    if (value === undefined || value === null)
        return undefined;
    return String(value);
}
function deriveTags(event) {
    const tags = [event.name];
    const data = event.data ?? {};
    if (data.sifPotential === true)
        tags.push('sif');
    if (data.overdue === true)
        tags.push('overdue');
    if (Number(data.severity ?? data.severityScore ?? 0) >= 75)
        tags.push('critical');
    return tags;
}
exports.featureSetEngine = new FeatureSetEngine();
