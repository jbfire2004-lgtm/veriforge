"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseCodeFromName = courseCodeFromName;
exports.mapVerificationStatus = mapVerificationStatus;
exports.inferCompetencyLevel = inferCompetencyLevel;
function courseCodeFromName(name) {
    const slug = name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || 'COURSE';
}
function mapVerificationStatus(status) {
    if (!status)
        return undefined;
    const s = status.toLowerCase();
    if (s.includes('verified') && !s.includes('un'))
        return 'Verified';
    if (s.includes('reject'))
        return 'Rejected';
    return 'Pending';
}
function inferCompetencyLevel(role) {
    const r = (role !== null && role !== void 0 ? role : '').toLowerCase();
    if (r.includes('instructor') || r.includes('trainer'))
        return 'Instructor';
    if (r.includes('supervisor') || r.includes('foreman'))
        return 'Supervisor';
    if (r.includes('operator'))
        return 'Operator';
    return 'Awareness';
}
//# sourceMappingURL=assessment-engines.utils.js.map