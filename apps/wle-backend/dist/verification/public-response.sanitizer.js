"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicCompanyName = publicCompanyName;
exports.publicTrainingRecord = publicTrainingRecord;
exports.publicCredential = publicCredential;
exports.publicEquipmentSummary = publicEquipmentSummary;
exports.publicWorkerCard = publicWorkerCard;
exports.publicEquipmentCard = publicEquipmentCard;
function publicCompanyName(company) {
    if (!(company === null || company === void 0 ? void 0 : company.name))
        return null;
    return { name: company.name };
}
function publicTrainingRecord(tr) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        courseName: (_c = (_a = tr.courseName) !== null && _a !== void 0 ? _a : (_b = tr.certification) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Training',
        certificationCode: (_e = (_d = tr.certification) === null || _d === void 0 ? void 0 : _d.code) !== null && _e !== void 0 ? _e : null,
        expiresAt: (_f = tr.expiresAt) !== null && _f !== void 0 ? _f : null,
        issuedAt: (_g = tr.issuedAt) !== null && _g !== void 0 ? _g : null,
        completedAt: (_h = tr.completedAt) !== null && _h !== void 0 ? _h : null,
        status: tr.expiresAt && tr.expiresAt <= new Date() ? 'EXPIRED' : 'ACTIVE',
    };
}
function publicCredential(c) {
    var _a, _b, _c, _d, _e, _f, _g;
    const valid = !c.expiresAt || c.expiresAt.getTime() > Date.now();
    return {
        name: (_c = (_a = c.name) !== null && _a !== void 0 ? _a : (_b = c.certification) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Credential',
        status: valid ? 'VALID' : 'EXPIRED',
        issuedOn: (_d = c.issuedAt) !== null && _d !== void 0 ? _d : null,
        expiresOn: (_e = c.expiresAt) !== null && _e !== void 0 ? _e : null,
        certificationName: (_g = (_f = c.certification) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : null,
    };
}
function publicEquipmentSummary(eq) {
    var _a, _b;
    return {
        name: eq.name,
        safetyStatus: (_a = eq.safetyStatus) !== null && _a !== void 0 ? _a : 'OK',
        isSafe: ((_b = eq.safetyStatus) !== null && _b !== void 0 ? _b : 'OK') === 'OK',
    };
}
function publicWorkerCard(input) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        type: 'worker',
        publicRef: input.qrToken,
        displayName: `${input.firstName} ${input.lastName}`.trim(),
        photoUrl: (_a = input.photoUrl) !== null && _a !== void 0 ? _a : null,
        company: input.companyName ? { name: input.companyName } : null,
        compliance: input.compliance
            ? {
                isCompliant: (_b = input.compliance.isCompliant) !== null && _b !== void 0 ? _b : false,
                issueCount: (_d = (_c = input.compliance.issues) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
            }
            : undefined,
        training: (_e = input.certifications) !== null && _e !== void 0 ? _e : [],
        credentials: (_f = input.credentials) !== null && _f !== void 0 ? _f : [],
        equipment: (_g = input.equipment) !== null && _g !== void 0 ? _g : [],
    };
}
function publicEquipmentCard(input) {
    var _a, _b, _c, _d;
    return {
        type: 'equipment',
        publicRef: input.qrToken,
        name: input.name,
        safetyStatus: (_a = input.safetyStatus) !== null && _a !== void 0 ? _a : 'OK',
        isSafe: ((_b = input.safetyStatus) !== null && _b !== void 0 ? _b : 'OK') === 'OK',
        photoUrl: (_c = input.photoUrl) !== null && _c !== void 0 ? _c : null,
        company: input.companyName ? { name: input.companyName } : null,
        assignedWorkers: (_d = input.assignedWorkers) !== null && _d !== void 0 ? _d : [],
    };
}
//# sourceMappingURL=public-response.sanitizer.js.map