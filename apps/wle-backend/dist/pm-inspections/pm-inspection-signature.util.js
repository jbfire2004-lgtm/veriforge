"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequiredSignatures = parseRequiredSignatures;
exports.missingRequiredSignatureRoles = missingRequiredSignatureRoles;
exports.signatureHasImage = signatureHasImage;
exports.assertEditableInspectionStatus = assertEditableInspectionStatus;
exports.assertSignatureRoleAllowed = assertSignatureRoleAllowed;
exports.assertSignaturePayload = assertSignaturePayload;
exports.assertAllRequiredSignaturesPresent = assertAllRequiredSignaturesPresent;
const common_1 = require("@nestjs/common");
function parseRequiredSignatures(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw.filter((row) => row != null &&
        typeof row === 'object' &&
        typeof row.role === 'string');
}
function missingRequiredSignatureRoles(required, existing) {
    const signed = new Set(existing.map((s) => s.role));
    return required.filter((r) => !signed.has(r.role)).map((r) => r.role);
}
function signatureHasImage(data) {
    var _a;
    if (data.coreFileId != null)
        return true;
    const value = (_a = data.signatureData) === null || _a === void 0 ? void 0 : _a.trim();
    return Boolean(value && value.length > 8);
}
function assertEditableInspectionStatus(status) {
    if (!['draft', 'in_progress'].includes(status)) {
        throw new common_1.BadRequestException('Inspection is not editable');
    }
}
function assertSignatureRoleAllowed(role, required) {
    if (!required.some((r) => r.role === role)) {
        throw new common_1.BadRequestException(`Signature role not required: ${role}`);
    }
}
function assertSignaturePayload(data, required) {
    var _a;
    const role = (_a = data.role) === null || _a === void 0 ? void 0 : _a.trim();
    if (!role) {
        throw new common_1.BadRequestException('Signature role is required');
    }
    assertSignatureRoleAllowed(role, required);
    const hasDataUrl = typeof data.signatureData === 'string' &&
        data.signatureData.trim().length > 0;
    const hasCoreFile = data.coreFileId != null;
    if (!hasDataUrl && !hasCoreFile) {
        throw new common_1.BadRequestException('Signature image is required');
    }
    if (hasDataUrl &&
        data.signatureData.startsWith('data:') &&
        !/^data:image\/png;base64,/i.test(data.signatureData)) {
        throw new common_1.BadRequestException('Signature must be a PNG image');
    }
    return {
        role,
        signatureData: hasDataUrl ? data.signatureData.trim() : undefined,
        coreFileId: hasCoreFile ? data.coreFileId : undefined,
    };
}
function assertAllRequiredSignaturesPresent(required, existing) {
    const missing = missingRequiredSignatureRoles(required, existing);
    if (missing.length) {
        throw new common_1.BadRequestException(`Missing signature: ${missing[0]}`);
    }
    for (const req of required) {
        const row = existing.find((s) => s.role === req.role);
        if (!row || !signatureHasImage(row)) {
            throw new common_1.BadRequestException(`Missing signature image: ${req.role}`);
        }
    }
}
//# sourceMappingURL=pm-inspection-signature.util.js.map