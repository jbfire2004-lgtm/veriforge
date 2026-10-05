"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_API_TEMPLATES = void 0;
exports.getProviderTemplate = getProviderTemplate;
exports.mapProviderPayload = mapProviderPayload;
exports.PROVIDER_API_TEMPLATES = [
    {
        key: 'generic_rest',
        label: 'Generic REST completions',
        description: 'Standard JSON array at `completions` with email + cert code fields.',
        completionsPath: 'completions',
        fieldMap: {
            workerEmail: 'email',
            workerPhone: 'phone',
            workerExternalId: 'worker_id',
            certificationCode: 'course_code',
            certificationName: 'course_name',
            certificateNumber: 'certificate_number',
            issuedAt: 'issued_at',
            expiresAt: 'expires_at',
            companyExternalId: 'company_id',
            projectExternalId: 'project_id',
        },
        pollMethod: 'GET',
        authHeader: 'Authorization',
        sinceQueryParam: 'since',
    },
    {
        key: 'cornerstone',
        label: 'Cornerstone-style LMS',
        description: 'Nested `data.records` with learner email and transcript fields.',
        completionsPath: 'data.records',
        fieldMap: {
            workerEmail: 'learner.email',
            workerPhone: 'learner.phone',
            workerExternalId: 'learner.id',
            certificationCode: 'transcript.courseCode',
            certificationName: 'transcript.courseTitle',
            certificateNumber: 'transcript.certificateId',
            issuedAt: 'transcript.completedOn',
            expiresAt: 'transcript.expiresOn',
            companyExternalId: 'organization.id',
            projectExternalId: 'assignment.projectId',
        },
        pollMethod: 'GET',
        authHeader: 'Authorization',
        sinceQueryParam: 'modifiedSince',
    },
    {
        key: 'safety_council_csv_json',
        label: 'Safety council webhook JSON',
        description: 'Webhook body with `trainees` array from class list upload.',
        completionsPath: 'trainees',
        fieldMap: {
            workerEmail: 'email',
            workerPhone: 'phone',
            workerExternalId: 'member_number',
            certificationCode: 'course_code',
            certificationName: 'course_name',
            certificateNumber: 'card_number',
            issuedAt: 'issue_date',
            expiresAt: 'expiry_date',
            companyExternalId: 'employer_id',
            projectExternalId: 'site_id',
        },
        pollMethod: 'POST',
    },
];
function getProviderTemplate(key) {
    return exports.PROVIDER_API_TEMPLATES.find((t) => t.key === key);
}
function readPath(obj, path) {
    return path.split('.').reduce((acc, part) => {
        if (acc == null || typeof acc !== 'object')
            return undefined;
        return acc[part];
    }, obj);
}
function mapProviderPayload(template, body) {
    const rows = readPath(body, template.completionsPath);
    if (!Array.isArray(rows))
        return [];
    return rows.map((raw) => {
        const row = raw;
        const mapped = {};
        for (const [target, sourcePath] of Object.entries(template.fieldMap)) {
            const val = readPath(row, sourcePath);
            if (val != null)
                mapped[target] = String(val);
        }
        return mapped;
    });
}
//# sourceMappingURL=provider-api-templates.js.map