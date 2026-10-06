import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type ForgeCheckStatus = 'Pass' | 'Fail' | 'Pending';
export type ComplianceBadgeStatus = 'valid' | 'expired' | 'pending';
export type BadgeValidity = 'valid' | 'invalid' | 'expired';
export type AccessDecision = 'ALLOW' | 'DENY';

export type DigitalBadge = {
  badgeId: string;
  userId: number;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  photoInitials: string;
  qrPayload: string;
  trainingPercent: number;
  forgeStatus: ForgeCheckStatus;
  complianceStatus: ComplianceBadgeStatus;
  complianceScore: number;
  accessDecision: AccessDecision;
  validity: BadgeValidity;
  expiresAt: string;
  timestamp: string;
  updatedAt: string;
};

export type BadgeScanResult = {
  badge: DigitalBadge;
  accessDecision: AccessDecision;
  reasons: string[];
  scannedAt: string;
};

export type BadgeAnalytics = {
  totalBadges: number;
  validCount: number;
  invalidCount: number;
  expiredCount: number;
  allowRate: number;
  denyCount: number;
  averageTraining: number;
  expiredCompliance: number;
  timestamp: string;
  userId: number | null;
};

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function evaluateAccess(badge: Omit<DigitalBadge, 'accessDecision' | 'validity'>): {
  accessDecision: AccessDecision;
  validity: BadgeValidity;
  reasons: string[];
} {
  const reasons: string[] = [];
  const expired = new Date(badge.expiresAt).getTime() < Date.now();
  if (expired) reasons.push('Badge expired');
  if (badge.trainingPercent < 80) reasons.push('Training below 80%');
  if (badge.forgeStatus !== 'Pass') reasons.push(`forgeCheck ${badge.forgeStatus}`);
  if (badge.complianceStatus === 'expired') reasons.push('Compliance expired');
  if (badge.complianceStatus === 'pending') reasons.push('Compliance pending');
  if (badge.complianceScore < 70) reasons.push('Compliance score below 70');

  const accessDecision: AccessDecision = reasons.length === 0 ? 'ALLOW' : 'DENY';
  const validity: BadgeValidity = expired
    ? 'expired'
    : accessDecision === 'ALLOW'
      ? 'valid'
      : 'invalid';
  return { accessDecision, validity, reasons };
}

@Injectable()
export class BadgeService {
  private seq = 3;
  private badges: DigitalBadge[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.badges = [
      this.finalize({
        badgeId: 'VF-BDG-1001',
        userId: 101,
        firstName: 'Jordan',
        lastName: 'Forge',
        role: 'Field Operator',
        company: 'Alloy Works',
        photoInitials: 'JF',
        qrPayload: '',
        trainingPercent: 92,
        forgeStatus: 'Pass',
        complianceStatus: 'valid',
        complianceScore: 88,
        expiresAt: new Date(Date.now() + 120 * 86400000).toISOString(),
        timestamp: now,
        updatedAt: now,
      }),
      this.finalize({
        badgeId: 'VF-BDG-1002',
        userId: 102,
        firstName: 'Riley',
        lastName: 'Steel',
        role: 'Welder',
        company: 'ForgeCo Industries',
        photoInitials: 'RS',
        qrPayload: '',
        trainingPercent: 54,
        forgeStatus: 'Fail',
        complianceStatus: 'expired',
        complianceScore: 41,
        expiresAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        timestamp: now,
        updatedAt: now,
      }),
    ];
    this.notifyExpired(this.badges[1]);
  }

  list() {
    return this.badges.map((badge) => this.refresh(badge));
  }

  getById(badgeId: string) {
    const badge = this.badges.find((item) => item.badgeId === badgeId);
    if (!badge) throw new NotFoundException(`Badge ${badgeId} not found`);
    return this.refresh(badge);
  }

  analytics(userId: number | null = null): BadgeAnalytics {
    const list = this.list();
    const total = list.length;
    const validCount = list.filter((item) => item.validity === 'valid').length;
    const invalidCount = list.filter((item) => item.validity === 'invalid').length;
    const expiredCount = list.filter((item) => item.validity === 'expired').length;
    const denyCount = list.filter((item) => item.accessDecision === 'DENY').length;
    return {
      totalBadges: total,
      validCount,
      invalidCount,
      expiredCount,
      allowRate:
        total === 0
          ? 0
          : Math.round(
              (list.filter((item) => item.accessDecision === 'ALLOW').length / total) *
                100,
            ),
      denyCount,
      averageTraining:
        total === 0
          ? 0
          : Math.round(
              list.reduce((sum, item) => sum + item.trainingPercent, 0) / total,
            ),
      expiredCompliance: list.filter((item) => item.complianceStatus === 'expired')
        .length,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  create(
    input: {
      firstName: string;
      lastName: string;
      role: string;
      company: string;
      trainingPercent?: number;
      forgeStatus?: ForgeCheckStatus;
      complianceStatus?: ComplianceBadgeStatus;
      complianceScore?: number;
      expiresAt?: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const badgeId = `VF-BDG-${1000 + this.seq++}`;
    const badge = this.finalize({
      badgeId,
      userId,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      company: input.company,
      photoInitials: initials(input.firstName, input.lastName),
      qrPayload: '',
      trainingPercent: input.trainingPercent ?? 0,
      forgeStatus: input.forgeStatus ?? 'Pending',
      complianceStatus: input.complianceStatus ?? 'pending',
      complianceScore: input.complianceScore ?? 50,
      expiresAt:
        input.expiresAt ??
        new Date(Date.now() + 180 * 86400000).toISOString(),
      timestamp: now,
      updatedAt: now,
    });
    this.badges.unshift(badge);
    this.notifyExpired(badge);
    return badge;
  }

  updateStatuses(
    badgeId: string,
    input: {
      trainingPercent?: number;
      forgeStatus?: ForgeCheckStatus;
      complianceStatus?: ComplianceBadgeStatus;
      complianceScore?: number;
    },
    userId: number,
  ) {
    const badge = this.getById(badgeId);
    if (input.trainingPercent != null) badge.trainingPercent = input.trainingPercent;
    if (input.forgeStatus) badge.forgeStatus = input.forgeStatus;
    if (input.complianceStatus) badge.complianceStatus = input.complianceStatus;
    if (input.complianceScore != null) badge.complianceScore = input.complianceScore;
    badge.userId = userId;
    badge.updatedAt = new Date().toISOString();
    const refreshed = this.refresh(badge);
    const idx = this.badges.findIndex((item) => item.badgeId === badgeId);
    this.badges[idx] = refreshed;
    this.notifyExpired(refreshed);
    return refreshed;
  }

  scan(badgeId: string, userId: number | null = null): BadgeScanResult {
    const badge = this.getById(badgeId);
    const evaluation = evaluateAccess(badge);
    const result: BadgeScanResult = {
      badge: { ...badge, ...evaluation },
      accessDecision: evaluation.accessDecision,
      reasons: evaluation.reasons,
      scannedAt: new Date().toISOString(),
    };
    if (result.accessDecision === 'DENY') {
      this.notifications.enqueue({
        category: 'verification',
        title: 'BADGE ACCESS DENIED',
        message: `${badge.firstName} ${badge.lastName} (${badge.badgeId}): ${evaluation.reasons.join('; ')}`,
        forgeStatus: 'failed',
      });
    }
    if (userId != null) {
      badge.userId = userId;
      badge.updatedAt = new Date().toISOString();
    }
    return result;
  }

  private finalize(
    partial: Omit<DigitalBadge, 'accessDecision' | 'validity' | 'qrPayload'> & {
      qrPayload: string;
    },
  ): DigitalBadge {
    const qrPayload = `veriforge://badge/${partial.badgeId}?u=${partial.userId}&t=${encodeURIComponent(partial.timestamp)}`;
    const base = { ...partial, qrPayload };
    const evaluation = evaluateAccess(base);
    return { ...base, ...evaluation };
  }

  private refresh(badge: DigitalBadge): DigitalBadge {
    const evaluation = evaluateAccess(badge);
    return { ...badge, ...evaluation };
  }

  private notifyExpired(badge: DigitalBadge) {
    if (badge.complianceStatus !== 'expired' && badge.validity !== 'expired') return;
    this.notifications.enqueue({
      category: 'compliance',
      title: 'BADGE COMPLIANCE EXPIRED',
      message: `${badge.firstName} ${badge.lastName} (${badge.badgeId}) requires renewal.`,
      forgeStatus: 'failed',
    });
  }
}
