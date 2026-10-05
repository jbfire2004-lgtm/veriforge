"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorQualificationValidator = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let InstructorQualificationValidator = class InstructorQualificationValidator {
    validate(instructor, courseCode, rules, matchedStandardCodes) {
        const issues = [];
        const matched = new Set(matchedStandardCodes);
        if (!instructor.active) {
            issues.push({
                code: 'INSTRUCTOR_NOT_QUALIFIED',
                message: 'Instructor inactive',
            });
        }
        if (instructor.qualificationStatus === client_1.InstructorQualificationStatus.SUSPENDED) {
            issues.push({
                code: 'INSTRUCTOR_NOT_QUALIFIED',
                message: 'Instructor suspended',
            });
        }
        if (instructor.qualificationExpiresAt &&
            instructor.qualificationExpiresAt < new Date()) {
            issues.push({
                code: 'INSTRUCTOR_NOT_QUALIFIED',
                message: 'Qualification expired',
            });
        }
        if (instructor.qualifiedCourseCodes.length > 0 &&
            !instructor.qualifiedCourseCodes.includes(courseCode)) {
            issues.push({
                code: 'INSTRUCTOR_NOT_QUALIFIED',
                message: `Not qualified for course ${courseCode}`,
            });
        }
        for (const rule of rules.filter((r) => r.active)) {
            if (rule.courseCodePattern &&
                !courseCode.includes(rule.courseCodePattern)) {
                continue;
            }
            if (rule.requiresLicense && !instructor.licenseNumber) {
                issues.push({
                    code: 'INSTRUCTOR_LICENSE_MISSING',
                    message: `Rule ${rule.ruleKey}: license required`,
                });
            }
            if (rule.maxQualificationAgeDays && instructor.qualificationExpiresAt) {
                const maxIssued = new Date();
                maxIssued.setDate(maxIssued.getDate() - rule.maxQualificationAgeDays);
                if (instructor.qualificationExpiresAt < maxIssued) {
                    issues.push({
                        code: 'INSTRUCTOR_NOT_QUALIFIED',
                        message: `Qualification older than ${rule.maxQualificationAgeDays} days`,
                    });
                }
            }
            for (const code of rule.requiredStandardCodes) {
                if (!matched.has(code)) {
                    issues.push({
                        code: 'CSA_STANDARD_MISSING',
                        message: `Instructor rule ${rule.ruleKey}: missing ${code}`,
                    });
                }
            }
        }
        return { valid: issues.length === 0, issues };
    }
};
exports.InstructorQualificationValidator = InstructorQualificationValidator;
exports.InstructorQualificationValidator = InstructorQualificationValidator = __decorate([
    (0, common_1.Injectable)()
], InstructorQualificationValidator);
//# sourceMappingURL=instructor-qualification.validator.js.map