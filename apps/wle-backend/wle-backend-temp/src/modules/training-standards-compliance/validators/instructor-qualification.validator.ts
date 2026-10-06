import { Injectable } from '@nestjs/common';
import {
  InstructorQualificationRule,
  InstructorQualificationStatus,
  TrainingInstructor,
} from '@prisma/client';

export interface InstructorValidationIssue {
  code: string;
  message: string;
}

@Injectable()
export class InstructorQualificationValidator {
  validate(
    instructor: TrainingInstructor,
    courseCode: string,
    rules: InstructorQualificationRule[],
    matchedStandardCodes: string[],
  ): { valid: boolean; issues: InstructorValidationIssue[] } {
    const issues: InstructorValidationIssue[] = [];
    const matched = new Set(matchedStandardCodes);

    if (!instructor.active) {
      issues.push({
        code: 'INSTRUCTOR_NOT_QUALIFIED',
        message: 'Instructor inactive',
      });
    }
    if (
      instructor.qualificationStatus === InstructorQualificationStatus.SUSPENDED
    ) {
      issues.push({
        code: 'INSTRUCTOR_NOT_QUALIFIED',
        message: 'Instructor suspended',
      });
    }
    if (
      instructor.qualificationExpiresAt &&
      instructor.qualificationExpiresAt < new Date()
    ) {
      issues.push({
        code: 'INSTRUCTOR_NOT_QUALIFIED',
        message: 'Qualification expired',
      });
    }
    if (
      instructor.qualifiedCourseCodes.length > 0 &&
      !instructor.qualifiedCourseCodes.includes(courseCode)
    ) {
      issues.push({
        code: 'INSTRUCTOR_NOT_QUALIFIED',
        message: `Not qualified for course ${courseCode}`,
      });
    }

    for (const rule of rules.filter((r) => r.active)) {
      if (
        rule.courseCodePattern &&
        !courseCode.includes(rule.courseCodePattern)
      ) {
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
}
