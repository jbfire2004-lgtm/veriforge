import { Injectable } from '@nestjs/common';
import {
  InstructorQualificationStatus,
  ProviderComplianceLevel,
  ProviderApprovalStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingLegislationEngine } from '../../training-provider/provider.legislation';

@Injectable()
export class TrainingProviderComplianceService {
  private readonly legislation = new TrainingLegislationEngine();

  constructor(private readonly prisma: PrismaService) {}

  async assessProvider(providerId: number, notes?: string) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
      include: {
        courses: { include: { standards: true } },
        instructors: true,
        approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!provider) return null;

    const gaps: string[] = [];
    let score = 100;

    if (provider.approvalStatus !== ProviderApprovalStatus.APPROVED) {
      gaps.push('Provider not approved');
      score -= 30;
    }

    const expiredInstructors = provider.instructors.filter(
      (i) =>
        i.qualificationStatus === InstructorQualificationStatus.EXPIRED ||
        (i.qualificationExpiresAt && i.qualificationExpiresAt < new Date()),
    );
    if (expiredInstructors.length > 0) {
      gaps.push(
        `${expiredInstructors.length} instructor(s) with expired qualifications`,
      );
      score -= 15;
    }

    const coursesWithoutStandards = provider.courses.filter(
      (c) => c.active && c.standards.length === 0,
    );
    if (coursesWithoutStandards.length > 0) {
      gaps.push(
        `${coursesWithoutStandards.length} active course(s) missing standards`,
      );
      score -= 10;
    }

    for (const course of provider.courses) {
      if (!course.contentText?.trim()) continue;
      const assessment = this.legislation.assessProgram(course.contentText);
      if (!assessment.passed) {
        gaps.push(
          `Course ${course.code} content below standards threshold (${assessment.score}%)`,
        );
        score -= 5;
      }
    }

    score = Math.max(0, Math.min(100, score));
    const status =
      score >= 85 && gaps.length === 0
        ? ProviderComplianceLevel.COMPLIANT
        : score >= 60
        ? ProviderComplianceLevel.NEEDS_ATTENTION
        : ProviderComplianceLevel.NON_COMPLIANT;

    const row = await this.prisma.providerComplianceStatus.create({
      data: {
        providerId,
        status,
        score,
        gaps: gaps,
        notes,
      },
    });

    return { ...row, gaps };
  }

  async latestCompliance(providerId: number) {
    return this.prisma.providerComplianceStatus.findFirst({
      where: { providerId },
      orderBy: { assessedAt: 'desc' },
    });
  }

  validateInstructorForCourse(
    instructor: {
      active: boolean;
      qualificationStatus: InstructorQualificationStatus;
      qualificationExpiresAt: Date | null;
      qualifiedCourseCodes: string[];
    },
    courseCode: string,
  ): { valid: boolean; reason?: string } {
    if (!instructor.active) {
      return { valid: false, reason: 'INSTRUCTOR_INACTIVE' };
    }
    if (
      instructor.qualificationStatus === InstructorQualificationStatus.SUSPENDED
    ) {
      return { valid: false, reason: 'INSTRUCTOR_SUSPENDED' };
    }
    if (
      instructor.qualificationExpiresAt &&
      instructor.qualificationExpiresAt < new Date()
    ) {
      return { valid: false, reason: 'QUALIFICATION_EXPIRED' };
    }
    if (
      instructor.qualifiedCourseCodes.length > 0 &&
      !instructor.qualifiedCourseCodes.includes(courseCode)
    ) {
      return { valid: false, reason: 'NOT_QUALIFIED_FOR_COURSE' };
    }
    return { valid: true };
  }
}
