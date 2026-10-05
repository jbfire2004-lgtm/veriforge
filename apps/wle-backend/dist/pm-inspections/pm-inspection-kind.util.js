"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateScoringRules = templateScoringRules;
exports.inspectionKind = inspectionKind;
exports.isPhotoFirstTemplate = isPhotoFirstTemplate;
exports.isSmartSiteTemplate = isSmartSiteTemplate;
exports.skipChecklistValidation = skipChecklistValidation;
function templateScoringRules(template) {
    if (!template.scoringRules || typeof template.scoringRules !== 'object') {
        return {};
    }
    return template.scoringRules;
}
function inspectionKind(template) {
    var _a;
    const rules = templateScoringRules(template);
    if (typeof rules.inspectionKind === 'string')
        return rules.inspectionKind;
    if (template.name === 'Smart Site Inspection')
        return 'smart_site';
    if ((_a = template.name) === null || _a === void 0 ? void 0 : _a.startsWith('Focus Audit —'))
        return 'focus_audit';
    return 'checklist';
}
function isPhotoFirstTemplate(template) {
    const rules = templateScoringRules(template);
    const kind = inspectionKind(template);
    return (kind === 'smart_site' || kind === 'focus_audit' || rules.photoFirst === true);
}
function isSmartSiteTemplate(template) {
    return inspectionKind(template) === 'smart_site';
}
function skipChecklistValidation(template) {
    const rules = templateScoringRules(template);
    return isSmartSiteTemplate(template) || rules.skipChecklistScoring === true;
}
//# sourceMappingURL=pm-inspection-kind.util.js.map