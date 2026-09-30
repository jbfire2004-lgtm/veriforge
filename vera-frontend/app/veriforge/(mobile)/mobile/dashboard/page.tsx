"use client";

import Link from "next/link";
import {
  MobileAngularCard,
  MobileQuickLink,
  MobileScreenHeader,
  MobileStatusChip,
  VERIFORGE_MOBILE_BASE,
  VeriForgeProgressBar,
  useComplianceScoreSync,
  useTrainingAnalyticsSync,
  useIncidentAnalyticsSync,
  useContractorAnalyticsSync,
  useRiskAnalyticsSync,
  useBadgeAnalyticsSync,
  useCultureAnalyticsSync,
  useEmergencyAnalyticsSync,
  useInspectionAnalyticsSync,
  useSiteSafetyAnalyticsSync,
  useContractorOnboardingAnalyticsSync,
  useFieldAnalyticsSync,
  useSafetyKpiAnalyticsSync,
  useEnterpriseArchitectureAnalyticsSync,
  useBrandExpansionAnalyticsSync,
  useMotionAnalyticsSync,
  useIconographyAnalyticsSync,
  usePredictiveAnalyticsSync,
  useDeploymentAnalyticsSync,
  useAnimationAnalyticsSync,
  useReportingAnalyticsSync,
  useDigitalTwinAnalyticsSync,
  useSoundAnalyticsSync,
  useCommandCenterAnalyticsSync,
  useLedgerAnalyticsSync,
  AnvilIcon,
  ForgeBoltIcon,
  ShieldGridIcon,
  HeatEdgeIcon,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileDashboardPage() {
  const { score } = useComplianceScoreSync(78);
  const { analytics: training } = useTrainingAnalyticsSync();
  const { analytics: incidents } = useIncidentAnalyticsSync();
  const { analytics: contractors } = useContractorAnalyticsSync();
  const { analytics: risk } = useRiskAnalyticsSync();
  const { analytics: badges } = useBadgeAnalyticsSync();
  const { analytics: culture } = useCultureAnalyticsSync();
  const { analytics: emergency } = useEmergencyAnalyticsSync();
  const { analytics: inspections } = useInspectionAnalyticsSync();
  const { analytics: siteSafety } = useSiteSafetyAnalyticsSync();
  const { analytics: ctrOnboarding } = useContractorOnboardingAnalyticsSync();
  const { analytics: fieldOps } = useFieldAnalyticsSync();
  const { analytics: safetyKpis } = useSafetyKpiAnalyticsSync();
  const { analytics: architecture } = useEnterpriseArchitectureAnalyticsSync();
  const { analytics: brandExpansion } = useBrandExpansionAnalyticsSync();
  const { analytics: motion } = useMotionAnalyticsSync();
  const { analytics: iconography } = useIconographyAnalyticsSync();
  const { analytics: predictive } = usePredictiveAnalyticsSync();
  const { analytics: deployment } = useDeploymentAnalyticsSync();
  const { analytics: animation } = useAnimationAnalyticsSync();
  const { analytics: reporting } = useReportingAnalyticsSync();
  const { analytics: digitalTwin } = useDigitalTwinAnalyticsSync();
  const { analytics: sounds } = useSoundAnalyticsSync();
  const { analytics: command } = useCommandCenterAnalyticsSync();
  const { analytics: ledger } = useLedgerAnalyticsSync();

  const complianceValue = score.score;
  const trainingValue = training.completionRate;
  const incidentProgress = incidents.investigationProgress;

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Dashboard"
        title="Field Command"
        description="Live training, verification, and compliance signals synced from VeriForge engines."
      />

      <div className="grid gap-3">
        <MobileAngularCard critical={complianceValue < 70}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Compliance
            </p>
            <MobileStatusChip
              label={complianceValue < 70 ? "Gap" : "Stable"}
              tone={complianceValue < 70 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar label="Live Score" value={complianceValue} />
        </MobileAngularCard>

        <MobileAngularCard critical={training.overdueModules > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Training
            </p>
            <MobileStatusChip label="Modules" tone="neutral" />
          </div>
          <VeriForgeProgressBar
            label={`Completion · overdue ${training.overdueModules}`}
            value={trainingValue}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={incidents.criticalCount > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Incidents
            </p>
            <MobileStatusChip
              label={`${incidents.openIncidents} open`}
              tone={incidents.criticalCount > 0 ? "critical" : "pending"}
            />
          </div>
          <VeriForgeProgressBar label="Investigation" value={incidentProgress} />
        </MobileAngularCard>

        <MobileAngularCard critical={risk.highRiskCount > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Risk
            </p>
            <MobileStatusChip
              label={`${risk.highRiskCount} high`}
              tone={risk.highRiskCount > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Control effectiveness · residual ${risk.averageResidual}`}
            value={risk.controlEffectiveness}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={badges.denyCount > 0 || badges.expiredCompliance > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Badges
            </p>
            <MobileStatusChip
              label={`${badges.allowRate}% allow`}
              tone={badges.denyCount > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Access allow rate · denied ${badges.denyCount}`}
            value={badges.allowRate}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={culture.priorityGaps > 0 || culture.cultureScore < 70}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Culture
            </p>
            <MobileStatusChip
              label={`${culture.priorityGaps} gaps`}
              tone={culture.priorityGaps > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Culture score · at-risk ${culture.atRiskBehaviors}`}
            value={culture.cultureScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={emergency.criticalCount > 0 || emergency.activeEmergencies > 0}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Emergency
            </p>
            <MobileStatusChip
              label={`${emergency.activeEmergencies} active`}
              tone={emergency.criticalCount > 0 ? "critical" : "pending"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Response · missing ${emergency.missingPersonnel}`}
            value={emergency.averageResponsePercent}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            inspections.criticalDefects > 0 || inspections.overdueInspections > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Inspections
            </p>
            <MobileStatusChip
              label={`${inspections.overdueInspections} overdue`}
              tone={
                inspections.criticalDefects > 0 || inspections.overdueInspections > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Avg score · defects ${inspections.openDefects}`}
            value={inspections.averageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            siteSafety.criticalHazards > 0 || siteSafety.expiredPermits > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Site Safety
            </p>
            <MobileStatusChip
              label={`${siteSafety.criticalHazards} critical`}
              tone={
                siteSafety.criticalHazards > 0 || siteSafety.expiredPermits > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Score · readiness ${siteSafety.workerReadiness}%`}
            value={siteSafety.averageSafetyScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            ctrOnboarding.complianceGaps > 0 || ctrOnboarding.accessDenied > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Ctr Onboarding
            </p>
            <MobileStatusChip
              label={`${ctrOnboarding.accessDenied} denied`}
              tone={
                ctrOnboarding.complianceGaps > 0 || ctrOnboarding.accessDenied > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Score · pass ${ctrOnboarding.verificationPassRate}%`}
            value={ctrOnboarding.averageOnboardingScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            fieldOps.criticalHazards > 0 || fieldOps.overdueTasks > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Field Ops
            </p>
            <MobileStatusChip
              label={`${fieldOps.overdueTasks} overdue`}
              tone={
                fieldOps.criticalHazards > 0 || fieldOps.overdueTasks > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Status · hazards ${fieldOps.criticalHazards}`}
            value={fieldOps.fieldStatusScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            safetyKpis.criticalCount > 0 || safetyKpis.negativeTrends > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Safety KPIs
            </p>
            <MobileStatusChip
              label={`${safetyKpis.criticalCount} critical`}
              tone={
                safetyKpis.criticalCount > 0 || safetyKpis.negativeTrends > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Avg · trends ↓ ${safetyKpis.negativeTrends}`}
            value={safetyKpis.averageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            architecture.criticalLayers > 0 || architecture.observabilityCritical > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Architecture
            </p>
            <MobileStatusChip
              label={`${architecture.criticalLayers} critical`}
              tone={
                architecture.criticalLayers > 0 || architecture.observabilityCritical > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Score · RLS ${architecture.rlsCoverage}%`}
            value={architecture.architectureScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            brandExpansion.activeSubBrands < brandExpansion.subBrandCount ||
            brandExpansion.brandConsistencyScore < 70
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Brand Expand
            </p>
            <MobileStatusChip
              label={`${brandExpansion.activeSubBrands}/${brandExpansion.subBrandCount}`}
              tone={
                brandExpansion.activeSubBrands < brandExpansion.subBrandCount ||
                brandExpansion.brandConsistencyScore < 70
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Consistency · campaigns ${brandExpansion.activeCampaigns}`}
            value={brandExpansion.brandConsistencyScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={motion.criticalPlays > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Motion
            </p>
            <MobileStatusChip
              label={`${motion.playCount} plays`}
              tone={motion.criticalPlays > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Coverage · critical ${motion.criticalPlays}`}
            value={motion.motionCoverageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={iconography.criticalSelections > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Icons
            </p>
            <MobileStatusChip
              label={`${iconography.totalIcons} icons`}
              tone={iconography.criticalSelections > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Coverage · views ${iconography.viewCount}`}
            value={iconography.iconCoverageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={predictive.criticalCount > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Predictive AI
            </p>
            <MobileStatusChip
              label={`${predictive.totalPredictions} preds`}
              tone={predictive.criticalCount > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Health · critical ${predictive.criticalCount}`}
            value={predictive.predictiveHealthScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={deployment.criticalCount > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Deployment
            </p>
            <MobileStatusChip
              label={`${deployment.rolloutProgress}% roll`}
              tone={deployment.criticalCount > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Readiness · critical ${deployment.criticalCount}`}
            value={deployment.globalReadinessScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={animation.criticalPlays > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Animations
            </p>
            <MobileStatusChip
              label={`${animation.playCount} plays`}
              tone={animation.criticalPlays > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Coverage · critical ${animation.criticalPlays}`}
            value={animation.animationCoverageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={reporting.criticalCount > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Reports
            </p>
            <MobileStatusChip
              label={`${reporting.totalReports} rpts`}
              tone={reporting.criticalCount > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Readiness · critical ${reporting.criticalCount}`}
            value={reporting.executiveReadinessScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={
            digitalTwin.activeHazards > 0 || digitalTwin.criticalEquipment > 0
          }
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Digital Twin
            </p>
            <MobileStatusChip
              label={`${digitalTwin.twinHealthScore}%`}
              tone={
                digitalTwin.activeHazards > 0 || digitalTwin.criticalEquipment > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Health · hazards ${digitalTwin.activeHazards}`}
            value={digitalTwin.twinHealthScore}
          />
        </MobileAngularCard>

        <MobileAngularCard critical={sounds.criticalPlays > 0}>
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Sounds
            </p>
            <MobileStatusChip
              label={`${sounds.playCount} plays`}
              tone={sounds.criticalPlays > 0 ? "critical" : "pass"}
            />
          </div>
          <VeriForgeProgressBar
            label={`Coverage · critical ${sounds.criticalPlays}`}
            value={sounds.soundCoverageScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={command.criticalSites > 0 || command.activeEmergencies > 0}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Command
            </p>
            <MobileStatusChip
              label={`${command.totalSites} sites`}
              tone={
                command.criticalSites > 0 || command.activeEmergencies > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Health · critical ${command.criticalSites}`}
            value={command.commandHealthScore}
          />
        </MobileAngularCard>

        <MobileAngularCard
          critical={!ledger.chainIntegrity || ledger.criticalBlocks > 0}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
              Ledger
            </p>
            <MobileStatusChip
              label={`${ledger.totalBlocks} blocks`}
              tone={
                !ledger.chainIntegrity || ledger.criticalBlocks > 0
                  ? "critical"
                  : "pass"
              }
            />
          </div>
          <VeriForgeProgressBar
            label={`Health · critical ${ledger.criticalBlocks}`}
            value={ledger.ledgerHealthScore}
          />
        </MobileAngularCard>
      </div>

      <div className="space-y-2">
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Quick Launch
        </p>
        <MobileQuickLink
          href={`${VERIFORGE_MOBILE_BASE}/training`}
          title="Training"
          subtitle="Modules, progress, and active assignments"
          icon={<AnvilIcon />}
        />
        <MobileQuickLink
          href={`${VERIFORGE_MOBILE_BASE}/verification`}
          title="Verification"
          subtitle="forgeCheck workflows and status rails"
          icon={<ForgeBoltIcon />}
        />
        <MobileQuickLink
          href={`${VERIFORGE_MOBILE_BASE}/compliance`}
          title="Compliance"
          subtitle="Documents, uploads, expired alerts"
          icon={<ShieldGridIcon />}
          critical={contractors.expiredDocuments > 0 || complianceValue < 70}
        />
        <MobileQuickLink
          href={`${VERIFORGE_MOBILE_BASE}/incidents`}
          title="Incidents"
          subtitle="Severity-ranked field reports"
          icon={<HeatEdgeIcon />}
          critical={incidents.criticalCount > 0}
        />
      </div>

      <Link
        href={`${VERIFORGE_MOBILE_BASE}/notifications`}
        className="block border border-[#424242] bg-[#151515] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-[#ffc9c9]"
      >
        Open Notification Center
      </Link>
    </div>
  );
}
