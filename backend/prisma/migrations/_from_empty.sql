-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'UNION_HALL_ADMIN', 'COMPANY_ADMIN', 'ADMIN', 'SUPERVISOR', 'PROJECT_MANAGER', 'WORKER', 'CONTRACTOR_ADMIN', 'CONTRACTOR_USER', 'TRAINING_PROVIDER_ADMIN', 'TRAINING_INSTRUCTOR');

-- CreateEnum
CREATE TYPE "ProviderApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProviderComplianceLevel" AS ENUM ('COMPLIANT', 'NEEDS_ATTENTION', 'NON_COMPLIANT', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "InstructorQualificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TrainingStandardKind" AS ENUM ('CSA', 'PROVINCIAL_OHS', 'FEDERAL_OHS', 'INDUSTRY_COP');

-- CreateEnum
CREATE TYPE "TrainingValidationOutcome" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "CredentialLedgerActorType" AS ENUM ('SYSTEM', 'PROVIDER', 'SUPERVISOR', 'WORKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CredentialLedgerEventType" AS ENUM ('CREATED', 'UPDATED', 'VERIFIED', 'REVOKED', 'EXPIRED', 'CORRECTED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "TrainingValidationSubject" AS ENUM ('TRAINING_RECORD', 'PROVIDER', 'INSTRUCTOR', 'CERTIFICATE', 'COURSE');

-- CreateEnum
CREATE TYPE "RegulatoryComplianceStatus" AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TrainingCredentialNftMintStatus" AS ENUM ('PENDING_MINT', 'MINTED', 'FAILED', 'REVOKED');

-- CreateEnum
CREATE TYPE "NftMintJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TrainingRejectionSeverity" AS ENUM ('ERROR', 'WARNING');

-- CreateEnum
CREATE TYPE "TrainingRejectionCategory" AS ENUM ('STANDARD', 'JURISDICTION', 'PROVIDER', 'INSTRUCTOR', 'EXPIRY', 'CERTIFICATE', 'PROGRAM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'REMOVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProjectComplianceRuleType" AS ENUM ('ALL_WORKERS', 'ROLE', 'TRADE');

-- CreateEnum
CREATE TYPE "ProjectComplianceAlertType" AS ENUM ('MISSING', 'EXPIRED', 'EXPIRING_SOON');

-- CreateEnum
CREATE TYPE "LinkComplianceStatus" AS ENUM ('COMPLIANT', 'NEEDS_ATTENTION', 'NON_COMPLIANT', 'LOCKED_OUT');

-- CreateEnum
CREATE TYPE "UnionMembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ENDED');

-- CreateEnum
CREATE TYPE "EquipmentSafetyStatus" AS ENUM ('OK', 'NEEDS_INSPECTION', 'UNSAFE');

-- CreateEnum
CREATE TYPE "EquipmentLockoutStatus" AS ENUM ('CLEAR', 'LOCKED_OUT');

-- CreateEnum
CREATE TYPE "WorkerSiteStatus" AS ENUM ('ALLOWED', 'BANNED');

-- CreateEnum
CREATE TYPE "TrainingAttestationRole" AS ENUM ('SUPERVISOR', 'WORKER', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentCatalogCategory" AS ENUM ('MOBILE_EQUIPMENT', 'SAFETY_CRITICAL', 'SERIALIZED_TOOLS', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionKind" AS ENUM ('PRE_USE', 'FORMAL');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('PRE_USE', 'SCHEDULED', 'PME', 'CRANE_LIFT', 'LIFTING_GEAR', 'VEHICLE', 'TOOL', 'HYDRAULIC_PNEUMATIC');

-- CreateEnum
CREATE TYPE "InspectionChecklistCategory" AS ENUM ('MOBILE_EQUIPMENT', 'LIFTING_GEAR', 'VEHICLE', 'TOOL', 'PME', 'CRANE', 'GENERAL');

-- CreateEnum
CREATE TYPE "EquipmentMaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'SCHEDULED', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "EquipmentAttachmentType" AS ENUM ('PHOTO', 'MANUAL', 'CERTIFICATE', 'INSPECTION_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('ACTIVE', 'INSPECTION_DUE', 'RETIRED', 'LOST');

-- CreateEnum
CREATE TYPE "PpeStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PpeType" AS ENUM ('HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'HARNESS', 'FOOTWEAR', 'HEARING', 'RESPIRATOR', 'COVERALL', 'OTHER');

-- CreateEnum
CREATE TYPE "ToolsPpeAssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "UnionHallTrainingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PUSHED');

-- CreateEnum
CREATE TYPE "FeedbackRequestStatus" AS ENUM ('NEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "CoreComplianceNoteCategory" AS ENUM ('REGULATORY', 'AUDIT', 'INTERNAL', 'CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CoreComplianceNoteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CoreComplianceNotePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "CoreDailyLogShift" AS ENUM ('DAY', 'NIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "CoreSiteRiskCategory" AS ENUM ('STRUCTURAL', 'ELECTRICAL', 'ERGONOMIC', 'ENVIRONMENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CoreSiteRiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CoreSiteRiskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'MITIGATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SafetyObservationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SafetyObservationStatus" AS ENUM ('OPEN', 'REVIEWED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CoreMeetingRecordType" AS ENUM ('TEAM_SAFETY', 'TOOLBOX', 'MANAGEMENT_REVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "PmSafetyWorkflowKind" AS ENUM ('PERMIT_TO_WORK', 'JOB_SAFETY_ANALYSIS', 'JHA', 'FLHA', 'SIF', 'HECA', 'ENERGY_WHEEL', 'INSPECTION');

-- CreateEnum
CREATE TYPE "PmSafetyWorkflowStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoreUploadStorage" AS ENUM ('LOCAL', 'S3', 'DIRECT_S3');

-- CreateEnum
CREATE TYPE "CoreUploadStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FeedSource" AS ENUM ('VERA_CORE_TRAINING', 'TRAINING_EXPIRY', 'VERA_CORE_PROJECT', 'VERA_CORE_EQUIPMENT', 'JOB_BOARD', 'SAFETY_BLOG', 'COMPANY_ANNOUNCEMENT', 'WORKER_ACHIEVEMENT', 'WORKER_VERIFICATION', 'EXPERT_ANSWER', 'UNION_DISPATCH', 'SYSTEM', 'SOCIAL_POST');

-- CreateEnum
CREATE TYPE "SocialPostType" AS ENUM ('PROVIDER_POST', 'COMPANY_ANNOUNCEMENT', 'SAFETY_BULLETIN', 'JOB_POSTING', 'WORKER_MILESTONE', 'TRAINING_UPLOAD', 'SYSTEM_UPDATE');

-- CreateEnum
CREATE TYPE "SocialPostVisibility" AS ENUM ('PUBLIC', 'COMPANY', 'FOLLOWERS');

-- CreateEnum
CREATE TYPE "SocialFollowTargetType" AS ENUM ('COMPANY', 'PROVIDER', 'USER');

-- CreateEnum
CREATE TYPE "FeedInteractionType" AS ENUM ('LIKE', 'COMMENT', 'SHARE');

-- CreateEnum
CREATE TYPE "FeedSubscriptionTargetType" AS ENUM ('SOURCE', 'COMPANY', 'PROJECT', 'TRADE', 'EXPERT', 'USER');

-- CreateEnum
CREATE TYPE "SocialActivityVerb" AS ENUM ('LIKE', 'UNLIKE', 'COMMENT', 'SHARE', 'FOLLOW', 'UNFOLLOW', 'SUBSCRIBE');

-- CreateEnum
CREATE TYPE "SocialActivityTargetType" AS ENUM ('FEED_ITEM', 'USER', 'FEED_SOURCE', 'COMPANY', 'PROJECT', 'TRADE', 'EXPERT');

-- CreateEnum
CREATE TYPE "WeatherAlertSeverity" AS ENUM ('INFO', 'WATCH', 'WARNING', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "HubHomepageRole" AS ENUM ('WORKER', 'SUPERVISOR', 'COMPANY_ADMIN', 'UNION_HALL');

-- CreateEnum
CREATE TYPE "UserLocationSource" AS ENUM ('GPS', 'WORKSITE', 'PRIMARY');

-- CreateEnum
CREATE TYPE "JobBoardExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'JOURNEYMAN', 'FOREMAN');

-- CreateEnum
CREATE TYPE "JobBoardApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SafetyRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SafetyBlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SafetyBlogAuthorType" AS ENUM ('EXPERT', 'COMPANY');

-- CreateEnum
CREATE TYPE "SafetyBlogCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'PENDING');

-- CreateEnum
CREATE TYPE "ExpertQaQuestionStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ExpertQaModerationStatus" AS ENUM ('VISIBLE', 'PENDING', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ExpertBadgeLevel" AS ENUM ('CONTRIBUTOR', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "ExpertQaAttachmentType" AS ENUM ('IMAGE', 'PDF', 'OTHER');

-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('FEED_ITEM', 'SOCIAL_POST', 'USER', 'EXPERT_QA_QUESTION', 'EXPERT_QA_ANSWER', 'SAFETY_ARTICLE', 'SAFETY_COMMENT', 'JOB_POST');

-- CreateEnum
CREATE TYPE "ModerationReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'MISINFORMATION', 'OFF_TOPIC', 'IMPERSONATION', 'SAFETY_RISK', 'OTHER');

-- CreateEnum
CREATE TYPE "ModerationCaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationCaseSource" AS ENUM ('USER_REPORT', 'AUTO_RULE');

-- CreateEnum
CREATE TYPE "ModerationResolution" AS ENUM ('NO_ACTION', 'CONTENT_HIDDEN', 'USER_WARNED', 'USER_SUSPENDED', 'EXPERT_VERIFIED', 'EXPERT_REJECTED');

-- CreateEnum
CREATE TYPE "ModerationAutoRuleType" AS ENUM ('KEYWORD_MATCH', 'REPORT_THRESHOLD', 'REPUTATION_FLOOR');

-- CreateEnum
CREATE TYPE "ModerationAutoAction" AS ENUM ('FLAG', 'AUTO_HIDE');

-- CreateEnum
CREATE TYPE "ExpertVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SafetyFormStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SafetyFormType" AS ENUM ('JHA', 'FLHA', 'SIF', 'HECA', 'ENERGY_WHEEL', 'INSPECTION');

-- CreateEnum
CREATE TYPE "SafetyFormSignatureRole" AS ENUM ('WORKER', 'SUPERVISOR', 'AUTHORIZER', 'WITNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "SafetyFormActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CailSourceType" AS ENUM ('inspection', 'bbo', 'incident', 'equipment', 'jha', 'flha', 'heca', 'sif', 'training', 'general', 'safety_meeting');

-- CreateEnum
CREATE TYPE "CailStatus" AS ENUM ('open', 'in_progress', 'overdue', 'resolved', 'verified', 'cancelled');

-- CreateEnum
CREATE TYPE "CailSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "CailRiskCategory" AS ENUM ('behavior', 'equipment', 'environment', 'process', 'ppe', 'ergonomic', 'other');

-- CreateEnum
CREATE TYPE "ObservationPolarity" AS ENUM ('safe', 'at_risk');

-- CreateEnum
CREATE TYPE "SafetyInspectionStatus" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ProjectSafetyRoleType" AS ENUM ('prime_admin', 'company_safety_manager', 'supervisor', 'worker', 'client_readonly');

-- CreateEnum
CREATE TYPE "MusterEventStatus" AS ENUM ('activated', 'accounting', 'all_clear', 'cancelled');

-- CreateEnum
CREATE TYPE "JhaFlhaKind" AS ENUM ('FLHA', 'JHA');

-- CreateEnum
CREATE TYPE "JhaFlhaStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'LOCKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JhaEnergyType" AS ENUM ('mechanical', 'electrical', 'chemical', 'thermal', 'radiation', 'biological', 'gravity', 'pressure', 'motion');

-- CreateEnum
CREATE TYPE "JhaFlhaSignatureRole" AS ENUM ('WORKER', 'SUPERVISOR', 'AUTHORIZER');

-- CreateEnum
CREATE TYPE "SifHecaSourceType" AS ENUM ('jha_flha', 'safety_form', 'inspection', 'incident', 'equipment', 'competency', 'bbo', 'general');

-- CreateEnum
CREATE TYPE "SifHecaEventStatus" AS ENUM ('ingested', 'scored', 'review_required', 'approved', 'rejected', 'closed');

-- CreateEnum
CREATE TYPE "SifPotentialCategory" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PmInspectionTemplateCategory" AS ENUM ('PME', 'CRANE', 'VEHICLE', 'TOOL', 'SITE', 'HOUSEKEEPING', 'ENVIRONMENTAL', 'ACCESS_EGRESS', 'FALL_PROTECTION', 'CONFINED_SPACE', 'HOT_WORK', 'EXCAVATION', 'SCAFFOLDING', 'TEMPORARY_POWER', 'FIRE_PROTECTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PmInspectionTemplateStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PmInspectionStatus" AS ENUM ('draft', 'in_progress', 'submitted', 'review_required', 'approved', 'rejected', 'closed');

-- CreateEnum
CREATE TYPE "PmDeficiencyStatus" AS ENUM ('open', 'assigned', 'in_progress', 'verification_pending', 'closed');

-- CreateEnum
CREATE TYPE "PmDeficiencySeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PmInspectionScoringMode" AS ENUM ('pass_fail', 'numeric', 'weighted');

-- CreateEnum
CREATE TYPE "PmSafetyEventType" AS ENUM ('incident_injury', 'incident_property', 'incident_environmental', 'incident_equipment', 'near_miss', 'hazard_observation', 'positive_observation', 'behavioral_observation', 'equipment_failure', 'security_event', 'custom');

-- CreateEnum
CREATE TYPE "PmSafetyEventStatus" AS ENUM ('draft', 'submitted', 'review_required', 'approved', 'rejected', 'locked', 'closed');

-- CreateEnum
CREATE TYPE "PmSafetyEventSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PmRcaMethod" AS ENUM ('five_why', 'fishbone', 'taproot');

-- CreateEnum
CREATE TYPE "PmInvestigationStatus" AS ENUM ('not_started', 'evidence_gathering', 'analysis', 'root_cause', 'capa_planning', 'review', 'closed');

-- CreateEnum
CREATE TYPE "PmCorrectiveActionType" AS ENUM ('immediate', 'interim_control', 'permanent', 'preventive', 'equipment_repair', 'training_requirement', 'policy_update');

-- CreateEnum
CREATE TYPE "PmCorrectiveActionStatus" AS ENUM ('draft', 'open', 'assigned', 'in_progress', 'verification_pending', 'verified', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmCapaAssigneeRole" AS ENUM ('primary', 'secondary', 'delegate', 'verifier');

-- CreateEnum
CREATE TYPE "PmCorrectiveActionLinkType" AS ENUM ('hazard', 'control', 'jha_flha', 'inspection', 'incident', 'equipment', 'sds', 'training', 'site_access', 'emergency', 'pm_task', 'sif_heca', 'worker');

-- CreateEnum
CREATE TYPE "SafetyMeetingType" AS ENUM ('toolbox_talk', 'tailgate_meeting', 'safety_stand_down', 'pre_task_meeting', 'daily_safety_briefing', 'weekly_safety_meeting', 'monthly_safety_meeting', 'project_kickoff_safety', 'incident_review_meeting', 'custom');

-- CreateEnum
CREATE TYPE "SafetyMeetingStatus" AS ENUM ('draft', 'published', 'in_progress', 'completed', 'reviewed', 'locked');

-- CreateEnum
CREATE TYPE "SafetyMeetingReviewStatus" AS ENUM ('not_required', 'pending', 'approved', 'rejected', 'changes_requested');

-- CreateEnum
CREATE TYPE "SafetyMeetingTemplateStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "TopicLibraryScope" AS ENUM ('company', 'project');

-- CreateEnum
CREATE TYPE "TopicLibraryCategoryCode" AS ENUM ('ppe', 'fall_protection', 'confined_space', 'hot_work', 'electrical_safety', 'equipment_operation', 'housekeeping', 'environmental', 'behavioral_safety', 'sif_heca', 'general');

-- CreateEnum
CREATE TYPE "SafetyMeetingAttendeeStatus" AS ENUM ('expected', 'present', 'absent', 'excused');

-- CreateEnum
CREATE TYPE "PmSdsCategory" AS ENUM ('CHEMICAL', 'FUEL', 'SOLVENT', 'ADHESIVE', 'CLEANING_AGENT', 'HAZARDOUS_MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PmDocumentStatus" AS ENUM ('draft', 'review', 'approved', 'published', 'superseded', 'archived');

-- CreateEnum
CREATE TYPE "PmControlledDocumentType" AS ENUM ('policy', 'procedure', 'sop', 'manual', 'manufacturer_instruction', 'safety_bulletin', 'emergency_plan', 'training', 'equipment_manual', 'project_specific');

-- CreateEnum
CREATE TYPE "PmEquipmentOperationalStatus" AS ENUM ('active', 'in_service', 'out_of_service', 'locked_out', 'decommissioned');

-- CreateEnum
CREATE TYPE "PmEquipmentSafetyCategory" AS ENUM ('PME', 'CRANE', 'VEHICLE', 'TOOL', 'LIFTING_DEVICE', 'ELECTRICAL', 'CONFINED_SPACE', 'FALL_PROTECTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PmEquipmentCertificationType" AS ENUM ('annual_inspection', 'crane_certification', 'pme_certification', 'electrical_certification', 'calibration_certificate', 'other');

-- CreateEnum
CREATE TYPE "PmEquipmentCertificationStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'expired', 'rejected');

-- CreateEnum
CREATE TYPE "PmEquipmentInspectionCadence" AS ENUM ('pre_use', 'post_use', 'daily', 'weekly', 'monthly', 'annual');

-- CreateEnum
CREATE TYPE "PmEquipmentFailureType" AS ENUM ('mechanical', 'electrical', 'hydraulic', 'structural', 'control_system', 'safety_device');

-- CreateEnum
CREATE TYPE "PmEquipmentFailureStatus" AS ENUM ('reported', 'supervisor_review', 'owner_review', 'locked_out', 'capa_open', 'verified', 'closed');

-- CreateEnum
CREATE TYPE "PmEquipmentLotoStatus" AS ENUM ('active', 'verified', 'removed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmWorkerEquipmentAuthType" AS ENUM ('crane_operator', 'forklift_operator', 'awp_operator', 'pme_operator', 'vehicle_operator', 'specialty');

-- CreateEnum
CREATE TYPE "PmEmergencyEventType" AS ENUM ('fire', 'medical', 'evacuation', 'hazmat_spill', 'environmental_release', 'equipment_failure', 'security_threat', 'severe_weather', 'missing_worker', 'custom');

-- CreateEnum
CREATE TYPE "PmEmergencyPlanType" AS ENUM ('fire', 'evacuation', 'medical', 'spill', 'severe_weather', 'rescue', 'custom');

-- CreateEnum
CREATE TYPE "PmEmergencyPlanStatus" AS ENUM ('draft', 'review', 'approved', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PmEmergencyEventStatus" AS ENUM ('declared', 'active', 'muster_in_progress', 'evacuation_in_progress', 'supervisor_review', 'all_clear', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmEmergencyNotificationChannel" AS ENUM ('sms', 'email', 'push', 'safety_station', 'in_app');

-- CreateEnum
CREATE TYPE "PmEmergencyNotificationStatus" AS ENUM ('pending', 'sent', 'failed', 'escalated');

-- CreateEnum
CREATE TYPE "PmEmergencyEquipmentType" AS ENUM ('fire_extinguisher', 'spill_kit', 'first_aid', 'aed', 'rescue_equipment', 'other');

-- CreateEnum
CREATE TYPE "PmAccessPointType" AS ENUM ('main_gate', 'project_gate', 'zone_gate', 'restricted_area', 'confined_space', 'hot_work_zone', 'equipment_operation', 'emergency_muster', 'safety_station', 'custom');

-- CreateEnum
CREATE TYPE "PmAccessZoneType" AS ENUM ('general_work', 'high_risk', 'confined_space', 'hot_work', 'electrical_hazard', 'chemical_storage', 'equipment_operation', 'sif_high_energy');

-- CreateEnum
CREATE TYPE "PmAccessDecision" AS ENUM ('granted', 'denied', 'denied_with_reason', 'requires_supervisor_override', 'requires_safety_override');

-- CreateEnum
CREATE TYPE "PmAccessOverrideType" AS ENUM ('temporary', 'one_time', 'zone_specific', 'equipment_specific');

-- CreateEnum
CREATE TYPE "PmSafetyStationType" AS ENUM ('gate', 'zone', 'equipment', 'muster', 'emergency', 'mobile', 'vehicle', 'confined_space', 'custom');

-- CreateEnum
CREATE TYPE "PmSafetyStationStatus" AS ENUM ('pending', 'active', 'offline', 'maintenance', 'deactivated');

-- CreateEnum
CREATE TYPE "PmSafetyStationNetworkMode" AS ENUM ('online', 'offline', 'hybrid');

-- CreateEnum
CREATE TYPE "PmSafetyStationAccessAction" AS ENUM ('sign_in', 'sign_out', 'scan', 'denied');

-- CreateEnum
CREATE TYPE "PmProjectSafetyRiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PmProjectSafetyPublishStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PmProjectHazardCategory" AS ENUM ('energy', 'environmental', 'equipment', 'chemical', 'behavioral', 'site_specific');

-- CreateEnum
CREATE TYPE "PmProjectControlType" AS ENUM ('engineering', 'administrative', 'ppe', 'equipment');

-- CreateEnum
CREATE TYPE "PmProjectSafetyOverrideRuleType" AS ENUM ('profile', 'zone', 'equipment', 'training', 'emergency', 'hazard', 'control');

-- CreateEnum
CREATE TYPE "PmCompanyHazardCategory" AS ENUM ('energy', 'environmental', 'equipment', 'chemical', 'behavioral', 'organizational');

-- CreateEnum
CREATE TYPE "PmCompanyControlType" AS ENUM ('engineering', 'administrative', 'ppe', 'procedural', 'equipment');

-- CreateEnum
CREATE TYPE "PmCompanyPolicyType" AS ENUM ('safety_policy', 'procedure', 'sop', 'manual', 'safety_bulletin', 'corporate_standard');

-- CreateEnum
CREATE TYPE "PmCompanyTrainingRoleType" AS ENUM ('worker', 'supervisor', 'subcontractor', 'equipment_operator', 'visitor');

-- CreateEnum
CREATE TYPE "PmCompanyTrainingCategory" AS ENUM ('general_safety', 'equipment_operation', 'high_risk_work', 'chemical_handling', 'emergency_response', 'company_specific');

-- CreateEnum
CREATE TYPE "PmCompanySafetyOverrideType" AS ENUM ('temporary', 'one_time', 'policy', 'training', 'equipment', 'zone');

-- CreateEnum
CREATE TYPE "PmCompanyEnforcementAction" AS ENUM ('block_access', 'supervisor_override', 'safety_override', 'auto_capa');

-- CreateEnum
CREATE TYPE "PmWorkerAuthorizationType" AS ENUM ('crane_operator', 'forklift_operator', 'awp_operator', 'pme_operator', 'vehicle_operator', 'specialty_equipment', 'specialty');

-- CreateEnum
CREATE TYPE "PmWorkerMedicalRestrictionType" AS ENUM ('physical', 'work_limitation', 'temporary', 'permanent');

-- CreateEnum
CREATE TYPE "PmWorkerSafetyOverrideType" AS ENUM ('temporary', 'one_time', 'training', 'equipment', 'medical', 'zone');

-- CreateEnum
CREATE TYPE "PmWorkerHazardExposureSource" AS ENUM ('jha_flha', 'inspection', 'incident', 'equipment_failure', 'emergency', 'company_library', 'project_library');

-- CreateEnum
CREATE TYPE "PmWorkPackageStatus" AS ENUM ('draft', 'published', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmPmTaskStatus" AS ENUM ('draft', 'scheduled', 'blocked', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmPermitType" AS ENUM ('hot_work', 'confined_space', 'electrical', 'excavation', 'loto', 'chemical_handling', 'crane_lift', 'fall_protection', 'live_line', 'open_hole', 'custom');

-- CreateEnum
CREATE TYPE "PmPermitStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'expired', 'closed', 'rejected');

-- CreateEnum
CREATE TYPE "PmPmAssignmentStatus" AS ENUM ('pending', 'active', 'blocked', 'completed', 'revoked');

-- CreateEnum
CREATE TYPE "VeripmPermitRiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "VeripmPermitSyncStatus" AS ENUM ('draft', 'queued', 'open', 'in_progress', 'awaiting_signatures', 'active', 'closed', 'cancelled', 'sync_error');

-- CreateEnum
CREATE TYPE "VeripmPermitActivityKind" AS ENUM ('created', 'fieldos_pushed', 'fieldos_webhook', 'status_changed', 'signature', 'photo', 'note', 'hazard_control', 'safety_linked', 'work_order_updated', 'incident_linked', 'css_impact', 'closed');

-- CreateEnum
CREATE TYPE "PmAttachmentStatus" AS ENUM ('uploaded', 'processed', 'annotated', 'linked', 'archived');

-- CreateEnum
CREATE TYPE "PmAttachmentVirusScanStatus" AS ENUM ('pending', 'passed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "PmOfflineSyncStatus" AS ENUM ('pending_sync', 'syncing', 'synced', 'conflict', 'resolved');

-- CreateEnum
CREATE TYPE "PmUnifiedHcPublishStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "PmUnifiedHazardScope" AS ENUM ('company', 'project', 'work_package', 'task', 'worker');

-- CreateEnum
CREATE TYPE "PmUnifiedHazardType" AS ENUM ('physical', 'chemical', 'biological', 'ergonomic', 'psychosocial', 'environmental', 'equipment', 'procedural');

-- CreateEnum
CREATE TYPE "PmUnifiedHazardCategory" AS ENUM ('energy', 'environmental', 'equipment', 'chemical', 'behavioral', 'site_specific');

-- CreateEnum
CREATE TYPE "PmUnifiedControlType" AS ENUM ('engineering', 'administrative', 'ppe', 'procedural', 'equipment');

-- CreateEnum
CREATE TYPE "PmUnifiedEnergyType" AS ENUM ('gravity', 'motion', 'mechanical', 'electrical', 'chemical', 'thermal', 'pressure', 'radiation', 'biological');

-- CreateEnum
CREATE TYPE "PmUnifiedHcIngestSource" AS ENUM ('jha_flha', 'inspection', 'incident', 'equipment_failure', 'sds', 'pm_task', 'company_library', 'project_library', 'manual');

-- CreateEnum
CREATE TYPE "CailIntelEntityType" AS ENUM ('company', 'project', 'worker', 'equipment', 'hazard', 'control', 'jha_flha', 'inspection', 'incident', 'corrective_action', 'sds', 'training', 'site_access', 'emergency', 'pm_task', 'zone');

-- CreateEnum
CREATE TYPE "CailIntelPredictionType" AS ENUM ('incident_likelihood', 'equipment_failure', 'hazard_emergence', 'sif_heca_potential', 'worker_risk', 'project_risk', 'company_risk', 'schedule_delay', 'access_denial', 'emergency_likelihood', 'capa_overdue', 'training_lapse');

-- CreateEnum
CREATE TYPE "CailIntelScoreType" AS ENUM ('worker_safety', 'equipment_safety', 'project_safety', 'company_safety', 'hazard_severity', 'control_strength', 'jha_quality', 'inspection_quality', 'incident_severity', 'capa_priority', 'emergency_readiness', 'access_compliance');

-- CreateEnum
CREATE TYPE "CailIntelRecommendationType" AS ENUM ('control', 'training', 'corrective_action', 'equipment_maintenance', 'jha_improvement', 'inspection_focus', 'emergency_plan', 'sds_update', 'worker_assignment', 'equipment_assignment', 'pm_schedule_adjustment');

-- CreateEnum
CREATE TYPE "CailIntelInferenceMode" AS ENUM ('realtime', 'batch', 'edge', 'offline');

-- CreateEnum
CREATE TYPE "CailIntelModelStatus" AS ENUM ('draft', 'training', 'validated', 'deployed', 'deprecated', 'rolled_back');

-- CreateEnum
CREATE TYPE "OrientationPackageType" AS ENUM ('UPLOAD', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "OrientationAssignmentScope" AS ENUM ('COMPANY', 'PROJECT', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "OrientationWorkerProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REORIENTATION_REQUIRED');

-- CreateEnum
CREATE TYPE "PmInspectionFindingCategory" AS ENUM ('unsafe_condition', 'missing_ppe', 'equipment_defect', 'housekeeping', 'environmental', 'other');

-- CreateEnum
CREATE TYPE "PmInspectionResponsibleParty" AS ENUM ('contractor', 'supervisor', 'company', 'worker');

-- CreateEnum
CREATE TYPE "PmContractorDispatchStatus" AS ENUM ('pending', 'sent', 'acknowledged', 'in_progress', 'completed', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "PmSubstanceTestType" AS ENUM ('random', 'post_incident', 'reasonable_suspicion', 'pre_employment', 'return_to_duty', 'follow_up');

-- CreateEnum
CREATE TYPE "PmSubstanceTestStatus" AS ENUM ('scheduled', 'collection_scheduled', 'collected', 'in_transit', 'at_lab', 'pending_mro', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PmSubstanceTestResultOutcome" AS ENUM ('negative', 'non_negative', 'refusal', 'tampered', 'cancelled', 'dilute');

-- CreateEnum
CREATE TYPE "PmSubstanceSpecimenType" AS ENUM ('urine', 'oral_fluid', 'breath_alcohol');

-- CreateEnum
CREATE TYPE "PmCustodyPartyRole" AS ENUM ('donor', 'collector', 'courier', 'lab_technician', 'mro', 'der', 'safety_officer', 'hr');

-- CreateEnum
CREATE TYPE "PmSubstanceTestDocumentType" AS ENUM ('ccf', 'chain_of_custody', 'lab_report', 'mro_verification', 'der_notice', 'suspicion_form', 'other');

-- CreateEnum
CREATE TYPE "PmSafetyHubDomain" AS ENUM ('inspection', 'investigation', 'corrective_action', 'predictive', 'contractor', 'substance_testing', 'competency', 'equipment');

-- CreateEnum
CREATE TYPE "PmSclState" AS ENUM ('safe', 'conditional', 'loss');

-- CreateEnum
CREATE TYPE "PmEnergyControlState" AS ENUM ('controlled', 'uncontrolled', 'partially_controlled');

-- CreateEnum
CREATE TYPE "PmSmsEntityType" AS ENUM ('inspection_finding', 'inspection_deficiency', 'corrective_action', 'safety_event', 'investigation', 'substance_test', 'equipment_inspection', 'jha_task');

-- CreateEnum
CREATE TYPE "PmSmsHecaType" AS ENUM ('critical_task', 'critical_equipment', 'both');

-- CreateEnum
CREATE TYPE "AcpTenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateEnum
CREATE TYPE "AcpSubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL');

-- CreateEnum
CREATE TYPE "VeraAssessmentEngine" AS ENUM ('TRAINING_ASSESSMENT', 'SAFETY_PROGRAM_COMPLIANCE', 'SMART_GAP_ANALYSIS', 'SAFETY_KNOWLEDGE');

-- CreateEnum
CREATE TYPE "FitTestResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "CoreOfflineSyncStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "EventOutboxStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'DLQ');

-- CreateEnum
CREATE TYPE "RenewalRecommendationStatus" AS ENUM ('PENDING', 'NOTIFIED', 'BOOKED', 'DISMISSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VendorSource" AS ENUM ('CALENDLY', 'THINKIFIC', 'ABSORB', 'REST', 'MANUAL');

-- CreateEnum
CREATE TYPE "BookingDeliveryMode" AS ENUM ('IN_PERSON', 'VIRTUAL', 'ONLINE_SELF_PACED', 'HYBRID');

-- CreateEnum
CREATE TYPE "VendorSyncStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "HubProfileVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS', 'COMPANY');

-- CreateEnum
CREATE TYPE "HubConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "HubCompanyMemberRole" AS ENUM ('EMPLOYEE', 'ADMIN', 'FEATURED');

-- CreateEnum
CREATE TYPE "VeriForgeRoleName" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SAFETY_MANAGER', 'SUPERVISOR', 'WORKER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "VeriForgeUserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VeriForgeAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "VeriForgeCheckStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VeriForgeCheckResult" AS ENUM ('PASS', 'FAIL', 'REVIEW');

-- CreateEnum
CREATE TYPE "VeriForgeWorkflowStepStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VisiDataPlane" AS ENUM ('project', 'company');

-- CreateEnum
CREATE TYPE "VisiTrendReportKind" AS ENUM ('cohort', 'heca', 'trif_ltif', 'seasonal', 'leading', 'root_cause', 'workforce', 'predictive', 'full_trends');

-- CreateEnum
CREATE TYPE "SmsAccessPlane" AS ENUM ('project', 'company', 'subcontractor');

-- CreateEnum
CREATE TYPE "SmsPeriodGrain" AS ENUM ('day', 'week', 'month', 'quarter');

-- CreateEnum
CREATE TYPE "SmsGeoLevel" AS ENUM ('global', 'continent', 'country', 'province', 'region', 'city', 'site');

-- CreateEnum
CREATE TYPE "SmsFlhaStatus" AS ENUM ('draft', 'active', 'closed', 'void');

-- CreateEnum
CREATE TYPE "SmsQualityBand" AS ENUM ('pass', 'warn', 'fail');

-- CreateEnum
CREATE TYPE "SmsFieldOsSyncStatus" AS ENUM ('pending', 'synced', 'error', 'na');

-- CreateEnum
CREATE TYPE "SmsJhaStatus" AS ENUM ('draft', 'in_review', 'approved', 'archived');

-- CreateEnum
CREATE TYPE "SmsErpScenario" AS ENUM ('electrical', 'fall', 'trench', 'chemical', 'rollover', 'general');

-- CreateEnum
CREATE TYPE "SmsErpStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "SmsActionKind" AS ENUM ('corrective', 'preventive');

-- CreateEnum
CREATE TYPE "SmsActionStatus" AS ENUM ('open', 'in_progress', 'pending_verify', 'closed', 'void');

-- CreateEnum
CREATE TYPE "SmsPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "SmsSourceModule" AS ENUM ('incident', 'inspection', 'jha', 'flha', 'meeting', 'manual', 'ai');

-- CreateEnum
CREATE TYPE "SmsMeetingType" AS ENUM ('toolbox', 'orientation', 'emergency_drill_brief', 'other');

-- CreateEnum
CREATE TYPE "SmsMeetingStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SmsAiModelTier" AS ENUM ('D0', 'D1', 'L1', 'L2');

-- CreateEnum
CREATE TYPE "SmsAiTone" AS ENUM ('neutral', 'positive', 'caution', 'alert');

-- CreateEnum
CREATE TYPE "SmsAiSource" AS ENUM ('rules', 'scorer', 'llm', 'fallback');

-- CreateEnum
CREATE TYPE "SmsAiStatus" AS ENUM ('active', 'accepted', 'rejected', 'expired', 'superseded');

-- CreateEnum
CREATE TYPE "SmsDrillRosterStatus" AS ENUM ('expected', 'accounted', 'missing', 'excused');

-- CreateEnum
CREATE TYPE "SmsEntitlementReason" AS ENUM ('no_data', 'license', 'denied');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'WORKER',
    "companyId" INTEGER,
    "unionHallId" INTEGER,
    "trainingProviderId" INTEGER,
    "acp_tenant_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "companyId" INTEGER,
    "photoUrl" TEXT,
    "userId" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "qrToken" TEXT,
    "unionNumber" TEXT,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "city" TEXT,
    "province" TEXT,
    "industry" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_analytics" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "last_login" TIMESTAMP(3),
    "active_users_30d" INTEGER NOT NULL DEFAULT 0,
    "modules_used" JSONB NOT NULL DEFAULT '{}',
    "total_workers" INTEGER NOT NULL DEFAULT 0,
    "total_equipment" INTEGER NOT NULL DEFAULT 0,
    "total_projects" INTEGER NOT NULL DEFAULT 0,
    "churn_risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_usage_daily" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "training_events" INTEGER NOT NULL DEFAULT 0,
    "verification_events" INTEGER NOT NULL DEFAULT 0,
    "signoff_events" INTEGER NOT NULL DEFAULT 0,
    "incident_events" INTEGER NOT NULL DEFAULT 0,
    "project_events" INTEGER NOT NULL DEFAULT 0,
    "jha_events" INTEGER NOT NULL DEFAULT 0,
    "flha_events" INTEGER NOT NULL DEFAULT 0,
    "sif_events" INTEGER NOT NULL DEFAULT 0,
    "equipment_events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "company_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_requests" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" "FeedbackRequestStatus" NOT NULL DEFAULT 'NEW',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_votes" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingIngestionRun" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceChannel" TEXT NOT NULL DEFAULT 'upload',
    "sourceMime" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "coreFileId" INTEGER,
    "ocrText" TEXT,
    "ocrExtracted" JSONB,
    "ocrConfidence" DOUBLE PRECISION,
    "metadataSnapshot" JSONB,
    "validationErrors" JSONB,
    "resultSummary" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingIngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRequirement" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "expiresInDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreComplianceNote" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "category" "CoreComplianceNoteCategory" NOT NULL DEFAULT 'INTERNAL',
    "status" "CoreComplianceNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "CoreComplianceNotePriority" NOT NULL DEFAULT 'NORMAL',
    "dueAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreComplianceNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreDailyLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "logDate" TIMESTAMP(3) NOT NULL,
    "shift" "CoreDailyLogShift" NOT NULL DEFAULT 'DAY',
    "companyId" INTEGER,
    "siteId" INTEGER,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreDailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreSiteRisk" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "CoreSiteRiskCategory" NOT NULL DEFAULT 'OTHER',
    "severity" "CoreSiteRiskSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "CoreSiteRiskStatus" NOT NULL DEFAULT 'OPEN',
    "identifiedAt" TIMESTAMP(3) NOT NULL,
    "mitigatedAt" TIMESTAMP(3),
    "locationNote" VARCHAR(500),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "ownerUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreSiteRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyObservation" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "SafetyObservationSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "SafetyObservationStatus" NOT NULL DEFAULT 'OPEN',
    "observedAt" TIMESTAMP(3) NOT NULL,
    "locationNote" VARCHAR(500),
    "companyId" INTEGER,
    "siteId" INTEGER,
    "reportedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreMeetingRecord" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "meetingType" "CoreMeetingRecordType" NOT NULL DEFAULT 'TOOLBOX',
    "heldAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER,
    "siteId" INTEGER,
    "recordedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreMeetingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmSafetyWorkflow" (
    "id" SERIAL NOT NULL,
    "kind" "PmSafetyWorkflowKind" NOT NULL DEFAULT 'PERMIT_TO_WORK',
    "title" TEXT NOT NULL,
    "status" "PmSafetyWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" INTEGER,
    "siteId" INTEGER,
    "workDescription" TEXT,
    "hazardSummary" TEXT,
    "controlMeasures" TEXT,
    "jobLocation" VARCHAR(500),
    "taskStepsJson" JSONB,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "workerUserId" INTEGER,
    "workerSignedAt" TIMESTAMP(3),
    "workerSignatureText" TEXT,
    "supervisorUserId" INTEGER,
    "supervisorApprovedAt" TIMESTAMP(3),
    "supervisorSignatureText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmSafetyWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmSafetyWorkflowEvent" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PmSafetyWorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContact" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolboxTalk" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "notes" TEXT,
    "conductedAt" TIMESTAMP(3) NOT NULL,
    "facilitatorWorkerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolboxTalk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyStation" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "siteId" INTEGER,
    "equipmentId" INTEGER,
    "code" TEXT,
    "hardwareId" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "stationType" "PmSafetyStationType" NOT NULL DEFAULT 'zone',
    "status" "PmSafetyStationStatus" NOT NULL DEFAULT 'pending',
    "networkMode" "PmSafetyStationNetworkMode" NOT NULL DEFAULT 'online',
    "firmwareVersion" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "heartbeatIntervalSec" INTEGER NOT NULL DEFAULT 60,
    "emergencyModeActive" BOOLEAN NOT NULL DEFAULT false,
    "purpose" TEXT,
    "type" TEXT NOT NULL DEFAULT 'DIGITAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastPing" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentCategory" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentType" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "catalogTypeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "assetTag" TEXT,
    "qrToken" TEXT,
    "safetyStatus" "EquipmentSafetyStatus" NOT NULL DEFAULT 'OK',
    "companyId" INTEGER,
    "categoryId" INTEGER,
    "typeId" INTEGER,
    "photoUrl" TEXT,
    "description" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "yearMade" INTEGER,
    "lockedOutAt" TIMESTAMP(3),
    "lockoutReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "catalogCategory" "EquipmentCatalogCategory",
    "catalogTypeKey" TEXT,
    "meterHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complianceStatus" "LinkComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
    "lastInspectionAt" TIMESTAMP(3),
    "nextInspectionAt" TIMESTAMP(3),
    "lockoutStatus" "EquipmentLockoutStatus" NOT NULL DEFAULT 'CLEAR',
    "competencyRequired" BOOLEAN NOT NULL DEFAULT false,
    "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "complianceUpdatedAt" TIMESTAMP(3),
    "operationalStatus" "PmEquipmentOperationalStatus" NOT NULL DEFAULT 'active',
    "safetyCategory" "PmEquipmentSafetyCategory",
    "capacity" TEXT,
    "loadChartJson" JSONB NOT NULL DEFAULT '{}',
    "pmSafetyMetadataJson" JSONB NOT NULL DEFAULT '{}',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentAttachment" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentAttachmentType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentMaintenance" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentMaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" INTEGER,
    "notes" TEXT,
    "nextDueAt" TIMESTAMP(3),
    "meterHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentCalibration" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "calibratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibratedBy" INTEGER,
    "certificateNumber" TEXT,
    "expiresAt" TIMESTAMP(3),
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentCalibration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "type" "EquipmentMaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
    "intervalDays" INTEGER NOT NULL DEFAULT 90,
    "intervalHours" DOUBLE PRECISION,
    "nextDueAt" TIMESTAMP(3),
    "lastPerformedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationSchedule" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "intervalDays" INTEGER NOT NULL DEFAULT 365,
    "nextDueAt" TIMESTAMP(3),
    "lastCalibratedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentLockout" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "reason" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),
    "lockedByUserId" INTEGER,
    "unlockedByUserId" INTEGER,

    CONSTRAINT "EquipmentLockout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentComplianceStatus" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "status" "LinkComplianceStatus" NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedByUserId" INTEGER,
    "notes" TEXT,
    "inspectionId" INTEGER,

    CONSTRAINT "EquipmentComplianceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "siteId" INTEGER,
    "createdById" INTEGER,
    "assignedToId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentComment" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "providerId" INTEGER,
    "trainingProviderId" INTEGER,
    "courseId" INTEGER,
    "instructorId" INTEGER,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateNumber" TEXT,
    "certificateUrl" TEXT,
    "certificateQrToken" TEXT,
    "certificateSignedAt" TIMESTAMP(3),
    "certificateSignedByInstructorId" INTEGER,
    "completedAt" TIMESTAMP(3),
    "lastVerificationStatus" TEXT,
    "lastVerificationChecks" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "ingestionRunId" INTEGER,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingVerificationRun" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "authenticityStatus" TEXT NOT NULL,
    "regulatoryStatus" TEXT,
    "standardsOutcome" TEXT,
    "jurisdictionCode" TEXT,
    "checks" JSONB,
    "propagation" JSONB,
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingVerificationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_ledger_events" (
    "id" SERIAL NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" INTEGER,
    "actorType" "CredentialLedgerActorType" NOT NULL DEFAULT 'SYSTEM',
    "eventType" "CredentialLedgerEventType" NOT NULL,
    "credentialId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "providerId" INTEGER,
    "projectId" INTEGER,
    "companyId" INTEGER,
    "correlationId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "credential_ledger_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAttestation" (
    "id" SERIAL NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "attestedByWorkerId" INTEGER NOT NULL,
    "role" "TrainingAttestationRole" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingAttestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_compliance_rules" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "ruleType" "ProjectComplianceRuleType" NOT NULL,
    "requiredCredentialTypeId" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_compliance_alerts" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "ruleId" INTEGER,
    "credentialId" INTEGER,
    "type" "ProjectComplianceAlertType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "project_compliance_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "qrToken" TEXT,
    "approvalStatus" "ProviderApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSyncConfig" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "syncMode" TEXT NOT NULL DEFAULT 'webhook',
    "pollUrl" TEXT,
    "pollIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "apiKeyEnvVar" TEXT,
    "webhookSecret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastPollAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderSyncConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSyncRun" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsVerified" INTEGER NOT NULL DEFAULT 0,
    "recordsPushed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProviderSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingInstructor" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "qualifiedCourseCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualificationExpiresAt" TIMESTAMP(3),
    "qualificationStatus" "InstructorQualificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCourse" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "certificationId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationHours" DOUBLE PRECISION,
    "validityDays" INTEGER,
    "contentText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCourseStandard" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "standardKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minScore" INTEGER,

    CONSTRAINT "TrainingCourseStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderApproval" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" "ProviderApprovalStatus" NOT NULL,
    "reviewedBy" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderComplianceStatus" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" "ProviderComplianceLevel" NOT NULL,
    "score" INTEGER,
    "gaps" JSONB,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ProviderComplianceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingStandard" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "TrainingStandardKind" NOT NULL,
    "jurisdictionCode" TEXT,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultValidityDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurisdictionRequirement" (
    "id" SERIAL NOT NULL,
    "jurisdictionCode" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "standardCode" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "tradeCode" TEXT,
    "certificationId" INTEGER,
    "notes" TEXT,

    CONSTRAINT "JurisdictionRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderQualificationRule" (
    "id" SERIAL NOT NULL,
    "trainingProviderId" INTEGER,
    "ruleKey" TEXT NOT NULL,
    "description" TEXT,
    "requiredApprovalStatus" "ProviderApprovalStatus",
    "requiredStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minProviderScore" INTEGER,
    "requiresActiveProvider" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProviderQualificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorQualificationRule" (
    "id" SERIAL NOT NULL,
    "trainingProviderId" INTEGER,
    "ruleKey" TEXT NOT NULL,
    "description" TEXT,
    "courseCodePattern" TEXT,
    "requiresLicense" BOOLEAN NOT NULL DEFAULT false,
    "maxQualificationAgeDays" INTEGER,
    "requiredStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InstructorQualificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRejectionReason" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "TrainingRejectionSeverity" NOT NULL DEFAULT 'ERROR',
    "category" "TrainingRejectionCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TrainingRejectionReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingValidationResult" (
    "id" SERIAL NOT NULL,
    "subjectType" "TrainingValidationSubject" NOT NULL,
    "outcome" "TrainingValidationOutcome" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "jurisdictionCode" TEXT,
    "matchedStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingStandardCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "details" JSONB,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedBy" INTEGER,
    "trainingRecordId" INTEGER,
    "trainingProviderId" INTEGER,
    "instructorId" INTEGER,
    "courseId" INTEGER,
    "certificateQrToken" TEXT,

    CONSTRAINT "TrainingValidationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingValidationRejection" (
    "validationResultId" INTEGER NOT NULL,
    "rejectionReasonId" INTEGER NOT NULL,
    "message" TEXT,

    CONSTRAINT "TrainingValidationRejection_pkey" PRIMARY KEY ("validationResultId","rejectionReasonId")
);

-- CreateTable
CREATE TABLE "regulatory_equivalencies" (
    "id" SERIAL NOT NULL,
    "from_jurisdiction" TEXT NOT NULL,
    "to_jurisdiction" TEXT NOT NULL,
    "standard_code" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulatory_equivalencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_verification_decisions" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "regulatory_compliance_status" "RegulatoryComplianceStatus" NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "jurisdiction_code" TEXT NOT NULL,
    "matched_standards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jurisdiction_coverage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validation_result_id" INTEGER,
    "recommended_action" TEXT NOT NULL,
    "decision_hash" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulatory_verification_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_credential_nfts" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "regulatory_verification_decision_id" INTEGER NOT NULL,
    "nft_token_id" TEXT,
    "chain" TEXT NOT NULL DEFAULT 'vera-stub',
    "transaction_hash" TEXT,
    "mint_status" "TrainingCredentialNftMintStatus" NOT NULL DEFAULT 'PENDING_MINT',
    "regulatory_decision_hash" TEXT NOT NULL,
    "original_document_hash" TEXT,
    "metadata" JSONB,
    "minted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_credential_nfts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_mint_jobs" (
    "id" SERIAL NOT NULL,
    "training_record_id" INTEGER NOT NULL,
    "status" "NftMintJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "nft_mint_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificationId" INTEGER,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "siteId" INTEGER,
    "companyId" INTEGER,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "autoStarted" BOOLEAN NOT NULL DEFAULT false,
    "autoEnded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "siteId" INTEGER,
    "companyId" INTEGER,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "autoStarted" BOOLEAN NOT NULL DEFAULT false,
    "autoEnded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EquipmentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSiteAccess" (
    "workerId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "status" "WorkerSiteStatus" NOT NULL DEFAULT 'ALLOWED',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerSiteAccess_pkey" PRIMARY KEY ("workerId","siteId")
);

-- CreateTable
CREATE TABLE "EquipmentTrainingRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "certificationId" INTEGER NOT NULL,

    CONSTRAINT "EquipmentTrainingRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalSignoff" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "supervisorId" INTEGER,
    "siteId" INTEGER,
    "checklist" JSONB NOT NULL,
    "workerSignature" TEXT,
    "supervisorSignature" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "DigitalSignoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionChecklist" (
    "id" SERIAL NOT NULL,
    "seed_key" TEXT,
    "name" TEXT NOT NULL,
    "category" "InspectionChecklistCategory" NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "items" JSONB NOT NULL,
    "intervalDays" INTEGER,
    "intervalHours" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "seed_version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "siteId" INTEGER,
    "supervisorId" INTEGER,
    "checklistId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" "InspectionKind" NOT NULL DEFAULT 'PRE_USE',
    "inspectionType" "InspectionType" NOT NULL DEFAULT 'PRE_USE',
    "checklist" JSONB,
    "passed" BOOLEAN,
    "completedAt" TIMESTAMP(3),
    "signature" TEXT,
    "meterReading" DOUBLE PRECISION,
    "photos" JSONB,
    "correctiveActions" TEXT,
    "lockoutTriggered" BOOLEAN NOT NULL DEFAULT false,
    "nextInspectionDate" TIMESTAMP(3),

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" SERIAL NOT NULL,
    "catalogTypeKey" TEXT NOT NULL,
    "catalogCategory" "EquipmentCatalogCategory" NOT NULL,
    "kind" "InspectionKind" NOT NULL,
    "items" JSONB NOT NULL,
    "seed_version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyEvaluation" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "evaluatorUserId" INTEGER,
    "equipmentTypeKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "evaluationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "evidenceNotes" TEXT,
    "evidencePhotos" JSONB,
    "workerSignature" TEXT,
    "evaluatorSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentCompetencyRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "minPassingScore" INTEGER NOT NULL DEFAULT 70,
    "expiryDays" INTEGER,
    "requireEvaluation" BOOLEAN NOT NULL DEFAULT true,
    "certificationId" INTEGER,

    CONSTRAINT "EquipmentCompetencyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentTypeCompetencyRequirement" (
    "id" SERIAL NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "minPassingScore" INTEGER NOT NULL DEFAULT 70,
    "expiryDays" INTEGER,
    "requireEvaluation" BOOLEAN NOT NULL DEFAULT true,
    "certificationId" INTEGER,

    CONSTRAINT "EquipmentTypeCompetencyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerWalletItem" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "catalogTypeKey" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "trainingRecordId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerWalletItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyEquipmentAuditView" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "lastPreUseAt" TIMESTAMP(3),
    "lastFormalAt" TIMESTAMP(3),
    "preUseCompliant7d" BOOLEAN NOT NULL DEFAULT false,
    "formalCompliant" BOOLEAN NOT NULL DEFAULT false,
    "trainingOperatorsOk" INTEGER NOT NULL DEFAULT 0,
    "trainingOperatorsTotal" INTEGER NOT NULL DEFAULT 0,
    "competencyOperatorsOk" INTEGER NOT NULL DEFAULT 0,
    "competencyOperatorsTotal" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyEquipmentAuditView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "investigatorId" INTEGER,
    "findings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreFile" (
    "id" SERIAL NOT NULL,
    "storage" "CoreUploadStorage" NOT NULL,
    "status" "CoreUploadStatus" NOT NULL DEFAULT 'COMPLETED',
    "bucket" TEXT,
    "objectKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "publicUrl" TEXT,
    "purpose" TEXT,
    "failedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "CoreFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "companyId" INTEGER,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readBy" JSONB,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatFile" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModerationEvent" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatModerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReaction" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "messageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "type" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "readAt" TIMESTAMP(3),
    "dedupeKey" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "userId" INTEGER NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inspectionDue" BOOLEAN NOT NULL DEFAULT true,
    "competencyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "ppeExpiry" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceDue" BOOLEAN NOT NULL DEFAULT true,
    "calibrationDue" BOOLEAN NOT NULL DEFAULT true,
    "assignmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "phone" TEXT,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "tenantId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoreActionItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "companyId" INTEGER,
    "createdById" INTEGER,
    "coreMeetingRecordId" INTEGER,
    "coreDailyLogId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLink" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "role" TEXT,
    "trade" TEXT,
    "visibilityRules" JSONB,

    CONSTRAINT "CompanyLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentLink" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "complianceStatus" "LinkComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',

    CONSTRAINT "EquipmentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentLinkWorker" (
    "equipmentLinkId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentLinkWorker_pkey" PRIMARY KEY ("equipmentLinkId","workerId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "client" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAssignment" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentProjectAssignment" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "EquipmentProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "localNumber" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnionHall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionMembership" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "memberNumber" TEXT,
    "status" "UnionMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "UnionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionDispatch" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "dispatchedBy" INTEGER,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recalledAt" TIMESTAMP(3),

    CONSTRAINT "UnionDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHallProviderLink" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingProviderId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnionHallProviderLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnionHallTrainingReceipt" (
    "id" SERIAL NOT NULL,
    "unionHallId" INTEGER NOT NULL,
    "trainingRecordId" INTEGER NOT NULL,
    "status" "UnionHallTrainingStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" INTEGER,
    "validatedAt" TIMESTAMP(3),
    "pushedAt" TIMESTAMP(3),
    "pushedCompanyId" INTEGER,
    "pushedProjectId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnionHallTrainingReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerMergeRecord" (
    "id" SERIAL NOT NULL,
    "survivorWorkerId" INTEGER NOT NULL,
    "mergedWorkerId" INTEGER NOT NULL,
    "mergedByUserId" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerMergeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentMergeRecord" (
    "id" SERIAL NOT NULL,
    "survivorEquipmentId" INTEGER NOT NULL,
    "mergedEquipmentId" INTEGER NOT NULL,
    "mergedByUserId" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentMergeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "assetTag" TEXT,
    "category" TEXT,
    "status" "ToolStatus" NOT NULL DEFAULT 'ACTIVE',
    "inspectionIntervalDays" INTEGER NOT NULL DEFAULT 90,
    "lastInspectionAt" TIMESTAMP(3),
    "nextInspectionAt" TIMESTAMP(3),
    "qrToken" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPE" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ppeType" "PpeType" NOT NULL DEFAULT 'OTHER',
    "serialNumber" TEXT,
    "status" "PpeStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "condition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PPE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolInspection" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER,
    "workerId" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "checklist" JSONB,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextInspectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPEInspection" (
    "id" SERIAL NOT NULL,
    "ppeId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER,
    "workerId" INTEGER,
    "passed" BOOLEAN NOT NULL,
    "checklist" JSONB,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extendedExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PPEInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolAssignment" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "projectId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "status" "ToolsPpeAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "ToolAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPEAssignment" (
    "id" SERIAL NOT NULL,
    "ppeId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "status" "ToolsPpeAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedBy" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "PPEAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "source" "FeedSource" NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,
    "unionHallId" INTEGER,
    "workerId" INTEGER,
    "projectId" INTEGER,
    "trade" TEXT,
    "safetyPriority" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedInteraction" (
    "id" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "FeedInteractionType" NOT NULL,
    "body" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialUserFollow" (
    "id" TEXT NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialUserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialActivityLog" (
    "id" TEXT NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "verb" "SocialActivityVerb" NOT NULL,
    "targetType" "SocialActivityTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "summary" TEXT,
    "feedItemId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedSubscription" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetType" "FeedSubscriptionTargetType" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "postType" "SocialPostType" NOT NULL DEFAULT 'PROVIDER_POST',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "companyId" INTEGER,
    "trainingProviderId" INTEGER,
    "workerId" INTEGER,
    "visibility" "SocialPostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinned_posts" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "pinnedByUserId" INTEGER NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "scopeKey" TEXT,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_relationships" (
    "id" TEXT NOT NULL,
    "followerUserId" INTEGER NOT NULL,
    "targetType" "SocialFollowTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "trainingProviderId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "websiteUrl" TEXT,
    "links" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaUrl" TEXT,
    "ctaLabel" TEXT,
    "targetingRules" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_attachments" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "uploaderUserId" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_flags" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterUserId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_metrics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "likeVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commentVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shareVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trending_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_posts" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherAlert" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "WeatherAlertSeverity" NOT NULL DEFAULT 'INFO',
    "hazardType" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'vera-hub',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_alerts" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "rawCapXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_zone_map" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "polygon" JSONB NOT NULL,

    CONSTRAINT "weather_zone_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_location_history" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "source" "UserLocationSource" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_alert_deliveries" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "alertId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_alert_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHomepagePreferences" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "pinnedSections" JSONB NOT NULL DEFAULT '[]',
    "hiddenFeedSources" "FeedSource"[] DEFAULT ARRAY[]::"FeedSource"[],
    "region" TEXT,
    "showWeatherAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weatherNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "weatherWalletDisplayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "primaryLatitude" DOUBLE PRECISION,
    "primaryLongitude" DOUBLE PRECISION,
    "feedPageSize" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHomepagePreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "trade" TEXT,
    "payRange" TEXT,
    "payMin" DOUBLE PRECISION,
    "payMax" DOUBLE PRECISION,
    "payPeriod" TEXT DEFAULT 'hourly',
    "experienceLevel" "JobBoardExperienceLevel",
    "summary" TEXT,
    "url" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBoardJobTicket" (
    "jobId" TEXT NOT NULL,
    "ticketName" TEXT NOT NULL,

    CONSTRAINT "JobBoardJobTicket_pkey" PRIMARY KEY ("jobId","ticketName")
);

-- CreateTable
CREATE TABLE "JobBoardWorkerProfile" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "primaryTrade" TEXT,
    "experienceLevel" "JobBoardExperienceLevel",
    "yearsExperience" INTEGER,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "openToWork" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobBoardWorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBoardWorkerSkill" (
    "profileId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT DEFAULT 'proficient',

    CONSTRAINT "JobBoardWorkerSkill_pkey" PRIMARY KEY ("profileId","skill")
);

-- CreateTable
CREATE TABLE "JobBoardPortfolioPhoto" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobBoardPortfolioPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBoardWorkHistory" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "trade" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "JobBoardWorkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBoardWorkerEndorsement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "endorserUserId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobBoardWorkerEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBoardApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "applicantUserId" INTEGER,
    "coverMessage" TEXT,
    "status" "JobBoardApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "chatRoomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobBoardApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyBlogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyBlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyBlogTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyBlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyBlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SafetyBlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "SafetyBlogRelatedPost" (
    "fromPostId" TEXT NOT NULL,
    "toPostId" TEXT NOT NULL,

    CONSTRAINT "SafetyBlogRelatedPost_pkey" PRIMARY KEY ("fromPostId","toPostId")
);

-- CreateTable
CREATE TABLE "SafetyArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "excerpt" TEXT,
    "metaDescription" VARCHAR(320),
    "canonicalUrl" TEXT,
    "authorName" TEXT,
    "authorType" "SafetyBlogAuthorType" NOT NULL DEFAULT 'EXPERT',
    "imageUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "categoryId" TEXT,
    "safetyLevel" "SafetyRiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "SafetyBlogPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyBlogComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" INTEGER,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "status" "SafetyBlogCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyBlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyBlogCommentVote" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" INTEGER,
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyBlogCommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "trade" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "badgeLevel" "ExpertBadgeLevel" NOT NULL DEFAULT 'CONTRIBUTOR',
    "answerCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertQaTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertQaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertQaQuestion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "trade" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "authorUserId" INTEGER,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "ExpertQaQuestionStatus" NOT NULL DEFAULT 'OPEN',
    "moderationStatus" "ExpertQaModerationStatus" NOT NULL DEFAULT 'PENDING',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "voteScore" INTEGER NOT NULL DEFAULT 0,
    "acceptedAnswerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertQaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertQaQuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ExpertQaQuestionTag_pkey" PRIMARY KEY ("questionId","tagId")
);

-- CreateTable
CREATE TABLE "ExpertQaAttachment" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "ExpertQaAttachmentType" NOT NULL DEFAULT 'OTHER',
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertQaAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertQaAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "expertProfileId" TEXT,
    "body" TEXT NOT NULL,
    "voteScore" INTEGER NOT NULL DEFAULT 0,
    "isExpertAnswer" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ExpertQaModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpertQaAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertQaAnswerVote" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" INTEGER,
    "voterKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertQaAnswerVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertEndorsement" (
    "id" TEXT NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "endorsedByUserId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAutoRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "targetType" "ModerationTargetType",
    "ruleType" "ModerationAutoRuleType" NOT NULL,
    "config" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "action" "ModerationAutoAction" NOT NULL DEFAULT 'FLAG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationAutoRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationCase" (
    "id" TEXT NOT NULL,
    "source" "ModerationCaseSource" NOT NULL,
    "targetType" "ModerationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reportReason" "ModerationReportReason",
    "reportDetails" TEXT,
    "reporterUserId" INTEGER,
    "autoRuleId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "ModerationCaseStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" "ModerationResolution",
    "resolutionNote" TEXT,
    "assignedToUserId" INTEGER,
    "reviewedByUserId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertVerificationRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expertProfileId" TEXT NOT NULL,
    "status" "ExpertVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "statement" TEXT,
    "tradeEvidence" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "reviewNote" TEXT,

    CONSTRAINT "ExpertVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_form_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_versions" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedBy" INTEGER,

    CONSTRAINT "safety_form_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_forms" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "definitionVersion" INTEGER NOT NULL DEFAULT 1,
    "formType" "SafetyFormType",
    "status" "SafetyFormStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "formData" JSONB NOT NULL DEFAULT '{}',
    "sifFlag" BOOLEAN NOT NULL DEFAULT false,
    "hecaFlag" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "siteId" INTEGER,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "incidentId" INTEGER,
    "supervisorId" INTEGER,
    "createdById" INTEGER,
    "submittedById" INTEGER,
    "reviewedById" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "clientVersion" INTEGER NOT NULL DEFAULT 0,
    "offlinePending" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_submissions" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "formData" JSONB NOT NULL,
    "status" "SafetyFormStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedById" INTEGER,

    CONSTRAINT "safety_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_attachments" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "fieldId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_form_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_templates" (
    "id" TEXT NOT NULL,
    "formType" "SafetyFormType" NOT NULL,
    "name" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "template" JSONB NOT NULL DEFAULT '{}',
    "companyId" INTEGER,
    "projectId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_signatures" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "fieldId" TEXT,
    "role" "SafetyFormSignatureRole" NOT NULL DEFAULT 'WORKER',
    "signerName" TEXT,
    "signerUserId" INTEGER,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_form_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_actions" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SafetyFormActionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "dueAt" TIMESTAMP(3),
    "assignedToId" INTEGER,
    "coreActionItemId" TEXT,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_form_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_form_audit_log" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_form_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_entry" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "ownerCompanyId" INTEGER NOT NULL,
    "assignedUserId" INTEGER,
    "sourceType" "CailSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CailStatus" NOT NULL DEFAULT 'open',
    "severity" "CailSeverity" NOT NULL DEFAULT 'medium',
    "riskCategory" "CailRiskCategory",
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER,
    "verifiedByUserId" INTEGER,
    "evidenceBefore" JSONB NOT NULL DEFAULT '[]',
    "evidenceAfter" JSONB NOT NULL DEFAULT '[]',
    "rootCauseCategory" TEXT,
    "rootCauseNotes" TEXT,
    "aiRootCauseSuggestions" JSONB,
    "aiCorrectiveActionSuggestions" JSONB,
    "aiClassification" JSONB,
    "lessonsLearnedGenerated" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "siteId" INTEGER,
    "locationNote" VARCHAR(500),
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "overdueAt" TIMESTAMP(3),
    "timeToResolveHours" DOUBLE PRECISION,

    CONSTRAINT "cail_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_attachment" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "uploadedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_activity_log" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_inspection" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "inspectorUserId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "siteId" INTEGER,
    "locationNote" VARCHAR(500),
    "status" "SafetyInspectionStatus" NOT NULL DEFAULT 'in_progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_inspection_item" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "polarity" "ObservationPolarity" NOT NULL,
    "photoStorageKey" TEXT,
    "photoDataUrl" TEXT,
    "coreFileId" INTEGER,
    "caption" TEXT,
    "ownerCompanyId" INTEGER,
    "assignedUserId" INTEGER,
    "equipmentId" INTEGER,
    "riskCategory" "CailRiskCategory",
    "severity" "CailSeverity",
    "notes" TEXT,
    "cailEntryId" TEXT,
    "aiSuggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_inspection_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbo_observation" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "observedByUserId" INTEGER NOT NULL,
    "observerCompanyId" INTEGER,
    "polarity" "ObservationPolarity" NOT NULL,
    "behaviorDescription" TEXT NOT NULL,
    "locationNote" VARCHAR(500),
    "siteId" INTEGER,
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "ownerCompanyId" INTEGER,
    "assignedUserId" INTEGER,
    "severity" "CailSeverity",
    "riskCategory" "CailRiskCategory",
    "cailEntryId" TEXT,
    "aiAnalysis" JSONB,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bbo_observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_investigation" (
    "incidentId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "investigationStatus" TEXT NOT NULL DEFAULT 'open',
    "narrative" TEXT,
    "immediateActions" TEXT,
    "witnessStatements" JSONB NOT NULL DEFAULT '[]',
    "aiInvestigationPack" JSONB,
    "leadInvestigatorId" INTEGER,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_investigation_pkey" PRIMARY KEY ("incidentId")
);

-- CreateTable
CREATE TABLE "incident_corrective_action_plan" (
    "id" TEXT NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "cailEntryId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_corrective_action_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inspection_cail_link" (
    "inspectionId" INTEGER NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "cailEntryId" TEXT NOT NULL,

    CONSTRAINT "equipment_inspection_cail_link_pkey" PRIMARY KEY ("inspectionId","checklistItemId")
);

-- CreateTable
CREATE TABLE "safety_form_cail_link" (
    "safetyFormId" TEXT NOT NULL,
    "fieldId" TEXT,
    "cailEntryId" TEXT NOT NULL,

    CONSTRAINT "safety_form_cail_link_pkey" PRIMARY KEY ("safetyFormId","cailEntryId")
);

-- CreateTable
CREATE TABLE "lessons_learned_entry" (
    "id" TEXT NOT NULL,
    "cailId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "sourceType" "CailSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "beforeEvidence" JSONB NOT NULL DEFAULT '[]',
    "afterEvidence" JSONB NOT NULL DEFAULT '[]',
    "severity" "CailSeverity",
    "timeToCloseHours" DOUBLE PRECISION,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "aiClusterId" TEXT,
    "aiInsights" JSONB,
    "embedding" JSONB,
    "embeddingModel" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_learned_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_safety_role" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "role" "ProjectSafetyRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_safety_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_safety_risk_snapshot" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "predictedLevel" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "precursors" JSONB NOT NULL DEFAULT '[]',
    "interventions" JSONB NOT NULL DEFAULT '[]',
    "companyHotspots" JSONB NOT NULL DEFAULT '[]',
    "engine" TEXT NOT NULL DEFAULT 'vase',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_safety_risk_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_safety_plan" (
    "projectId" INTEGER NOT NULL,
    "requiredDefinitionIds" JSONB NOT NULL DEFAULT '["daily-flha"]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_safety_plan_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "access_zone_rules" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER NOT NULL,
    "accessPointId" TEXT,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "zoneType" "PmAccessZoneType" NOT NULL DEFAULT 'general_work',
    "requiresFlhaHours" INTEGER NOT NULL DEFAULT 24,
    "requiresTrainingCodes" JSONB NOT NULL DEFAULT '[]',
    "requiresOrientation" BOOLEAN NOT NULL DEFAULT true,
    "requiresJha" BOOLEAN NOT NULL DEFAULT false,
    "requiresSdsAck" BOOLEAN NOT NULL DEFAULT false,
    "requiresPermitIds" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requirementsJson" JSONB NOT NULL DEFAULT '{}',
    "equipmentCategoryIds" JSONB NOT NULL DEFAULT '[]',
    "timeWindowStart" TEXT,
    "timeWindowEnd" TEXT,
    "highRisk" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_zone_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_access_grant" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedByUserId" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "sourceFormId" TEXT,
    "evaluationJson" JSONB,

    CONSTRAINT "site_access_grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_document" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "productName" TEXT NOT NULL,
    "manufacturer" TEXT,
    "category" "PmSdsCategory" NOT NULL DEFAULT 'CHEMICAL',
    "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDocumentId" TEXT,
    "casNumbers" JSONB NOT NULL DEFAULT '[]',
    "hazardClasses" JSONB NOT NULL DEFAULT '[]',
    "whmisJson" JSONB NOT NULL DEFAULT '{}',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "storageKey" TEXT,
    "revisionDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "reviewDueAt" TIMESTAMP(3),
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sds_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemical_inventory_item" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "siteId" INTEGER NOT NULL,
    "sdsDocumentId" TEXT,
    "productName" TEXT,
    "quantity" DECIMAL(12,3),
    "unit" TEXT,
    "containerSize" TEXT,
    "locationNote" VARCHAR(500),
    "storageClass" TEXT,
    "incompatibleWith" JSONB NOT NULL DEFAULT '[]',
    "chemicalExpiry" TIMESTAMP(3),
    "missingSdsFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chemical_inventory_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_document" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "versionNum" INTEGER NOT NULL DEFAULT 1,
    "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft',
    "storageKey" TEXT,
    "category" TEXT NOT NULL DEFAULT 'safety',
    "requiresAck" BOOLEAN NOT NULL DEFAULT true,
    "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
    "parentDocumentId" TEXT,
    "reviewDueAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_acknowledgment" (
    "id" TEXT NOT NULL,
    "policyDocumentId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureData" TEXT,

    CONSTRAINT "policy_acknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_plan" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "title" TEXT NOT NULL,
    "planType" "PmEmergencyPlanType" NOT NULL DEFAULT 'evacuation',
    "status" "PmEmergencyPlanStatus" NOT NULL DEFAULT 'draft',
    "versionNum" INTEGER NOT NULL DEFAULT 1,
    "contentJson" JSONB NOT NULL DEFAULT '{}',
    "rolesJson" JSONB NOT NULL DEFAULT '[]',
    "musterPointsJson" JSONB NOT NULL DEFAULT '[]',
    "responseStepsJson" JSONB NOT NULL DEFAULT '[]',
    "requiresAck" BOOLEAN NOT NULL DEFAULT true,
    "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "reviewDueAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muster_sessions" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "emergencyEventId" TEXT,
    "status" "MusterEventStatus" NOT NULL DEFAULT 'activated',
    "evacuationPhase" TEXT NOT NULL DEFAULT 'muster',
    "musterPointCode" TEXT,
    "siteAccessLocked" BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredByUser" INTEGER,
    "allClearAt" TIMESTAMP(3),
    "supervisorConfirmedAt" TIMESTAMP(3),
    "notes" TEXT,
    "expectedWorkerIds" JSONB NOT NULL DEFAULT '[]',
    "missingWorkerIds" JSONB NOT NULL DEFAULT '[]',
    "dangerZoneWorkerIds" JSONB NOT NULL DEFAULT '[]',
    "clientSyncId" TEXT,

    CONSTRAINT "muster_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muster_attendance" (
    "id" TEXT NOT NULL,
    "musterEventId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedOutAt" TIMESTAMP(3),
    "method" TEXT NOT NULL DEFAULT 'manual',
    "musterPointCode" TEXT,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "supervisorOverride" BOOLEAN NOT NULL DEFAULT false,
    "geoJson" JSONB,
    "clientSyncId" TEXT,

    CONSTRAINT "muster_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_heartbeat" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "payload" JSONB,
    "batteryLevel" DOUBLE PRECISION,
    "storageFreeMb" DOUBLE PRECISION,
    "sensorHealthJson" JSONB NOT NULL DEFAULT '{}',
    "firmwareVersion" TEXT,
    "alertsJson" JSONB NOT NULL DEFAULT '[]',
    "online" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha" (
    "id" TEXT NOT NULL,
    "kind" "JhaFlhaKind" NOT NULL DEFAULT 'FLHA',
    "status" "JhaFlhaStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "taskLibraryId" TEXT,
    "taskDescription" TEXT NOT NULL,
    "workScope" TEXT,
    "locationNote" VARCHAR(500),
    "environmentalJson" JSONB NOT NULL DEFAULT '{}',
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "sifScore" INTEGER NOT NULL DEFAULT 0,
    "hecaCategoryKey" TEXT,
    "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" INTEGER,
    "riskScore" INTEGER,
    "taskRiskScore" INTEGER,
    "aiAnalysis" JSONB,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "controlsAdequate" BOOLEAN,
    "reviewNotes" TEXT,
    "createdByUserId" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "clientVersion" INTEGER NOT NULL DEFAULT 0,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jha_flha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_version" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "changedByUserId" INTEGER,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_hazard" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "libraryEntryId" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "riskScore" INTEGER NOT NULL DEFAULT 9,
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "sifIndicator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_hazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_control" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "hazardId" TEXT,
    "libraryEntryId" TEXT,
    "controlType" TEXT NOT NULL DEFAULT 'administrative',
    "description" TEXT NOT NULL,
    "adequate" BOOLEAN,
    "effectivenessScore" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_energy_source" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "energyType" "JhaEnergyType" NOT NULL,
    "exposureLevel" INTEGER NOT NULL DEFAULT 1,
    "controlsSummary" TEXT,

    CONSTRAINT "jha_flha_energy_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_worker" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'crew',
    "trainingVerified" BOOLEAN NOT NULL DEFAULT false,
    "competencyVerified" BOOLEAN NOT NULL DEFAULT false,
    "equipmentAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "hazardAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "jha_flha_worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_equipment" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "authorized" BOOLEAN NOT NULL DEFAULT false,
    "preUseInspectionOk" BOOLEAN,

    CONSTRAINT "jha_flha_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_signature" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "role" "JhaFlhaSignatureRole" NOT NULL,
    "signerUserId" INTEGER,
    "signerName" TEXT,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_attachment" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "annotation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_corrective_action" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cailEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_library" (
    "id" TEXT NOT NULL,
    "seed_key" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "defaultSeverity" INTEGER NOT NULL DEFAULT 3,
    "defaultLikelihood" INTEGER NOT NULL DEFAULT 3,
    "defaultEnergyTypes" JSONB NOT NULL DEFAULT '[]',
    "default_control_keys" JSONB NOT NULL DEFAULT '[]',
    "taskTypes" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "seed_version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hazard_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_library" (
    "id" TEXT NOT NULL,
    "seed_key" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "controlType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hazardCategories" JSONB NOT NULL DEFAULT '[]',
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "seed_version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_catalog" (
    "id" TEXT NOT NULL,
    "catalog_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_task_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "taskCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "defaultHazardIds" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_task_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jha_flha_audit_log" (
    "id" TEXT NOT NULL,
    "jhaFlhaId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jha_flha_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_indicator" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "triggerRule" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sif_indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heca_category" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "keywordPatterns" JSONB NOT NULL DEFAULT '[]',
    "energyTypes" JSONB NOT NULL DEFAULT '[]',
    "severityDefault" INTEGER NOT NULL DEFAULT 3,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heca_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_heca_event" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "sourceType" "SifHecaSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL DEFAULT '',
    "status" "SifHecaEventStatus" NOT NULL DEFAULT 'ingested',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rawPayload" JSONB NOT NULL DEFAULT '{}',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sif_heca_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_score" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sifScore" INTEGER NOT NULL,
    "sifCategory" "SifPotentialCategory" NOT NULL,
    "severityComponent" INTEGER NOT NULL DEFAULT 0,
    "likelihoodComponent" INTEGER NOT NULL DEFAULT 0,
    "energyComponent" INTEGER NOT NULL DEFAULT 0,
    "controlComponent" INTEGER NOT NULL DEFAULT 0,
    "competencyComponent" INTEGER NOT NULL DEFAULT 0,
    "equipmentComponent" INTEGER NOT NULL DEFAULT 0,
    "environmentComponent" INTEGER NOT NULL DEFAULT 0,
    "historyComponent" INTEGER NOT NULL DEFAULT 0,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredActions" JSONB NOT NULL DEFAULT '[]',
    "explainability" JSONB NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sif_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heca_score" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "hecaCategoryCode" TEXT NOT NULL,
    "hecaCategoryLabel" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "hecaRiskScore" INTEGER NOT NULL,
    "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredCorrective" JSONB NOT NULL DEFAULT '[]',
    "explainability" JSONB NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heca_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_heca_link" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "linkedType" "SifHecaSourceType" NOT NULL,
    "linkedId" TEXT NOT NULL,
    "linkedItemId" TEXT NOT NULL DEFAULT '',
    "correlation" DOUBLE PRECISION,

    CONSTRAINT "sif_heca_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_heca_corrective_action" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedUserId" INTEGER,
    "cailEntryId" TEXT,
    "correctiveActionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sif_heca_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sif_heca_audit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sif_heca_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_template" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "name" TEXT NOT NULL,
    "category" "PmInspectionTemplateCategory" NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmInspectionTemplateStatus" NOT NULL DEFAULT 'draft',
    "scoringMode" "PmInspectionScoringMode" NOT NULL DEFAULT 'pass_fail',
    "items" JSONB NOT NULL DEFAULT '[]',
    "scoringRules" JSONB NOT NULL DEFAULT '{}',
    "requiredAttachments" JSONB NOT NULL DEFAULT '[]',
    "requiredSignatures" JSONB NOT NULL DEFAULT '[]',
    "equipmentTypeKeys" JSONB NOT NULL DEFAULT '[]',
    "parentTemplateId" TEXT,
    "seed_key" TEXT,
    "seed_version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" INTEGER,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_inspection_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "inspectorUserId" INTEGER NOT NULL,
    "status" "PmInspectionStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT,
    "locationNote" VARCHAR(500),
    "answers" JSONB NOT NULL DEFAULT '{}',
    "scorePercent" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "riskScore" INTEGER,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,
    "reviewedByUserId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "sharing_json" JSONB NOT NULL DEFAULT '{"shareReportWithContractors":false,"shareReportWithWorkers":false}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_deficiency" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "PmDeficiencySeverity" NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "status" "PmDeficiencyStatus" NOT NULL DEFAULT 'open',
    "assignedUserId" INTEGER,
    "assignedWorkerId" INTEGER,
    "subcontractorCompanyId" INTEGER,
    "dueAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "cailEntryId" TEXT,
    "sifEventId" TEXT,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_inspection_deficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_attachment" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "deficiencyId" TEXT,
    "correctiveId" TEXT,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "annotationJson" JSONB,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysis_status" TEXT,
    "analysis_json" JSONB,

    CONSTRAINT "pm_inspection_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_signature" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "signerName" TEXT,
    "signerUserId" INTEGER,
    "signatureData" TEXT,
    "core_file_id" INTEGER,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientSyncId" TEXT,

    CONSTRAINT "pm_inspection_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_corrective_action" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "deficiencyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedUserId" INTEGER,
    "cailEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_inspection_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_audit" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_inspection_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_type_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "baseType" "PmSafetyEventType" NOT NULL DEFAULT 'custom',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_type_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_root_cause_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_root_cause_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_contributing_factor_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_contributing_factor_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "eventType" "PmSafetyEventType" NOT NULL,
    "customTypeCode" TEXT,
    "status" "PmSafetyEventStatus" NOT NULL DEFAULT 'draft',
    "severity" "PmSafetyEventSeverity" NOT NULL DEFAULT 'low',
    "likelihood" INTEGER NOT NULL DEFAULT 1,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "sifEventId" TEXT,
    "hecaCategoryCode" TEXT,
    "scl_state" "PmSclState",
    "scl_triggers_json" JSONB NOT NULL DEFAULT '[]',
    "scl_precursors_json" JSONB NOT NULL DEFAULT '[]',
    "scl_potential_severity" "PmSafetyEventSeverity",
    "energy_profile_json" JSONB NOT NULL DEFAULT '{}',
    "mandatory_investigation" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationNote" VARCHAR(500),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "weatherJson" JSONB NOT NULL DEFAULT '{}',
    "propertyDamageJson" JSONB NOT NULL DEFAULT '{}',
    "environmentalImpactJson" JSONB NOT NULL DEFAULT '{}',
    "intakeWizardStep" INTEGER NOT NULL DEFAULT 0,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,
    "reviewedByUserId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "legacyIncidentId" INTEGER,
    "pmInspectionId" TEXT,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_safety_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_version" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_injury" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "workerId" INTEGER,
    "bodyPart" TEXT,
    "injuryType" TEXT,
    "treatment" TEXT,
    "firstAid" BOOLEAN NOT NULL DEFAULT false,
    "medicalAid" BOOLEAN NOT NULL DEFAULT false,
    "lostTime" BOOLEAN NOT NULL DEFAULT false,
    "modifiedWork" BOOLEAN NOT NULL DEFAULT false,
    "returnToWorkPlan" TEXT,
    "wcbClaimNumber" TEXT,
    "wcbStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_person" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "workerId" INTEGER,
    "role" TEXT NOT NULL,
    "name" TEXT,
    "companyId" INTEGER,
    "notes" TEXT,

    CONSTRAINT "pm_safety_event_person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_equipment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "conditionScore" INTEGER,
    "failureNotes" TEXT,
    "lockoutApplied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pm_safety_event_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_witness" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "workerId" INTEGER,
    "capturedByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_witness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_statement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "witnessId" TEXT,
    "statementText" TEXT NOT NULL,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_attachment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "injuryId" TEXT,
    "equipmentLinkId" TEXT,
    "correctiveId" TEXT,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "annotationJson" JSONB,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_root_cause" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "method" "PmRcaMethod" NOT NULL DEFAULT 'five_why',
    "category" TEXT,
    "description" TEXT NOT NULL,
    "whyChain" JSONB NOT NULL DEFAULT '[]',
    "fishboneJson" JSONB NOT NULL DEFAULT '{}',
    "taprootJson" JSONB NOT NULL DEFAULT '{}',
    "libraryCode" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_root_cause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_contributing_factor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "libraryCode" TEXT,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,

    CONSTRAINT "pm_safety_event_contributing_factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_corrective_action" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rootCauseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedUserId" INTEGER,
    "cailEntryId" TEXT,
    "unified_corrective_action_id" TEXT,
    "subcontractor_company_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_corrective_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_investigation" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" "PmInvestigationStatus" NOT NULL DEFAULT 'not_started',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "narrative" TEXT,
    "immediate_actions" TEXT,
    "guided_answers_json" JSONB NOT NULL DEFAULT '{}',
    "causal_tree_json" JSONB NOT NULL DEFAULT '{}',
    "scl_classification_json" JSONB NOT NULL DEFAULT '{}',
    "heca_verification_json" JSONB NOT NULL DEFAULT '{}',
    "energy_wheel_json" JSONB NOT NULL DEFAULT '{}',
    "executive_summary" TEXT,
    "lead_investigator_id" INTEGER,
    "started_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_safety_event_investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_event_audit" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_event_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_capa_company_config" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "dueDaysLow" INTEGER NOT NULL DEFAULT 30,
    "dueDaysMedium" INTEGER NOT NULL DEFAULT 14,
    "dueDaysHigh" INTEGER NOT NULL DEFAULT 7,
    "dueDaysCritical" INTEGER NOT NULL DEFAULT 1,
    "escalationRules" JSONB NOT NULL DEFAULT '{}',
    "assignmentRules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_capa_company_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_actions" (
    "id" TEXT NOT NULL,
    "cailEntryId" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "sourceModule" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceItemId" TEXT NOT NULL DEFAULT '',
    "deficiencyId" TEXT,
    "actionType" "PmCorrectiveActionType" NOT NULL DEFAULT 'permanent',
    "status" "PmCorrectiveActionStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severityScore" INTEGER NOT NULL DEFAULT 50,
    "priorityScore" INTEGER NOT NULL DEFAULT 50,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3),
    "overdueAt" TIMESTAMP(3),
    "equipmentId" INTEGER,
    "workerId" INTEGER,
    "subcontractorCompanyId" INTEGER,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "verifiedByUserId" INTEGER,
    "parentActionId" TEXT,
    "hazardId" TEXT,
    "controlId" TEXT,
    "rootCauseId" TEXT,
    "publishVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "severityLevel" TEXT NOT NULL DEFAULT 'medium',
    "priorityLevel" TEXT NOT NULL DEFAULT 'medium',
    "evidenceRequirementsJson" JSONB NOT NULL DEFAULT '{}',
    "verificationRequirementsJson" JSONB NOT NULL DEFAULT '{}',
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_assignments" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "userId" INTEGER,
    "workerId" INTEGER,
    "role" "PmCapaAssigneeRole" NOT NULL DEFAULT 'primary',
    "delegatedFrom" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "corrective_action_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_escalations" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "escalatedToUserId" INTEGER,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "payload" JSONB,

    CONSTRAINT "corrective_action_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_verifications" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "verifierUserId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "evidenceJson" JSONB NOT NULL DEFAULT '[]',
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_attachments" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "phase" TEXT NOT NULL DEFAULT 'evidence',
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_corrective_action_signature" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "signerUserId" INTEGER,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_corrective_action_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_audit" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_versions" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" INTEGER,

    CONSTRAINT "corrective_action_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrective_action_links" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "linkType" "PmCorrectiveActionLinkType" NOT NULL,
    "linkedId" TEXT NOT NULL,
    "linkedMeta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrective_action_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_capa_overrides" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "actionId" TEXT,
    "ruleType" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedById" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_capa_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_capa_offline_cache" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_capa_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_library_categories" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "code" "TopicLibraryCategoryCode" NOT NULL DEFAULT 'general',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_library_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "categoryId" TEXT,
    "scope" "TopicLibraryScope" NOT NULL DEFAULT 'company',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "discussionPoints" JSONB NOT NULL DEFAULT '[]',
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredAttachments" JSONB NOT NULL DEFAULT '[]',
    "isHighRisk" BOOLEAN NOT NULL DEFAULT false,
    "requiresSifReview" BOOLEAN NOT NULL DEFAULT false,
    "sifHecaTags" JSONB NOT NULL DEFAULT '[]',
    "sourceRefs" JSONB NOT NULL DEFAULT '[]',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_templates" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "meetingType" "SafetyMeetingType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "SafetyMeetingTemplateStatus" NOT NULL DEFAULT 'draft',
    "agendaJson" JSONB NOT NULL DEFAULT '[]',
    "requiredTopicIds" JSONB NOT NULL DEFAULT '[]',
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" INTEGER,
    "parentTemplateId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_meeting_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meetings" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "templateId" TEXT,
    "meetingType" "SafetyMeetingType" NOT NULL,
    "customMeetingTypeLabel" TEXT,
    "status" "SafetyMeetingStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "locationNote" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "facilitatorWorkerId" INTEGER,
    "supervisorUserId" INTEGER,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "SafetyMeetingReviewStatus" NOT NULL DEFAULT 'not_required',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" INTEGER,
    "qualityScore" INTEGER,
    "engagementScore" INTEGER,
    "cailEntryId" TEXT,
    "safetyStationId" INTEGER,
    "discussionNotes" TEXT,
    "hazardsDiscussed" JSONB NOT NULL DEFAULT '[]',
    "controlsDiscussed" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "pmInspectionId" TEXT,
    "clientSyncId" TEXT,
    "clientVersion" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_topics" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "topicLibraryId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "discussionPoints" JSONB NOT NULL DEFAULT '[]',
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredActions" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "isHighRisk" BOOLEAN NOT NULL DEFAULT false,
    "sourceModule" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_meeting_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "status" "SafetyMeetingAttendeeStatus" NOT NULL DEFAULT 'expected',
    "checkedInAt" TIMESTAMP(3),
    "trainingValid" BOOLEAN,
    "equipmentAuthorized" BOOLEAN,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT,
    "notes" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_signatures" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "attendeeId" TEXT,
    "role" TEXT NOT NULL,
    "signerUserId" INTEGER,
    "signerWorkerId" INTEGER,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientSyncId" TEXT,

    CONSTRAINT "safety_meeting_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_attachments" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "topicId" TEXT,
    "correctiveActionId" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "annotationJson" JSONB,
    "phase" TEXT NOT NULL DEFAULT 'evidence',
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_meeting_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_corrective_actions" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "topicId" TEXT,
    "correctiveActionId" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'discussion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_meeting_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_meeting_audit" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_meeting_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_access_meeting_requirement" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "meetingType" "SafetyMeetingType" NOT NULL,
    "windowHours" INTEGER NOT NULL DEFAULT 24,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_access_meeting_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_version" (
    "id" TEXT NOT NULL,
    "sdsDocumentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sds_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sds_attachment" (
    "id" TEXT NOT NULL,
    "sdsDocumentId" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sds_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_controlled_document" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "documentType" "PmControlledDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "versionNum" INTEGER NOT NULL DEFAULT 1,
    "status" "PmDocumentStatus" NOT NULL DEFAULT 'draft',
    "storageKey" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "equipmentId" INTEGER,
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
    "reviewDueAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "supersededById" TEXT,
    "parentDocumentId" TEXT,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_controlled_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_version" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_attachment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "sdsDocumentId" TEXT,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_acknowledgment" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "sdsDocumentId" TEXT,
    "controlledDocumentId" TEXT,
    "policyDocumentId" TEXT,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureData" TEXT,
    "clientSyncId" TEXT,

    CONSTRAINT "document_acknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturer_instruction" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "controlledDocId" TEXT,
    "title" TEXT NOT NULL,
    "manufacturer" TEXT,
    "modelNumber" TEXT,
    "revisionDate" TIMESTAMP(3),
    "outdatedAt" TIMESTAMP(3),
    "storageKey" TEXT,
    "hazardHints" JSONB NOT NULL DEFAULT '[]',
    "controlHints" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturer_instruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_audit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_certifications" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "certificationType" "PmEquipmentCertificationType" NOT NULL,
    "status" "PmEquipmentCertificationStatus" NOT NULL DEFAULT 'draft',
    "certificateNumber" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "storageKey" TEXT,
    "approvedByUserId" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "reviewDueAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inspections" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "pmInspectionId" TEXT,
    "cadence" "PmEquipmentInspectionCadence" NOT NULL,
    "conditionScore" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_inspection_items" (
    "id" TEXT NOT NULL,
    "equipmentInspectionId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "passed" BOOLEAN,
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "deficiencySeverity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_failures" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "equipmentId" INTEGER NOT NULL,
    "failureType" "PmEquipmentFailureType" NOT NULL,
    "status" "PmEquipmentFailureStatus" NOT NULL DEFAULT 'reported',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hazardCreated" BOOLEAN NOT NULL DEFAULT false,
    "safetyEventId" TEXT,
    "correctiveActionId" TEXT,
    "reportedByUserId" INTEGER,
    "supervisorReviewedAt" TIMESTAMP(3),
    "ownerReviewedAt" TIMESTAMP(3),
    "lockedOutAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_loto" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "status" "PmEquipmentLotoStatus" NOT NULL DEFAULT 'active',
    "reason" TEXT NOT NULL,
    "stepsJson" JSONB NOT NULL DEFAULT '[]',
    "authorizedWorkerIds" JSONB NOT NULL DEFAULT '[]',
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" INTEGER,
    "removedAt" TIMESTAMP(3),
    "removedByUserId" INTEGER,
    "legacyLockoutId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_loto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_equipment_authorizations" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "authType" "PmWorkerEquipmentAuthType" NOT NULL,
    "equipmentCategory" "PmEquipmentSafetyCategory",
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedByUserId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_equipment_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_condition_scores" (
    "id" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "score" DOUBLE PRECISION NOT NULL,
    "riskBand" TEXT NOT NULL,
    "factorsJson" JSONB NOT NULL DEFAULT '{}',
    "sourceModule" TEXT,
    "sourceId" TEXT,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_condition_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_assignment_audit" (
    "id" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "projectId" INTEGER,
    "subcontractorCompanyId" INTEGER,
    "action" TEXT NOT NULL,
    "passedRules" BOOLEAN NOT NULL DEFAULT true,
    "ruleFailuresJson" JSONB NOT NULL DEFAULT '[]',
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_assignment_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_audit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_plan_versions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_plan_acknowledgment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureData" TEXT,
    "clientSyncId" TEXT,

    CONSTRAINT "emergency_plan_acknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_events" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "siteId" INTEGER NOT NULL,
    "eventType" "PmEmergencyEventType" NOT NULL,
    "status" "PmEmergencyEventStatus" NOT NULL DEFAULT 'declared',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classification" TEXT,
    "timelineJson" JSONB NOT NULL DEFAULT '[]',
    "responseActionsJson" JSONB NOT NULL DEFAULT '[]',
    "safetyEventId" TEXT,
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT true,
    "supervisorReviewedAt" TIMESTAMP(3),
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declaredByUserId" INTEGER,
    "allClearAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_event_people" (
    "id" TEXT NOT NULL,
    "emergencyEventId" TEXT NOT NULL,
    "workerId" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'involved',
    "notes" TEXT,
    "injured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_event_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_event_equipment" (
    "id" TEXT NOT NULL,
    "emergencyEventId" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "pmEmergencyEquipmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_event_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_event_attachments" (
    "id" TEXT NOT NULL,
    "emergencyEventId" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "coreFileId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_event_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_notifications" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "emergencyEventId" TEXT,
    "musterEventId" TEXT,
    "channel" "PmEmergencyNotificationChannel" NOT NULL,
    "status" "PmEmergencyNotificationStatus" NOT NULL DEFAULT 'pending',
    "triggerType" TEXT NOT NULL,
    "recipientUserId" INTEGER,
    "recipientWorkerId" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_equipment" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "siteId" INTEGER,
    "projectId" INTEGER,
    "equipmentType" "PmEmergencyEquipmentType" NOT NULL,
    "name" TEXT NOT NULL,
    "locationNote" TEXT,
    "mapCoordsJson" JSONB,
    "readinessScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP(3),
    "lastInspectionAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_equipment_inspections" (
    "id" TEXT NOT NULL,
    "emergencyEquipmentId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectedByUserId" INTEGER,

    CONSTRAINT "emergency_equipment_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_site_emergency_lock" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "emergencyEventId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),

    CONSTRAINT "pm_site_emergency_lock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_audit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_points" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "siteId" INTEGER,
    "pointType" "PmAccessPointType" NOT NULL,
    "name" TEXT NOT NULL,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "description" TEXT,
    "geoJson" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_attempts" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "accessPointId" TEXT,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "decision" "PmAccessDecision" NOT NULL,
    "denialReasons" JSONB NOT NULL DEFAULT '[]',
    "checksJson" JSONB NOT NULL DEFAULT '{}',
    "overrideId" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_denials" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "reasonMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_denials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_overrides" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "zoneCode" TEXT,
    "overrideType" "PmAccessOverrideType" NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "supervisorUserId" INTEGER,
    "safetyUserId" INTEGER,
    "supervisorSignature" TEXT,
    "safetySignature" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_attachments" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT,
    "overrideId" TEXT,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_access_requirements" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "workerId" INTEGER NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementKey" TEXT NOT NULL,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_access_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_access_requirements" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementKey" TEXT NOT NULL,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_access_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_audit" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_access_logs" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "zoneCode" TEXT NOT NULL DEFAULT 'SITE',
    "action" "PmSafetyStationAccessAction" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "decision" TEXT,
    "denialReasons" JSONB NOT NULL DEFAULT '[]',
    "checksJson" JSONB NOT NULL DEFAULT '{}',
    "accessAttemptId" TEXT,
    "jhaFlhaId" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_equipment_logs" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "granted" BOOLEAN NOT NULL,
    "denialReasons" JSONB NOT NULL DEFAULT '[]',
    "checksJson" JSONB NOT NULL DEFAULT '{}',
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_equipment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_muster_logs" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "musterEventId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'check_in',
    "musterPointCode" TEXT,
    "geoJson" JSONB,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_muster_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_offline_cache" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_station_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_attachments" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "dataUrl" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_station_audit" (
    "id" TEXT NOT NULL,
    "stationId" INTEGER,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_station_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_safety_profiles" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "riskLevel" "PmProjectSafetyRiskLevel" NOT NULL DEFAULT 'medium',
    "projectType" TEXT,
    "scopeOfWorkJson" JSONB NOT NULL DEFAULT '{}',
    "requiredJhaTypes" JSONB NOT NULL DEFAULT '[]',
    "requiredInspections" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipmentCerts" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requiredEmergencyPlans" JSONB NOT NULL DEFAULT '[]',
    "requiredSdsAcks" JSONB NOT NULL DEFAULT '[]',
    "requiredToolboxTalks" JSONB NOT NULL DEFAULT '[]',
    "enforcementRulesJson" JSONB NOT NULL DEFAULT '{}',
    "zoneRulesJson" JSONB NOT NULL DEFAULT '[]',
    "equipmentRulesJson" JSONB NOT NULL DEFAULT '{}',
    "trainingRulesJson" JSONB NOT NULL DEFAULT '{}',
    "emergencyRulesJson" JSONB NOT NULL DEFAULT '{}',
    "environmentalJson" JSONB NOT NULL DEFAULT '{}',
    "subcontractorIds" JSONB NOT NULL DEFAULT '[]',
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedById" INTEGER,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_safety_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_safety_profile_versions" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" INTEGER,

    CONSTRAINT "pm_project_safety_profile_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_hazards" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "profileId" TEXT,
    "category" "PmProjectHazardCategory" NOT NULL,
    "subcategory" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "hecaCategoryKey" TEXT,
    "requiredControlIds" JSONB NOT NULL DEFAULT '[]',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_hazards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_controls" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "profileId" TEXT,
    "controlType" "PmProjectControlType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hazardCategoryKeys" JSONB NOT NULL DEFAULT '[]',
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "equipmentRuleJson" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_safety_overrides" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "profileId" TEXT,
    "ruleType" "PmProjectSafetyOverrideRuleType" NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "overrideJson" JSONB NOT NULL DEFAULT '{}',
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "approvedById" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_project_safety_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_safety_context_audit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "projectId" INTEGER,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_project_safety_context_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_safety_offline_cache" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_safety_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_profiles" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "corporateRiskLevel" "PmProjectSafetyRiskLevel" NOT NULL DEFAULT 'medium',
    "policiesJson" JSONB NOT NULL DEFAULT '[]',
    "hazardLibraryRef" JSONB NOT NULL DEFAULT '{}',
    "controlLibraryRef" JSONB NOT NULL DEFAULT '{}',
    "trainingMatrixRef" JSONB NOT NULL DEFAULT '{}',
    "ppeStandardsJson" JSONB NOT NULL DEFAULT '[]',
    "emergencyPlansRef" JSONB NOT NULL DEFAULT '[]',
    "sdsLibraryRef" JSONB NOT NULL DEFAULT '{}',
    "equipmentRulesRef" JSONB NOT NULL DEFAULT '{}',
    "zoneTemplatesRef" JSONB NOT NULL DEFAULT '[]',
    "enforcementRulesJson" JSONB NOT NULL DEFAULT '{}',
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedById" INTEGER,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_safety_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_profile_versions" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" INTEGER,

    CONSTRAINT "company_safety_profile_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_hazard_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "category" "PmCompanyHazardCategory" NOT NULL,
    "subcategory" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "hecaCategoryKey" TEXT,
    "requiredControlIds" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "syncToProjects" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_hazard_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_control_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "controlType" "PmCompanyControlType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "controlStrength" INTEGER NOT NULL DEFAULT 3,
    "verificationSteps" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipment" JSONB NOT NULL DEFAULT '[]',
    "hazardCategoryKeys" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "syncToProjects" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_control_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_training_matrix" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "roleType" "PmCompanyTrainingRoleType" NOT NULL,
    "category" "PmCompanyTrainingCategory" NOT NULL,
    "trainingCode" TEXT NOT NULL,
    "trainingName" TEXT NOT NULL,
    "expiresInDays" INTEGER NOT NULL DEFAULT 365,
    "autoAssignRules" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_training_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policies" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "policyType" "PmCompanyPolicyType" NOT NULL DEFAULT 'safety_policy',
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "storageKey" TEXT,
    "requiresAck" BOOLEAN NOT NULL DEFAULT true,
    "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "reviewDueAt" TIMESTAMP(3),
    "legacyPolicyId" TEXT,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policy_versions" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT,
    "snapshotJson" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_policy_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_policy_acknowledgments" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureData" TEXT,

    CONSTRAINT "company_policy_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_sds_library" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "legacySdsId" TEXT,
    "productName" TEXT NOT NULL,
    "manufacturer" TEXT,
    "casNumber" TEXT,
    "whmisClass" TEXT,
    "ppeRequirements" JSONB NOT NULL DEFAULT '[]',
    "firstAidJson" JSONB NOT NULL DEFAULT '{}',
    "handlingJson" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "expiresAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_sds_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_sds_versions" (
    "id" TEXT NOT NULL,
    "sdsId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_sds_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_emergency_plans" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "planType" "PmEmergencyPlanType" NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "contentJson" JSONB NOT NULL DEFAULT '{}',
    "requiresAck" BOOLEAN NOT NULL DEFAULT true,
    "requiresAckForAccess" BOOLEAN NOT NULL DEFAULT false,
    "legacyPlanId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_emergency_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_emergency_plan_versions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_emergency_plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_equipment_rules" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "ruleKey" TEXT NOT NULL,
    "requiredCerts" JSONB NOT NULL DEFAULT '[]',
    "requiredInspections" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "operatorAuthRequired" BOOLEAN NOT NULL DEFAULT true,
    "enforcementAction" "PmCompanyEnforcementAction" NOT NULL DEFAULT 'block_access',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_equipment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_zone_templates" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "templateCode" TEXT NOT NULL,
    "zoneType" "PmAccessZoneType" NOT NULL,
    "title" TEXT NOT NULL,
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requiresJha" BOOLEAN NOT NULL DEFAULT false,
    "requiresFlhaHours" INTEGER NOT NULL DEFAULT 24,
    "requiresPermits" JSONB NOT NULL DEFAULT '[]',
    "requiresSdsAck" BOOLEAN NOT NULL DEFAULT false,
    "highRisk" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_zone_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_overrides" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "overrideType" "PmCompanySafetyOverrideType" NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "overrideJson" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3),
    "supervisorSig" TEXT,
    "safetySig" TEXT,
    "approvedById" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_safety_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_audit" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "profileId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_safety_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_safety_offline_cache" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_safety_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmProjectSafetyPublishStatus" NOT NULL DEFAULT 'draft',
    "roleType" TEXT,
    "tradeCode" TEXT,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "riskLevel" "PmProjectSafetyRiskLevel" NOT NULL DEFAULT 'low',
    "scoreFactorsJson" JSONB NOT NULL DEFAULT '{}',
    "requiredActionsJson" JSONB NOT NULL DEFAULT '[]',
    "requiresSupervisorReview" BOOLEAN NOT NULL DEFAULT false,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_training" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "trainingCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "providerName" TEXT,
    "competencyLevel" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT,
    "legacyRecordId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'valid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_competencies" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "competencyKey" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "evaluatorId" INTEGER,
    "legacyEvalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_authorizations" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "companyId" INTEGER,
    "authType" "PmWorkerAuthorizationType" NOT NULL,
    "equipmentId" INTEGER,
    "issuedByUserId" INTEGER,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredCerts" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "legacyAuthId" TEXT,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_medical_restrictions" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "restrictionType" "PmWorkerMedicalRestrictionType" NOT NULL,
    "description" TEXT NOT NULL,
    "blocksHighRisk" BOOLEAN NOT NULL DEFAULT false,
    "blocksConfinedSpace" BOOLEAN NOT NULL DEFAULT false,
    "blocksHotWork" BOOLEAN NOT NULL DEFAULT false,
    "blocksEquipment" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_medical_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_hazard_exposure" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "projectId" INTEGER,
    "sourceType" "PmWorkerHazardExposureSource" NOT NULL,
    "sourceId" TEXT,
    "hazardType" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "hecaCategoryKey" TEXT,
    "exposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_hazard_exposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_incident_history" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "projectId" INTEGER,
    "eventType" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT NOT NULL,
    "severity" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_incident_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_corrective_actions" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "capaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),
    "sifLinked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_access_logs" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "projectId" INTEGER,
    "zoneCode" TEXT,
    "equipmentId" INTEGER,
    "granted" BOOLEAN NOT NULL,
    "decision" TEXT,
    "denialReasons" JSONB NOT NULL DEFAULT '[]',
    "sourceAttemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_overrides" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "overrideType" "PmWorkerSafetyOverrideType" NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "supervisorSig" TEXT,
    "safetySig" TEXT,
    "approvedById" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_safety_scores" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "score" INTEGER NOT NULL,
    "riskLevel" "PmProjectSafetyRiskLevel" NOT NULL,
    "factorsJson" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_safety_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_safety_audit" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "profileId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_safety_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_safety_offline_cache" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_safety_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_config" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "projectType" TEXT,
    "scopeOfWorkJson" JSONB NOT NULL DEFAULT '{}',
    "locationsJson" JSONB NOT NULL DEFAULT '[]',
    "zonesJson" JSONB NOT NULL DEFAULT '[]',
    "scheduleJson" JSONB NOT NULL DEFAULT '{}',
    "subcontractorIds" JSONB NOT NULL DEFAULT '[]',
    "projectManagerId" INTEGER,
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_packages" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "configId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PmWorkPackageStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "locationNote" TEXT,
    "zoneCode" TEXT,
    "tasksJson" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
    "requiredWorkerIds" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredJhaIds" JSONB NOT NULL DEFAULT '[]',
    "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
    "hazardIds" JSONB NOT NULL DEFAULT '[]',
    "controlIds" JSONB NOT NULL DEFAULT '[]',
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workPackageId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'general',
    "status" "PmPmTaskStatus" NOT NULL DEFAULT 'draft',
    "requiredSkills" JSONB NOT NULL DEFAULT '[]',
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
    "requiredJhaId" TEXT,
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requiredInspections" JSONB NOT NULL DEFAULT '[]',
    "hazardIds" JSONB NOT NULL DEFAULT '[]',
    "zoneCode" TEXT,
    "sifReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "progressPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "blockedReason" TEXT,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_schedules" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "taskId" TEXT,
    "workerId" INTEGER,
    "equipmentId" INTEGER,
    "zoneCode" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'task',
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "conflictFlag" BOOLEAN NOT NULL DEFAULT false,
    "safetyBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_worker_assignments" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "workerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'crew',
    "status" "PmPmAssignmentStatus" NOT NULL DEFAULT 'pending',
    "validationJson" JSONB NOT NULL DEFAULT '{}',
    "blockedReason" TEXT,
    "assignedById" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientSyncId" TEXT,

    CONSTRAINT "pm_worker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_equipment_assignments" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "equipmentId" INTEGER NOT NULL,
    "operatorId" INTEGER,
    "status" "PmPmAssignmentStatus" NOT NULL DEFAULT 'pending',
    "validationJson" JSONB NOT NULL DEFAULT '{}',
    "blockedReason" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientSyncId" TEXT,

    CONSTRAINT "pm_equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "permitType" "PmPermitType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "PmPermitStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredControls" JSONB NOT NULL DEFAULT '[]',
    "requiredJhaId" TEXT,
    "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
    "workflowJson" JSONB NOT NULL DEFAULT '{}',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "legacyWorkflowId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veripm_permits" (
    "permit_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "job_id" TEXT,
    "asset_id" TEXT,
    "contractor_id" INTEGER,
    "pm_permit_id" TEXT,
    "fieldos_task_id" TEXT,
    "permit_type" TEXT NOT NULL,
    "risk_level" "VeripmPermitRiskLevel" NOT NULL DEFAULT 'medium',
    "status" "VeripmPermitSyncStatus" NOT NULL DEFAULT 'draft',
    "required_signatures" JSONB NOT NULL DEFAULT '[]',
    "required_documents" JSONB NOT NULL DEFAULT '[]',
    "required_ppe" JSONB NOT NULL DEFAULT '[]',
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "created_by_user_id" INTEGER,
    "fieldos_metadata_json" JSONB NOT NULL DEFAULT '{}',
    "safety_links_json" JSONB NOT NULL DEFAULT '{}',
    "work_order_ids_json" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veripm_permits_pkey" PRIMARY KEY ("permit_id")
);

-- CreateTable
CREATE TABLE "veripm_permit_activity" (
    "activity_id" TEXT NOT NULL,
    "permit_id" TEXT NOT NULL,
    "kind" "VeripmPermitActivityKind" NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'veripm',
    "status_from" TEXT,
    "status_to" TEXT,
    "actor_user_id" INTEGER,
    "fieldos_task_id" TEXT,
    "summary" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL DEFAULT '{}',
    "photo_url" TEXT,
    "signature_role" TEXT,
    "signature_name" TEXT,
    "css_delta" DOUBLE PRECISION,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "veripm_permit_activity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "permit_versions" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permit_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_attachments" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "fileSize" INTEGER,
    "thumbnailPath" TEXT,
    "thumbnailDataUrl" TEXT,
    "status" "PmAttachmentStatus" NOT NULL DEFAULT 'uploaded',
    "virusScanStatus" "PmAttachmentVirusScanStatus" NOT NULL DEFAULT 'pending',
    "uploadedByUserId" INTEGER,
    "processingJson" JSONB NOT NULL DEFAULT '{}',
    "cailTagsJson" JSONB NOT NULL DEFAULT '[]',
    "coreFileId" INTEGER,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment_annotations" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "annotationType" TEXT NOT NULL,
    "annotationData" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" INTEGER,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment_audit" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL DEFAULT '{}',
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_audit" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_project_offline_cache" (
    "id" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_project_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_cache" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "moduleType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "lastModified" TIMESTAMP(3) NOT NULL,
    "syncStatus" "PmOfflineSyncStatus" NOT NULL DEFAULT 'pending_sync',
    "clientVersion" INTEGER,
    "errorMessage" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_conflicts" (
    "id" TEXT NOT NULL,
    "cacheId" TEXT,
    "deviceId" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "localValue" JSONB NOT NULL DEFAULT '{}',
    "serverValue" JSONB NOT NULL DEFAULT '{}',
    "resolvedValue" JSONB,
    "resolvedByUserId" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_audit" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "companyId" INTEGER,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL DEFAULT '{}',
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offline_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazards" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "workerId" INTEGER,
    "parentHazardId" TEXT,
    "scopeLevel" "PmUnifiedHazardScope" NOT NULL DEFAULT 'company',
    "hazardType" "PmUnifiedHazardType" NOT NULL DEFAULT 'physical',
    "category" "PmUnifiedHazardCategory" NOT NULL DEFAULT 'energy',
    "subcategory" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "riskScore" INTEGER NOT NULL DEFAULT 9,
    "sifPotential" BOOLEAN NOT NULL DEFAULT false,
    "hecaCategoryKey" TEXT,
    "sifScore" INTEGER,
    "supervisorReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
    "sourceType" "PmUnifiedHcIngestSource" NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "legacyCompanyHazardId" TEXT,
    "legacyProjectHazardId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmUnifiedHcPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hazards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_versions" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hazard_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_energy" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "energyType" "PmUnifiedEnergyType" NOT NULL,
    "exposureLevel" INTEGER NOT NULL DEFAULT 1,
    "highEnergyFlag" BOOLEAN NOT NULL DEFAULT false,
    "severityScore" INTEGER NOT NULL DEFAULT 3,
    "autoDetected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hazard_energy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_controls" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "effectivenessScore" INTEGER,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hazard_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_training" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "trainingCode" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hazard_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_equipment" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "equipmentType" TEXT,

    CONSTRAINT "hazard_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_ppe" (
    "id" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "ppeType" TEXT NOT NULL,

    CONSTRAINT "hazard_ppe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controls" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "workPackageId" TEXT,
    "taskId" TEXT,
    "parentControlId" TEXT,
    "scopeLevel" "PmUnifiedHazardScope" NOT NULL DEFAULT 'company',
    "controlType" "PmUnifiedControlType" NOT NULL DEFAULT 'administrative',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "controlStrength" INTEGER NOT NULL DEFAULT 3,
    "hierarchyLevel" INTEGER NOT NULL DEFAULT 3,
    "requiredTraining" JSONB NOT NULL DEFAULT '[]',
    "requiredEquipmentIds" JSONB NOT NULL DEFAULT '[]',
    "requiredPpe" JSONB NOT NULL DEFAULT '[]',
    "requiredPermitTypes" JSONB NOT NULL DEFAULT '[]',
    "sourceType" "PmUnifiedHcIngestSource" NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "legacyCompanyControlId" TEXT,
    "legacyProjectControlId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PmUnifiedHcPublishStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clientSyncId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_versions" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_training" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "trainingCode" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "control_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_equipment" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "equipmentId" INTEGER,

    CONSTRAINT "control_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_ppe" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "ppeType" TEXT NOT NULL,

    CONSTRAINT "control_ppe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_verification" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" INTEGER,

    CONSTRAINT "control_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_audit" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "hazardId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hazard_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_audit" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "controlId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_hc_attachments" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "hazardId" TEXT,
    "controlId" TEXT,
    "energyId" TEXT,
    "entityType" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "dataUrl" TEXT,
    "annotationJson" JSONB,
    "clientSyncId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_hc_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_hc_overrides" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "ruleType" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "hazardId" TEXT,
    "controlId" TEXT,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedById" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_hc_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_hc_offline_cache" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_hc_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_models" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER,
    "modelKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CailIntelModelStatus" NOT NULL DEFAULT 'draft',
    "activeVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_model_versions" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "parametersJson" JSONB NOT NULL DEFAULT '{}',
    "metricsJson" JSONB NOT NULL DEFAULT '{}',
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_model_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_model_audit" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "version" INTEGER,
    "eventType" TEXT NOT NULL,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_model_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_training_data" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "sourceModule" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "featureJson" JSONB NOT NULL,
    "labelJson" JSONB,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "taggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_predictions" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "entityType" "CailIntelEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "predictionType" "CailIntelPredictionType" NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "modelVersion" INTEGER NOT NULL DEFAULT 1,
    "inferenceMode" "CailIntelInferenceMode" NOT NULL,
    "factorsJson" JSONB NOT NULL DEFAULT '[]',
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_scores" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "entityType" "CailIntelEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "scoreType" "CailIntelScoreType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "componentsJson" JSONB NOT NULL DEFAULT '{}',
    "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "modelVersion" INTEGER NOT NULL DEFAULT 1,
    "inferenceMode" "CailIntelInferenceMode" NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "entityType" "CailIntelEntityType",
    "entityId" TEXT,
    "recommendationType" "CailIntelRecommendationType" NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION NOT NULL,
    "requiredActionsJson" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'open',
    "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_correlations" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "leftModule" TEXT NOT NULL,
    "leftEntityId" TEXT NOT NULL,
    "rightModule" TEXT NOT NULL,
    "rightEntityId" TEXT NOT NULL,
    "correlationType" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "evidenceJson" JSONB NOT NULL DEFAULT '[]',
    "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cail_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_explainability" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "predictionId" TEXT,
    "scoreId" TEXT,
    "summary" TEXT NOT NULL,
    "whyJson" JSONB NOT NULL,
    "dataSourcesJson" JSONB NOT NULL DEFAULT '[]',
    "hazardFactorsJson" JSONB NOT NULL DEFAULT '[]',
    "controlFactorsJson" JSONB NOT NULL DEFAULT '[]',
    "workerFactorsJson" JSONB NOT NULL DEFAULT '[]',
    "equipmentFactorsJson" JSONB NOT NULL DEFAULT '[]',
    "projectFactorsJson" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION NOT NULL,
    "recommendedActionsJson" JSONB NOT NULL DEFAULT '[]',
    "modelKey" TEXT NOT NULL DEFAULT 'deterministic_rules_v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_explainability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_inference_logs" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "inferenceMode" "CailIntelInferenceMode" NOT NULL,
    "engineLayer" TEXT NOT NULL,
    "inputHash" TEXT,
    "outputSummary" TEXT,
    "durationMs" INTEGER,
    "actorId" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cail_inference_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cail_offline_cache" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "cacheKey" TEXT NOT NULL,
    "cacheVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "modelVersionsJson" JSONB NOT NULL DEFAULT '{}',
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cail_offline_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_packages" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER,
    "project_id" INTEGER,
    "type" "OrientationPackageType" NOT NULL,
    "title" TEXT NOT NULL,
    "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "orientation_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_versions" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '{}',
    "media" JSONB NOT NULL DEFAULT '[]',
    "quiz" JSONB NOT NULL DEFAULT '{}',
    "ai_metadata" JSONB,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orientation_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_assignments" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "scope" "OrientationAssignmentScope" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orientation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_worker_progress" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL DEFAULT 'en',
    "status" "OrientationWorkerProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "quiz_score" DOUBLE PRECISION,
    "certificate_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientation_worker_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_photo_finding" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "attachment_id" TEXT,
    "category" "PmInspectionFindingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "PmDeficiencySeverity" NOT NULL DEFAULT 'medium',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "responsible_party" "PmInspectionResponsibleParty" NOT NULL,
    "evidence_required" JSONB NOT NULL DEFAULT '[]',
    "deficiency_id" TEXT,
    "corrective_action_id" TEXT,
    "analysis_json" JSONB,
    "scl_state" "PmSclState",
    "heca_involved" BOOLEAN NOT NULL DEFAULT false,
    "heca_type" TEXT,
    "heca_category_code" TEXT,
    "energy_types_json" JSONB NOT NULL DEFAULT '[]',
    "energy_control_state" "PmEnergyControlState",
    "high_energy_flag" BOOLEAN NOT NULL DEFAULT false,
    "requires_investigation" BOOLEAN NOT NULL DEFAULT false,
    "escalated_severity" BOOLEAN NOT NULL DEFAULT false,
    "client_sync_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_inspection_photo_finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_inspection_contractor_dispatch" (
    "id" TEXT NOT NULL,
    "corrective_action_id" TEXT NOT NULL,
    "subcontractor_company_id" INTEGER NOT NULL,
    "status" "PmContractorDispatchStatus" NOT NULL DEFAULT 'pending',
    "package_json" JSONB NOT NULL,
    "sent_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "overdue_at" TIMESTAMP(3),
    "notification_ids" JSONB NOT NULL DEFAULT '[]',
    "client_sync_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_inspection_contractor_dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_pool" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "name" TEXT NOT NULL,
    "selection_rate_percent" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_substance_test_pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_pool_member" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pm_substance_test_pool_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_event" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "worker_id" INTEGER NOT NULL,
    "test_type" "PmSubstanceTestType" NOT NULL,
    "status" "PmSubstanceTestStatus" NOT NULL DEFAULT 'scheduled',
    "specimen_type" "PmSubstanceSpecimenType" NOT NULL DEFAULT 'urine',
    "scheduled_at" TIMESTAMP(3),
    "collected_at" TIMESTAMP(3),
    "incident_event_id" TEXT,
    "pool_id" TEXT,
    "suspicion_notes" TEXT,
    "suspicion_observed_by_user_id" INTEGER,
    "collection_site_note" VARCHAR(500),
    "der_user_id" INTEGER,
    "created_by_user_id" INTEGER NOT NULL,
    "client_sync_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_substance_test_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_result" (
    "id" TEXT NOT NULL,
    "test_event_id" TEXT NOT NULL,
    "outcome" "PmSubstanceTestResultOutcome" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_user_id" INTEGER NOT NULL,
    "mro_notes" TEXT,
    "alcohol_level" DOUBLE PRECISION,
    "substance_panel" TEXT,
    "compliance_applied" BOOLEAN NOT NULL DEFAULT false,
    "compliance_json" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "pm_substance_test_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_custody_transfer" (
    "id" TEXT NOT NULL,
    "test_event_id" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "from_role" "PmCustodyPartyRole" NOT NULL,
    "to_role" "PmCustodyPartyRole" NOT NULL,
    "from_party_name" TEXT,
    "to_party_name" TEXT,
    "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_note" VARCHAR(500),
    "notes" TEXT,
    "signature_id" TEXT,

    CONSTRAINT "pm_substance_test_custody_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_signature" (
    "id" TEXT NOT NULL,
    "test_event_id" TEXT NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_role" "PmCustodyPartyRole" NOT NULL,
    "signature_data" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signed_by_user_id" INTEGER,
    "ip_address" TEXT,

    CONSTRAINT "pm_substance_test_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_substance_test_attachment" (
    "id" TEXT NOT NULL,
    "test_event_id" TEXT NOT NULL,
    "custody_transfer_id" TEXT,
    "document_type" "PmSubstanceTestDocumentType" NOT NULL DEFAULT 'other',
    "file_name" TEXT,
    "mime_type" TEXT,
    "storage_key" TEXT,
    "data_url" TEXT,
    "uploaded_by_user_id" INTEGER,
    "client_sync_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_substance_test_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_predictive_safety_forecast" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "week_start" TIMESTAMP(3) NOT NULL,
    "risk_index" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "forecast_json" JSONB NOT NULL DEFAULT '{}',
    "alerts_json" JSONB NOT NULL DEFAULT '[]',
    "model_key" TEXT NOT NULL DEFAULT 'predictive_safety_v1',
    "model_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_predictive_safety_forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_contractor_portal_membership" (
    "id" TEXT NOT NULL,
    "prime_company_id" INTEGER NOT NULL,
    "contractor_company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_contractor_portal_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_contractor_finding_acknowledgment" (
    "id" TEXT NOT NULL,
    "deficiency_id" TEXT NOT NULL,
    "contractor_company_id" INTEGER NOT NULL,
    "acknowledged_by_user_id" INTEGER NOT NULL,
    "notes" TEXT,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_contractor_finding_acknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_contractor_portal_message" (
    "id" TEXT NOT NULL,
    "prime_company_id" INTEGER NOT NULL,
    "contractor_company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "sender_user_id" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "related_type" TEXT,
    "related_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_contractor_portal_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_hub_snapshot" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "snapshot_json" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_hub_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_evidence_index" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "domain" "PmSafetyHubDomain" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "attachment_id" TEXT,
    "legacy_ref" TEXT,
    "file_name" TEXT,
    "mime_type" TEXT,
    "storage_key" TEXT,
    "thumbnail_data_url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags_json" JSONB NOT NULL DEFAULT '[]',
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_evidence_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_safety_hub_event_log" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "event_name" TEXT NOT NULL,
    "domain" "PmSafetyHubDomain",
    "entity_type" TEXT,
    "entity_id" TEXT,
    "payload_json" JSONB NOT NULL DEFAULT '{}',
    "actor_id" INTEGER,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_safety_hub_event_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_sms_risk_context" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "entity_type" "PmSmsEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "scl_state" "PmSclState",
    "scl_triggers_json" JSONB NOT NULL DEFAULT '[]',
    "scl_precursors_json" JSONB NOT NULL DEFAULT '[]',
    "scl_potential_severity" TEXT,
    "heca_involved" BOOLEAN NOT NULL DEFAULT false,
    "heca_type" "PmSmsHecaType",
    "heca_category_code" TEXT,
    "heca_library_entry_id" TEXT,
    "energy_types_json" JSONB NOT NULL DEFAULT '[]',
    "energy_control_state" "PmEnergyControlState",
    "high_energy_flag" BOOLEAN NOT NULL DEFAULT false,
    "missing_controls_json" JSONB NOT NULL DEFAULT '[]',
    "escalation_score" INTEGER NOT NULL DEFAULT 0,
    "requires_investigation" BOOLEAN NOT NULL DEFAULT false,
    "metadata_json" JSONB NOT NULL DEFAULT '{}',
    "client_sync_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_sms_risk_context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_sms_heca_library" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "heca_type" "PmSmsHecaType" NOT NULL,
    "required_controls_json" JSONB NOT NULL DEFAULT '[]',
    "verification_steps_json" JSONB NOT NULL DEFAULT '[]',
    "training_codes_json" JSONB NOT NULL DEFAULT '[]',
    "energy_types_json" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_sms_heca_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_sms_weekly_risk_forecast" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "week_start" TIMESTAMP(3) NOT NULL,
    "forecast_json" JSONB NOT NULL,
    "alerts_json" JSONB NOT NULL DEFAULT '[]',
    "recommendations_json" JSONB NOT NULL DEFAULT '[]',
    "scl_breakdown_json" JSONB NOT NULL DEFAULT '{}',
    "heca_hotspots_json" JSONB NOT NULL DEFAULT '[]',
    "energy_gaps_json" JSONB NOT NULL DEFAULT '[]',
    "model_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pm_sms_weekly_risk_forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_sms_notification_route" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "event_key" TEXT NOT NULL,
    "channels_json" JSONB NOT NULL DEFAULT '["in_app","email"]',
    "roles_json" JSONB NOT NULL DEFAULT '[]',
    "template_key" TEXT NOT NULL,
    "escalate_on_heca_high_energy" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_sms_notification_route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" INTEGER,
    "status" "AcpTenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_user_roles" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'access',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "acp_role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "acp_subscription_tiers" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "limits_json" JSONB NOT NULL DEFAULT '{}',
    "features_json" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_subscription_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_tenant_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "status" "AcpSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "seats_purchased" INTEGER NOT NULL DEFAULT 10,
    "modules_enabled" JSONB NOT NULL DEFAULT '[]',
    "renewal_date" TIMESTAMP(3),
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_enabled" BOOLEAN NOT NULL DEFAULT false,
    "required_tier_key" TEXT,
    "module" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acp_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acp_tenant_feature_flags" (
    "tenant_id" TEXT NOT NULL,
    "feature_flag_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "acp_tenant_feature_flags_pkey" PRIMARY KEY ("tenant_id","feature_flag_id")
);

-- CreateTable
CREATE TABLE "acp_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acp_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vera_assessment_run" (
    "id" TEXT NOT NULL,
    "engine" "VeraAssessmentEngine" NOT NULL,
    "companyId" INTEGER,
    "projectId" INTEGER,
    "workerId" INTEGER,
    "hiringClientId" INTEGER,
    "overallScore" INTEGER NOT NULL,
    "overallStatus" VARCHAR(64) NOT NULL,
    "resultJson" JSONB NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vera_assessment_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fit_test_run" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "testType" VARCHAR(128),
    "testMethod" VARCHAR(128),
    "result" "FitTestResult" NOT NULL DEFAULT 'CONDITIONAL',
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "evidenceFilesJson" JSONB,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fit_test_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vera_api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "company_id" INTEGER,
    "training_provider_id" INTEGER,
    "scopes" TEXT[] DEFAULT ARRAY['read']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vera_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_wallet_bundles" (
    "id" TEXT NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "bundle_hash" TEXT NOT NULL,
    "qr_payload" TEXT,
    "payload" JSONB NOT NULL,
    "device_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_wallet_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_offline_sync_batches" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "worker_id" INTEGER,
    "company_id" INTEGER,
    "module_type" TEXT NOT NULL,
    "status" "CoreOfflineSyncStatus" NOT NULL DEFAULT 'PENDING',
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "submitted_by_id" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "core_offline_sync_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_offline_sync_conflicts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "module_type" TEXT NOT NULL,
    "record_key" TEXT NOT NULL,
    "local_value" JSONB NOT NULL DEFAULT '{}',
    "server_value" JSONB NOT NULL DEFAULT '{}',
    "resolved_value" JSONB,
    "resolved_by_id" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_offline_sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "natsSubject" TEXT NOT NULL,
    "partitionKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" "EventOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_dead_letter" (
    "id" TEXT NOT NULL,
    "outboxId" TEXT,
    "eventName" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumerGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_dead_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_recommendations" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certificationId" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "windowDays" INTEGER NOT NULL,
    "companyId" INTEGER,
    "status" "RenewalRecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "recommendedVendorId" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_vendor_availability_cache" (
    "id" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "source" "VendorSource" NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_vendor_availability_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_records" (
    "id" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,
    "certType" TEXT NOT NULL,
    "certificationId" TEXT,
    "recommendationId" TEXT,
    "vendorId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorSource" "VendorSource" NOT NULL,
    "deliveryMode" "BookingDeliveryMode" NOT NULL,
    "externalRef" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "location" TEXT,
    "companyId" INTEGER,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_vendor_sync_logs" (
    "id" TEXT NOT NULL,
    "vendorSource" "VendorSource" NOT NULL,
    "certType" TEXT,
    "action" TEXT NOT NULL,
    "status" "VendorSyncStatus" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "renewal_vendor_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_availability_cache" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "certType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatsAvailable" INTEGER NOT NULL,
    "deliveryMode" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "distanceKm" DOUBLE PRECISION,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_availability_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_sync_logs" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_worker_profiles" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "jobBoardProfileId" TEXT,
    "headline" VARCHAR(120),
    "about" TEXT,
    "photoUrl" TEXT,
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "primaryTrade" TEXT,
    "visibility" "HubProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_company_pages" (
    "id" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "tagline" VARCHAR(160),
    "about" TEXT,
    "industry" TEXT,
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "websiteUrl" TEXT,
    "isProviderChannel" BOOLEAN NOT NULL DEFAULT false,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_company_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_company_members" (
    "id" TEXT NOT NULL,
    "companyPageId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "role" "HubCompanyMemberRole" NOT NULL DEFAULT 'EMPLOYEE',
    "title" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_connections" (
    "id" TEXT NOT NULL,
    "requesterUserId" INTEGER NOT NULL,
    "addresseeUserId" INTEGER NOT NULL,
    "status" "HubConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "hub_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" "VeriForgeUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "VeriForgeRoleName" NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainingModules" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainingModules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainingAssignments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "status" "VeriForgeAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "trainingAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationChecks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" "VeriForgeCheckStatus" NOT NULL DEFAULT 'PENDING',
    "result" "VeriForgeCheckResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "verificationChecks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationWorkflows" (
    "id" SERIAL NOT NULL,
    "checkId" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepStatus" "VeriForgeWorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
    "stepOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "verificationWorkflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complianceRequirements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complianceRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditLogs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymized_tokens" (
    "id" TEXT NOT NULL,
    "plane" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "salt_version" TEXT NOT NULL,
    "source_id_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymized_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_projects" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "region_band" TEXT,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_companies" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "region_band" TEXT,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_metrics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "hours_basis" INTEGER NOT NULL DEFAULT 200000,
    "hours_worked" DOUBLE PRECISION,
    "incident_rate_per_200k" DOUBLE PRECISION,
    "recordable_rate_per_200k" DOUBLE PRECISION,
    "lost_time_rate_per_200k" DOUBLE PRECISION,
    "near_miss_rate_per_200k" DOUBLE PRECISION,
    "severity_index" DOUBLE PRECISION,
    "heca_high_energy_rate" DOUBLE PRECISION,
    "heca_controls_verified_rate" DOUBLE PRECISION,
    "heca_distribution" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "hours_basis" INTEGER NOT NULL DEFAULT 200000,
    "hours_worked" DOUBLE PRECISION,
    "incident_rate_per_200k" DOUBLE PRECISION,
    "recordable_rate_per_200k" DOUBLE PRECISION,
    "lost_time_rate_per_200k" DOUBLE PRECISION,
    "near_miss_rate_per_200k" DOUBLE PRECISION,
    "severity_index" DOUBLE PRECISION,
    "heca_high_energy_rate" DOUBLE PRECISION,
    "heca_controls_verified_rate" DOUBLE PRECISION,
    "heca_distribution" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leading_indicators" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "observation_rate" DOUBLE PRECISION,
    "inspection_completion_rate" DOUBLE PRECISION,
    "training_currency_rate" DOUBLE PRECISION,
    "near_miss_reporting_index" DOUBLE PRECISION,
    "controls_verified_rate" DOUBLE PRECISION,
    "leading_composite" DOUBLE PRECISION,
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leading_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visi_corrective_actions" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "on_time_rate" DOUBLE PRECISION,
    "open_avg" DOUBLE PRECISION,
    "overdue_count_avg" DOUBLE PRECISION,
    "aging" JSONB NOT NULL DEFAULT '{}',
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visi_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_profiles" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "token" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "current_rate" DOUBLE PRECISION,
    "expiring_30d_rate" DOUBLE PRECISION,
    "expiring_60d_rate" DOUBLE PRECISION,
    "expiring_90d_rate" DOUBLE PRECISION,
    "role_distribution" JSONB,
    "normalized_at" TIMESTAMP(3) NOT NULL,
    "normalizer_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trend_cache" (
    "id" TEXT NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "report_kind" "VisiTrendReportKind" NOT NULL,
    "horizon" TEXT NOT NULL DEFAULT '',
    "payload" JSONB NOT NULL,
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "entity_count" INTEGER,
    "min_sample" INTEGER NOT NULL DEFAULT 5,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "trend_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selector_state" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entity_type" "VisiDataPlane" NOT NULL,
    "industry" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selector_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_geo_nodes" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "parent_geo_node_id" TEXT,
    "geo_level" "SmsGeoLevel" NOT NULL,
    "geo_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "iso_country" TEXT,
    "admin1_code" TEXT,
    "timezone" TEXT,
    "centroid_lat" DOUBLE PRECISION,
    "centroid_lng" DOUBLE PRECISION,
    "path_ltree" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_geo_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_geo_node_entitlements" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "geo_node_id" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reason_code" "SmsEntitlementReason",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_geo_node_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_project_geo_map" (
    "project_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "site_geo_node_id" TEXT NOT NULL,
    "country_geo_node_id" TEXT,
    "province_geo_node_id" TEXT,

    CONSTRAINT "sms_project_geo_map_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "sms_industry_benchmark_cohorts" (
    "id" TEXT NOT NULL,
    "industry_code" TEXT NOT NULL,
    "region_scope" TEXT NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "metric_key" TEXT NOT NULL,
    "cohort_n" INTEGER NOT NULL,
    "p25" DECIMAL(12,4),
    "p50" DECIMAL(12,4),
    "p75" DECIMAL(12,4),
    "mean" DECIMAL(12,4),
    "suppressed" BOOLEAN NOT NULL DEFAULT false,
    "computed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_industry_benchmark_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_company_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "lt_count" INTEGER NOT NULL DEFAULT 0,
    "recordable_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" DECIMAL(12,4),
    "near_miss_rate_per_200k" DECIMAL(12,4),
    "ltifr" DECIMAL(12,4),
    "trir" DECIMAL(12,4),
    "open_actions_count" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions_count" INTEGER NOT NULL DEFAULT 0,
    "action_effectiveness_pct" DECIMAL(5,2),
    "inspection_completion_pct" DECIMAL(5,2),
    "flha_avg_quality" DECIMAL(5,2),
    "meeting_attendance_pct" DECIMAL(5,2),
    "training_coverage_pct" DECIMAL(5,2),
    "erp_drill_readiness_pct" DECIMAL(5,2),
    "competency_risk_index_avg" DECIMAL(5,2),
    "industry_code" TEXT,
    "benchmark_region_scope" TEXT,
    "industry_benchmark_json" JSONB,
    "kpis_ext_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_company_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_project_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "site_geo_node_id" TEXT,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "open_incident_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" DECIMAL(12,4),
    "severity_json" JSONB,
    "open_actions_count" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions_count" INTEGER NOT NULL DEFAULT 0,
    "inspection_findings_open" INTEGER NOT NULL DEFAULT 0,
    "bbo_quality_avg" DECIMAL(5,2),
    "flha_avg_quality" DECIMAL(5,2),
    "flha_energy_coverage_pct" DECIMAL(5,2),
    "jha_high_residual_count" INTEGER NOT NULL DEFAULT 0,
    "meeting_attendance_pct" DECIMAL(5,2),
    "training_overdue_count" INTEGER NOT NULL DEFAULT 0,
    "erp_quality_avg" DECIMAL(5,2),
    "drill_readiness_pct" DECIMAL(5,2),
    "leading_heatmap_json" JSONB,
    "industry_benchmark_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_project_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_regional_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "geo_node_id" TEXT NOT NULL,
    "geo_level" "SmsGeoLevel" NOT NULL,
    "geo_code" TEXT NOT NULL,
    "parent_geo_node_id" TEXT,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "project_count" INTEGER NOT NULL DEFAULT 0,
    "hours_worked" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" DECIMAL(12,4),
    "open_incidents" INTEGER NOT NULL DEFAULT 0,
    "open_actions" INTEGER NOT NULL DEFAULT 0,
    "overdue_actions" INTEGER NOT NULL DEFAULT 0,
    "competency_risk_index" DECIMAL(5,2),
    "flha_avg_quality" DECIMAL(5,2),
    "drill_readiness_pct" DECIMAL(5,2),
    "parent_incident_rate_per_200k" DECIMAL(12,4),
    "delta_vs_parent_rate" DECIMAL(12,4),
    "hotspot_score" DECIMAL(5,2),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "metrics_json" JSONB,
    "industry_benchmark_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_regional_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_competency_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "role_key" TEXT NOT NULL,
    "competency_key" TEXT NOT NULL,
    "headcount" INTEGER NOT NULL DEFAULT 0,
    "coverage_pct" DECIMAL(5,2),
    "overdue_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_30d_count" INTEGER NOT NULL DEFAULT 0,
    "auth_gap_count" INTEGER NOT NULL DEFAULT 0,
    "risk_index" DECIMAL(5,2),
    "forecast_series_json" JSONB,
    "model_version" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'company',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_competency_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_inspection_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "planned_count" INTEGER NOT NULL DEFAULT 0,
    "completion_pct" DECIMAL(5,2),
    "bbo_count" INTEGER NOT NULL DEFAULT 0,
    "focus_count" INTEGER NOT NULL DEFAULT 0,
    "bbo_quality_avg" DECIMAL(5,2),
    "open_findings" INTEGER NOT NULL DEFAULT 0,
    "closed_findings" INTEGER NOT NULL DEFAULT 0,
    "repeat_findings" INTEGER NOT NULL DEFAULT 0,
    "ai_flagged_findings" INTEGER NOT NULL DEFAULT 0,
    "actions_linked" INTEGER NOT NULL DEFAULT 0,
    "focus_packs_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_inspection_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_incident_metrics" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "period_grain" "SmsPeriodGrain" NOT NULL,
    "hours_worked" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "closed_count" INTEGER NOT NULL DEFAULT 0,
    "near_miss_count" INTEGER NOT NULL DEFAULT 0,
    "incident_rate_per_200k" DECIMAL(12,4),
    "severity_dist_json" JSONB,
    "type_dist_json" JSONB,
    "overdue_investigations" INTEGER NOT NULL DEFAULT 0,
    "sif_count" INTEGER NOT NULL DEFAULT 0,
    "root_cause_facets_json" JSONB,
    "location_facets_json" JSONB,
    "industry_compare_json" JSONB,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "source_job_id" TEXT,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_incident_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_flha_records" (
    "id" TEXT NOT NULL,
    "sor_jha_flha_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT,
    "status" "SmsFlhaStatus" NOT NULL DEFAULT 'draft',
    "work_package" TEXT,
    "location_note" TEXT,
    "jha_record_id" TEXT,
    "energy_sources_json" JSONB,
    "hazards_json" JSONB,
    "controls_json" JSONB,
    "quality_score" DECIMAL(5,2),
    "quality_band" "SmsQualityBand",
    "sign_in_count" INTEGER NOT NULL DEFAULT 0,
    "gate_match_pct" DECIMAL(5,2),
    "ai_flags_json" JSONB,
    "field_os_sync_status" "SmsFieldOsSyncStatus" NOT NULL DEFAULT 'na',
    "work_date" DATE,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_flha_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_jha_records" (
    "id" TEXT NOT NULL,
    "sor_jha_flha_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT,
    "template_key" TEXT,
    "work_type" TEXT,
    "status" "SmsJhaStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "residual_risk_score" DECIMAL(5,2),
    "risk_rank" INTEGER,
    "sif_potential" BOOLEAN NOT NULL DEFAULT false,
    "quality_score" DECIMAL(5,2),
    "quality_band" "SmsQualityBand",
    "erp_record_id" TEXT,
    "hazard_count" INTEGER NOT NULL DEFAULT 0,
    "control_count" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "approved_by_user_id" INTEGER,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_jha_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_erp_records" (
    "id" TEXT NOT NULL,
    "sor_emergency_plan_id" TEXT,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "scenario" "SmsErpScenario" NOT NULL DEFAULT 'general',
    "work_type" TEXT,
    "region_code" TEXT,
    "geo_node_id" TEXT,
    "hazards_json" JSONB,
    "steps_json" JSONB,
    "muster_json" JSONB,
    "ems_provider_ids_json" JSONB,
    "quality_score" DECIMAL(5,2),
    "compliance_score" DECIMAL(5,2),
    "status" "SmsErpStatus" NOT NULL DEFAULT 'draft',
    "drill_readiness_pct" DECIMAL(5,2),
    "simulation_score" DECIMAL(5,2),
    "suggestion_id" TEXT,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_erp_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_erp_drill_sessions" (
    "id" TEXT NOT NULL,
    "erp_record_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "track_everyone" BOOLEAN NOT NULL DEFAULT false,
    "outcome_score" DECIMAL(5,2),
    "failed_gates_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_erp_drill_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_erp_drill_roster" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "person_key" TEXT NOT NULL,
    "display_name_redacted" TEXT NOT NULL,
    "sources_json" JSONB,
    "status" "SmsDrillRosterStatus" NOT NULL DEFAULT 'expected',
    "sign_in_refs_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_erp_drill_roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_corrective_actions" (
    "id" TEXT NOT NULL,
    "sor_action_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kind" "SmsActionKind" NOT NULL DEFAULT 'corrective',
    "status" "SmsActionStatus" NOT NULL DEFAULT 'open',
    "priority" "SmsPriority" NOT NULL DEFAULT 'medium',
    "source_module" "SmsSourceModule" NOT NULL DEFAULT 'manual',
    "source_entity_id" TEXT,
    "root_cause_key" TEXT,
    "title" TEXT NOT NULL,
    "owner_user_id" INTEGER,
    "due_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "days_open" INTEGER NOT NULL DEFAULT 0,
    "effectiveness_pct" DECIMAL(5,2),
    "accepted_suggestion_id" TEXT,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_safety_meetings" (
    "id" TEXT NOT NULL,
    "sor_meeting_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL DEFAULT 'project',
    "visibility_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "meeting_type" "SmsMeetingType" NOT NULL DEFAULT 'toolbox',
    "scheduled_at" TIMESTAMP(3),
    "status" "SmsMeetingStatus" NOT NULL DEFAULT 'scheduled',
    "topics_json" JSONB,
    "ai_flags_json" JSONB,
    "suggestion_id" TEXT,
    "expected_count" INTEGER NOT NULL DEFAULT 0,
    "signed_count" INTEGER NOT NULL DEFAULT 0,
    "attendance_pct" DECIMAL(5,2),
    "drill_linked" BOOLEAN NOT NULL DEFAULT false,
    "location_note" TEXT,
    "created_by_user_id" INTEGER,
    "updated_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "sms_safety_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_ai_insights_cache" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "subcontractor_company_id" INTEGER,
    "access_plane" "SmsAccessPlane" NOT NULL,
    "page_context" TEXT,
    "behavior_id" TEXT NOT NULL,
    "model_tier" "SmsAiModelTier" NOT NULL,
    "model_version" TEXT,
    "input_hash" TEXT NOT NULL,
    "confidence" DECIMAL(4,3) NOT NULL,
    "tone" "SmsAiTone" NOT NULL DEFAULT 'neutral',
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "full_json" JSONB,
    "evidence_json" JSONB,
    "source" "SmsAiSource" NOT NULL DEFAULT 'rules',
    "status" "SmsAiStatus" NOT NULL DEFAULT 'active',
    "accepted_by_user_id" INTEGER,
    "accepted_at" TIMESTAMP(3),
    "created_entity_type" TEXT,
    "created_entity_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "latency_ms" INTEGER,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_ai_insights_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_record_links" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "from_type" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_type" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "link_role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_record_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_audit_log" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "actor_user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "plane" "SmsAccessPlane",
    "request_id" TEXT,
    "before_hash" TEXT,
    "after_hash" TEXT,
    "payload_json" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_ai_suggestion_audit" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "suggestion_id" TEXT NOT NULL,
    "behavior_id" TEXT NOT NULL,
    "actor_user_id" INTEGER,
    "decision" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "reason" TEXT,
    "payload_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_ai_suggestion_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_cail_inference_logs" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "behavior_id" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "model_tier" "SmsAiModelTier" NOT NULL,
    "model_version" TEXT,
    "score" DECIMAL(5,2),
    "factors_json" JSONB,
    "input_hash" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_cail_inference_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_metrics_outbox" (
    "id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "project_id" INTEGER,
    "event_type" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_metrics_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseInstructors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_email_key" ON "Worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_qrToken_key" ON "Worker"("qrToken");

-- CreateIndex
CREATE INDEX "idx_worker_company" ON "Worker"("companyId");

-- CreateIndex
CREATE INDEX "idx_worker_name" ON "Worker"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "idx_worker_phone" ON "Worker"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "company_analytics_company_id_key" ON "company_analytics"("company_id");

-- CreateIndex
CREATE INDEX "analytics_events_company_id_created_at_idx" ON "analytics_events"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "company_usage_daily_date_idx" ON "company_usage_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "company_usage_daily_company_id_date_key" ON "company_usage_daily"("company_id", "date");

-- CreateIndex
CREATE INDEX "feedback_requests_status_upvotes_idx" ON "feedback_requests"("status", "upvotes");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_votes_feedback_id_user_id_key" ON "feedback_votes"("feedback_id", "user_id");

-- CreateIndex
CREATE INDEX "TrainingIngestionRun_companyId_createdAt_idx" ON "TrainingIngestionRun"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingIngestionRun_companyId_status_createdAt_idx" ON "TrainingIngestionRun"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingIngestionRun_sourceChannel_createdAt_idx" ON "TrainingIngestionRun"("sourceChannel", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRequirement_companyId_courseName_key" ON "TrainingRequirement"("companyId", "courseName");

-- CreateIndex
CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_companyId_status_idx" ON "CoreComplianceNote"("companyId", "status");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_siteId_status_idx" ON "CoreComplianceNote"("siteId", "status");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_category_idx" ON "CoreComplianceNote"("category");

-- CreateIndex
CREATE INDEX "CoreComplianceNote_dueAt_idx" ON "CoreComplianceNote"("dueAt");

-- CreateIndex
CREATE INDEX "CoreDailyLog_companyId_logDate_idx" ON "CoreDailyLog"("companyId", "logDate");

-- CreateIndex
CREATE INDEX "CoreDailyLog_siteId_logDate_idx" ON "CoreDailyLog"("siteId", "logDate");

-- CreateIndex
CREATE INDEX "CoreDailyLog_shift_idx" ON "CoreDailyLog"("shift");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_companyId_status_idx" ON "CoreSiteRisk"("companyId", "status");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_siteId_identifiedAt_idx" ON "CoreSiteRisk"("siteId", "identifiedAt");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_category_idx" ON "CoreSiteRisk"("category");

-- CreateIndex
CREATE INDEX "CoreSiteRisk_severity_idx" ON "CoreSiteRisk"("severity");

-- CreateIndex
CREATE INDEX "SafetyObservation_companyId_observedAt_idx" ON "SafetyObservation"("companyId", "observedAt");

-- CreateIndex
CREATE INDEX "SafetyObservation_siteId_observedAt_idx" ON "SafetyObservation"("siteId", "observedAt");

-- CreateIndex
CREATE INDEX "SafetyObservation_status_idx" ON "SafetyObservation"("status");

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_companyId_heldAt_idx" ON "CoreMeetingRecord"("companyId", "heldAt");

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_siteId_heldAt_idx" ON "CoreMeetingRecord"("siteId", "heldAt");

-- CreateIndex
CREATE INDEX "CoreMeetingRecord_meetingType_idx" ON "CoreMeetingRecord"("meetingType");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_companyId_status_idx" ON "PmSafetyWorkflow"("companyId", "status");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_siteId_status_idx" ON "PmSafetyWorkflow"("siteId", "status");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_status_updatedAt_idx" ON "PmSafetyWorkflow"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_companyId_status_updatedAt_idx" ON "PmSafetyWorkflow"("companyId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflow_siteId_status_updatedAt_idx" ON "PmSafetyWorkflow"("siteId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "PmSafetyWorkflowEvent_workflowId_createdAt_idx" ON "PmSafetyWorkflowEvent"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_pm_workflow_event_type_created" ON "PmSafetyWorkflowEvent"("workflowId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "SiteContact_siteId_idx" ON "SiteContact"("siteId");

-- CreateIndex
CREATE INDEX "ToolboxTalk_siteId_conductedAt_idx" ON "ToolboxTalk"("siteId", "conductedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyStation_code_key" ON "SafetyStation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyStation_hardwareId_key" ON "SafetyStation"("hardwareId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyStation_clientSyncId_key" ON "SafetyStation"("clientSyncId");

-- CreateIndex
CREATE INDEX "SafetyStation_siteId_active_idx" ON "SafetyStation"("siteId", "active");

-- CreateIndex
CREATE INDEX "SafetyStation_companyId_projectId_idx" ON "SafetyStation"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "SafetyStation_stationType_status_idx" ON "SafetyStation"("stationType", "status");

-- CreateIndex
CREATE INDEX "SafetyStation_deletedAt_idx" ON "SafetyStation"("deletedAt");

-- CreateIndex
CREATE INDEX "EquipmentCategory_companyId_idx" ON "EquipmentCategory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentCategory_companyId_name_key" ON "EquipmentCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "EquipmentType_catalogTypeKey_idx" ON "EquipmentType"("catalogTypeKey");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentType_categoryId_name_key" ON "EquipmentType"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_qrToken_key" ON "Equipment"("qrToken");

-- CreateIndex
CREATE INDEX "idx_equipment_company" ON "Equipment"("companyId");

-- CreateIndex
CREATE INDEX "Equipment_operationalStatus_idx" ON "Equipment"("operationalStatus");

-- CreateIndex
CREATE INDEX "Equipment_deletedAt_idx" ON "Equipment"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_equipment_category" ON "Equipment"("categoryId");

-- CreateIndex
CREATE INDEX "idx_equipment_type" ON "Equipment"("typeId");

-- CreateIndex
CREATE INDEX "Equipment_catalogTypeKey_idx" ON "Equipment"("catalogTypeKey");

-- CreateIndex
CREATE INDEX "idx_equipment_serial" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "idx_equipment_asset_tag" ON "Equipment"("assetTag");

-- CreateIndex
CREATE INDEX "Equipment_complianceStatus_idx" ON "Equipment"("complianceStatus");

-- CreateIndex
CREATE INDEX "Equipment_nextInspectionAt_idx" ON "Equipment"("nextInspectionAt");

-- CreateIndex
CREATE INDEX "Equipment_lockoutStatus_idx" ON "Equipment"("lockoutStatus");

-- CreateIndex
CREATE INDEX "EquipmentAttachment_equipmentId_createdAt_idx" ON "EquipmentAttachment"("equipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "EquipmentMaintenance_equipmentId_performedAt_idx" ON "EquipmentMaintenance"("equipmentId", "performedAt");

-- CreateIndex
CREATE INDEX "EquipmentCalibration_equipmentId_calibratedAt_idx" ON "EquipmentCalibration"("equipmentId", "calibratedAt");

-- CreateIndex
CREATE INDEX "EquipmentCalibration_equipmentId_expiresAt_idx" ON "EquipmentCalibration"("equipmentId", "expiresAt");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_equipmentId_active_idx" ON "MaintenanceSchedule"("equipmentId", "active");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_nextDueAt_idx" ON "MaintenanceSchedule"("nextDueAt");

-- CreateIndex
CREATE INDEX "CalibrationSchedule_equipmentId_active_idx" ON "CalibrationSchedule"("equipmentId", "active");

-- CreateIndex
CREATE INDEX "CalibrationSchedule_nextDueAt_idx" ON "CalibrationSchedule"("nextDueAt");

-- CreateIndex
CREATE INDEX "EquipmentLockout_equipmentId_lockedAt_idx" ON "EquipmentLockout"("equipmentId", "lockedAt");

-- CreateIndex
CREATE INDEX "EquipmentLockout_companyId_lockedAt_idx" ON "EquipmentLockout"("companyId", "lockedAt");

-- CreateIndex
CREATE INDEX "EquipmentComplianceStatus_equipmentId_assessedAt_idx" ON "EquipmentComplianceStatus"("equipmentId", "assessedAt");

-- CreateIndex
CREATE INDEX "EquipmentComplianceStatus_companyId_status_idx" ON "EquipmentComplianceStatus"("companyId", "status");

-- CreateIndex
CREATE INDEX "Incident_companyId_status_createdAt_idx" ON "Incident"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Incident_siteId_status_createdAt_idx" ON "Incident"("siteId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Incident_workerId_createdAt_idx" ON "Incident"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "Incident_equipmentId_createdAt_idx" ON "Incident"("equipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_incident_comment_incident_created" ON "IncidentComment"("incidentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRecord_certificateQrToken_key" ON "TrainingRecord"("certificateQrToken");

-- CreateIndex
CREATE INDEX "TrainingRecord_workerId_expiresAt_idx" ON "TrainingRecord"("workerId", "expiresAt");

-- CreateIndex
CREATE INDEX "TrainingRecord_certificationId_idx" ON "TrainingRecord"("certificationId");

-- CreateIndex
CREATE INDEX "TrainingRecord_providerId_idx" ON "TrainingRecord"("providerId");

-- CreateIndex
CREATE INDEX "TrainingRecord_trainingProviderId_idx" ON "TrainingRecord"("trainingProviderId");

-- CreateIndex
CREATE INDEX "TrainingRecord_courseId_idx" ON "TrainingRecord"("courseId");

-- CreateIndex
CREATE INDEX "TrainingRecord_companyId_idx" ON "TrainingRecord"("companyId");

-- CreateIndex
CREATE INDEX "TrainingRecord_projectId_idx" ON "TrainingRecord"("projectId");

-- CreateIndex
CREATE INDEX "TrainingRecord_ingestionRunId_idx" ON "TrainingRecord"("ingestionRunId");

-- CreateIndex
CREATE INDEX "TrainingRecord_certificateQrToken_idx" ON "TrainingRecord"("certificateQrToken");

-- CreateIndex
CREATE INDEX "TrainingRecord_lastVerificationStatus_idx" ON "TrainingRecord"("lastVerificationStatus");

-- CreateIndex
CREATE INDEX "TrainingVerificationRun_trainingRecordId_createdAt_idx" ON "TrainingVerificationRun"("trainingRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_credentialId_occurredAt_idx" ON "credential_ledger_events"("credentialId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_workerId_occurredAt_idx" ON "credential_ledger_events"("workerId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_providerId_occurredAt_idx" ON "credential_ledger_events"("providerId", "occurredAt");

-- CreateIndex
CREATE INDEX "credential_ledger_events_companyId_occurredAt_idx" ON "credential_ledger_events"("companyId", "occurredAt");

-- CreateIndex
CREATE INDEX "idx_training_attestation_record_created" ON "TrainingAttestation"("trainingRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingAttestation_attestedByWorkerId_idx" ON "TrainingAttestation"("attestedByWorkerId");

-- CreateIndex
CREATE INDEX "TrainingAttestation_createdAt_idx" ON "TrainingAttestation"("createdAt");

-- CreateIndex
CREATE INDEX "idx_project_compliance_rule_project_active" ON "project_compliance_rules"("projectId", "active");

-- CreateIndex
CREATE INDEX "idx_project_compliance_alert_project_resolved" ON "project_compliance_alerts"("projectId", "resolvedAt");

-- CreateIndex
CREATE INDEX "idx_project_compliance_alert_worker_resolved" ON "project_compliance_alerts"("workerId", "resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_code_key" ON "TrainingProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_email_key" ON "TrainingProvider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProvider_qrToken_key" ON "TrainingProvider"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSyncConfig_providerId_key" ON "ProviderSyncConfig"("providerId");

-- CreateIndex
CREATE INDEX "ProviderSyncRun_providerId_startedAt_idx" ON "ProviderSyncRun"("providerId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingInstructor_userId_key" ON "TrainingInstructor"("userId");

-- CreateIndex
CREATE INDEX "TrainingInstructor_providerId_active_idx" ON "TrainingInstructor"("providerId", "active");

-- CreateIndex
CREATE INDEX "TrainingCourse_providerId_active_idx" ON "TrainingCourse"("providerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCourse_providerId_code_key" ON "TrainingCourse"("providerId", "code");

-- CreateIndex
CREATE INDEX "TrainingCourseStandard_courseId_idx" ON "TrainingCourseStandard"("courseId");

-- CreateIndex
CREATE INDEX "ProviderApproval_providerId_createdAt_idx" ON "ProviderApproval"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderComplianceStatus_providerId_assessedAt_idx" ON "ProviderComplianceStatus"("providerId", "assessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingStandard_code_key" ON "TrainingStandard"("code");

-- CreateIndex
CREATE INDEX "TrainingStandard_kind_active_idx" ON "TrainingStandard"("kind", "active");

-- CreateIndex
CREATE INDEX "TrainingStandard_jurisdictionCode_idx" ON "TrainingStandard"("jurisdictionCode");

-- CreateIndex
CREATE INDEX "JurisdictionRequirement_jurisdictionCode_required_idx" ON "JurisdictionRequirement"("jurisdictionCode", "required");

-- CreateIndex
CREATE UNIQUE INDEX "JurisdictionRequirement_jurisdictionCode_standardCode_trade_key" ON "JurisdictionRequirement"("jurisdictionCode", "standardCode", "tradeCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderQualificationRule_trainingProviderId_ruleKey_key" ON "ProviderQualificationRule"("trainingProviderId", "ruleKey");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorQualificationRule_trainingProviderId_ruleKey_key" ON "InstructorQualificationRule"("trainingProviderId", "ruleKey");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRejectionReason_code_key" ON "TrainingRejectionReason"("code");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_subjectType_outcome_validatedAt_idx" ON "TrainingValidationResult"("subjectType", "outcome", "validatedAt");

-- CreateIndex
CREATE INDEX "idx_training_validation_outcome_validated" ON "TrainingValidationResult"("outcome", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_trainingRecordId_validatedAt_idx" ON "TrainingValidationResult"("trainingRecordId", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_trainingProviderId_validatedAt_idx" ON "TrainingValidationResult"("trainingProviderId", "validatedAt");

-- CreateIndex
CREATE INDEX "TrainingValidationResult_certificateQrToken_idx" ON "TrainingValidationResult"("certificateQrToken");

-- CreateIndex
CREATE INDEX "regulatory_equivalency_from_std_idx" ON "regulatory_equivalencies"("from_jurisdiction", "standard_code");

-- CreateIndex
CREATE INDEX "regulatory_equivalency_to_std_idx" ON "regulatory_equivalencies"("to_jurisdiction", "standard_code");

-- CreateIndex
CREATE UNIQUE INDEX "regulatory_equivalency_unique" ON "regulatory_equivalencies"("from_jurisdiction", "to_jurisdiction", "standard_code");

-- CreateIndex
CREATE INDEX "regulatory_decision_record_created_idx" ON "regulatory_verification_decisions"("training_record_id", "created_at");

-- CreateIndex
CREATE INDEX "regulatory_decision_status_idx" ON "regulatory_verification_decisions"("regulatory_compliance_status");

-- CreateIndex
CREATE UNIQUE INDEX "training_credential_nfts_training_record_id_key" ON "training_credential_nfts"("training_record_id");

-- CreateIndex
CREATE INDEX "training_credential_nft_worker_idx" ON "training_credential_nfts"("worker_id");

-- CreateIndex
CREATE INDEX "training_credential_nft_mint_status_idx" ON "training_credential_nfts"("mint_status");

-- CreateIndex
CREATE UNIQUE INDEX "nft_mint_jobs_idempotency_key_key" ON "nft_mint_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "nft_mint_job_status_created_idx" ON "nft_mint_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_credential_worker" ON "Credential"("workerId");

-- CreateIndex
CREATE INDEX "idx_worker_assignment_worker_ended" ON "WorkerAssignment"("workerId", "endedAt");

-- CreateIndex
CREATE INDEX "idx_worker_assignment_equipment_ended" ON "WorkerAssignment"("equipmentId", "endedAt");

-- CreateIndex
CREATE INDEX "idx_worker_assignment_site_ended" ON "WorkerAssignment"("siteId", "endedAt");

-- CreateIndex
CREATE INDEX "idx_worker_assignment_company" ON "WorkerAssignment"("companyId");

-- CreateIndex
CREATE INDEX "idx_equipment_assignment_equipment_ended" ON "EquipmentAssignment"("equipmentId", "endedAt");

-- CreateIndex
CREATE INDEX "idx_equipment_assignment_worker_ended" ON "EquipmentAssignment"("workerId", "endedAt");

-- CreateIndex
CREATE INDEX "idx_equipment_assignment_company" ON "EquipmentAssignment"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentTrainingRequirement_equipmentId_certificationId_key" ON "EquipmentTrainingRequirement"("equipmentId", "certificationId");

-- CreateIndex
CREATE INDEX "idx_digital_signoff_site_created" ON "DigitalSignoff"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_digital_signoff_worker_created" ON "DigitalSignoff"("workerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionChecklist_seed_key_key" ON "InspectionChecklist"("seed_key");

-- CreateIndex
CREATE INDEX "InspectionChecklist_inspectionType_active_idx" ON "InspectionChecklist"("inspectionType", "active");

-- CreateIndex
CREATE INDEX "InspectionChecklist_category_active_idx" ON "InspectionChecklist"("category", "active");

-- CreateIndex
CREATE INDEX "idx_inspection_site_status" ON "Inspection"("siteId", "status");

-- CreateIndex
CREATE INDEX "idx_inspection_equipment" ON "Inspection"("equipmentId");

-- CreateIndex
CREATE INDEX "idx_inspection_worker" ON "Inspection"("workerId");

-- CreateIndex
CREATE INDEX "Inspection_equipmentId_kind_createdAt_idx" ON "Inspection"("equipmentId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "Inspection_equipmentId_inspectionType_completedAt_idx" ON "Inspection"("equipmentId", "inspectionType", "completedAt");

-- CreateIndex
CREATE INDEX "Inspection_nextInspectionDate_idx" ON "Inspection"("nextInspectionDate");

-- CreateIndex
CREATE INDEX "Inspection_passed_lockoutTriggered_idx" ON "Inspection"("passed", "lockoutTriggered");

-- CreateIndex
CREATE INDEX "InspectionTemplate_catalogCategory_kind_idx" ON "InspectionTemplate"("catalogCategory", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplate_catalogTypeKey_kind_key" ON "InspectionTemplate"("catalogTypeKey", "kind");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_workerId_equipmentId_evaluationDate_idx" ON "CompetencyEvaluation"("workerId", "equipmentId", "evaluationDate");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_equipmentId_evaluationDate_idx" ON "CompetencyEvaluation"("equipmentId", "evaluationDate");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_workerId_expiresAt_idx" ON "CompetencyEvaluation"("workerId", "expiresAt");

-- CreateIndex
CREATE INDEX "CompetencyEvaluation_expiresAt_idx" ON "CompetencyEvaluation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentCompetencyRequirement_equipmentId_key" ON "EquipmentCompetencyRequirement"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentTypeCompetencyRequirement_equipmentTypeId_key" ON "EquipmentTypeCompetencyRequirement"("equipmentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerWalletItem_trainingRecordId_key" ON "WorkerWalletItem"("trainingRecordId");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_workerId_status_idx" ON "WorkerWalletItem"("workerId", "status");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_companyId_catalogTypeKey_idx" ON "WorkerWalletItem"("companyId", "catalogTypeKey");

-- CreateIndex
CREATE INDEX "WorkerWalletItem_trainingRecordId_idx" ON "WorkerWalletItem"("trainingRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyEquipmentAuditView_companyId_equipmentId_key" ON "CompanyEquipmentAuditView"("companyId", "equipmentId");

-- CreateIndex
CREATE INDEX "idx_investigation_incident" ON "Investigation"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "CoreFile_objectKey_key" ON "CoreFile"("objectKey");

-- CreateIndex
CREATE INDEX "CoreFile_createdAt_idx" ON "CoreFile"("createdAt");

-- CreateIndex
CREATE INDEX "CoreFile_userId_idx" ON "CoreFile"("userId");

-- CreateIndex
CREATE INDEX "CoreFile_status_idx" ON "CoreFile"("status");

-- CreateIndex
CREATE INDEX "idx_core_file_status_created" ON "CoreFile"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_core_file_user_created" ON "CoreFile"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_workerId_createdAt_idx" ON "Document"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_equipmentId_createdAt_idx" ON "Document"("equipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_companyId_createdAt_idx" ON "Document"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_type_deleted_createdAt_idx" ON "Document"("type", "deleted", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_roomId_userId_key" ON "ChatMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "idx_chat_message_room_created" ON "ChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_slug_key" ON "ChatChannel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_roomId_key" ON "ChatChannel"("roomId");

-- CreateIndex
CREATE INDEX "idx_notification_user_created" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_notification_user_read" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_dedupe_key" ON "Notification"("dedupeKey");

-- CreateIndex
CREATE INDEX "idx_audit_log_user_created" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant_created" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_audit_log_entity" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "CoreActionItem_companyId_idx" ON "CoreActionItem"("companyId");

-- CreateIndex
CREATE INDEX "CoreActionItem_status_idx" ON "CoreActionItem"("status");

-- CreateIndex
CREATE INDEX "CoreActionItem_dueAt_idx" ON "CoreActionItem"("dueAt");

-- CreateIndex
CREATE INDEX "CoreActionItem_createdById_idx" ON "CoreActionItem"("createdById");

-- CreateIndex
CREATE INDEX "CoreActionItem_createdAt_idx" ON "CoreActionItem"("createdAt");

-- CreateIndex
CREATE INDEX "CoreActionItem_coreMeetingRecordId_idx" ON "CoreActionItem"("coreMeetingRecordId");

-- CreateIndex
CREATE INDEX "CoreActionItem_coreDailyLogId_idx" ON "CoreActionItem"("coreDailyLogId");

-- CreateIndex
CREATE INDEX "idx_core_action_item_company_status_due" ON "CoreActionItem"("companyId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "idx_company_link_company_active" ON "CompanyLink"("companyId", "active");

-- CreateIndex
CREATE INDEX "idx_company_link_worker_active" ON "CompanyLink"("workerId", "active");

-- CreateIndex
CREATE INDEX "idx_company_link_worker_company" ON "CompanyLink"("workerId", "companyId");

-- CreateIndex
CREATE INDEX "idx_equipment_link_company_active" ON "EquipmentLink"("companyId", "active");

-- CreateIndex
CREATE INDEX "idx_equipment_link_equipment_active" ON "EquipmentLink"("equipmentId", "active");

-- CreateIndex
CREATE INDEX "idx_project_company_status" ON "Project"("companyId", "status");

-- CreateIndex
CREATE INDEX "idx_project_site" ON "Project"("siteId");

-- CreateIndex
CREATE INDEX "idx_project_assignment_project_status" ON "ProjectAssignment"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_project_assignment_project_status_ended" ON "ProjectAssignment"("projectId", "status", "endedAt");

-- CreateIndex
CREATE INDEX "idx_project_assignment_worker_status" ON "ProjectAssignment"("workerId", "status");

-- CreateIndex
CREATE INDEX "idx_project_assignment_company" ON "ProjectAssignment"("companyId");

-- CreateIndex
CREATE INDEX "idx_equipment_project_assignment_project_status" ON "EquipmentProjectAssignment"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_equipment_project_assignment_equipment_status" ON "EquipmentProjectAssignment"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "idx_union_membership_worker_status" ON "UnionMembership"("workerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "union_membership_hall_worker" ON "UnionMembership"("unionHallId", "workerId");

-- CreateIndex
CREATE INDEX "idx_union_dispatch_hall_date" ON "UnionDispatch"("unionHallId", "dispatchedAt");

-- CreateIndex
CREATE INDEX "idx_union_dispatch_worker" ON "UnionDispatch"("workerId");

-- CreateIndex
CREATE INDEX "UnionHallProviderLink_unionHallId_active_idx" ON "UnionHallProviderLink"("unionHallId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "union_hall_provider_unique" ON "UnionHallProviderLink"("unionHallId", "trainingProviderId");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_status_idx" ON "UnionHallTrainingReceipt"("unionHallId", "status");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_unionHallId_createdAt_idx" ON "UnionHallTrainingReceipt"("unionHallId", "createdAt");

-- CreateIndex
CREATE INDEX "UnionHallTrainingReceipt_trainingRecordId_idx" ON "UnionHallTrainingReceipt"("trainingRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "union_hall_training_receipt_unique" ON "UnionHallTrainingReceipt"("unionHallId", "trainingRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_qrToken_key" ON "Tool"("qrToken");

-- CreateIndex
CREATE INDEX "Tool_companyId_status_idx" ON "Tool"("companyId", "status");

-- CreateIndex
CREATE INDEX "Tool_nextInspectionAt_idx" ON "Tool"("nextInspectionAt");

-- CreateIndex
CREATE INDEX "PPE_companyId_status_idx" ON "PPE"("companyId", "status");

-- CreateIndex
CREATE INDEX "PPE_expiresAt_idx" ON "PPE"("expiresAt");

-- CreateIndex
CREATE INDEX "PPE_ppeType_idx" ON "PPE"("ppeType");

-- CreateIndex
CREATE INDEX "ToolInspection_toolId_completedAt_idx" ON "ToolInspection"("toolId", "completedAt");

-- CreateIndex
CREATE INDEX "PPEInspection_ppeId_completedAt_idx" ON "PPEInspection"("ppeId", "completedAt");

-- CreateIndex
CREATE INDEX "ToolAssignment_toolId_status_idx" ON "ToolAssignment"("toolId", "status");

-- CreateIndex
CREATE INDEX "ToolAssignment_workerId_status_idx" ON "ToolAssignment"("workerId", "status");

-- CreateIndex
CREATE INDEX "ToolAssignment_projectId_status_idx" ON "ToolAssignment"("projectId", "status");

-- CreateIndex
CREATE INDEX "PPEAssignment_ppeId_status_idx" ON "PPEAssignment"("ppeId", "status");

-- CreateIndex
CREATE INDEX "PPEAssignment_workerId_status_idx" ON "PPEAssignment"("workerId", "status");

-- CreateIndex
CREATE INDEX "PPEAssignment_projectId_status_idx" ON "PPEAssignment"("projectId", "status");

-- CreateIndex
CREATE INDEX "FeedItem_publishedAt_idx" ON "FeedItem"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_companyId_publishedAt_idx" ON "FeedItem"("companyId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_unionHallId_publishedAt_idx" ON "FeedItem"("unionHallId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_source_publishedAt_idx" ON "FeedItem"("source", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_projectId_publishedAt_idx" ON "FeedItem"("projectId", "publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_source_externalId_key" ON "FeedItem"("source", "externalId");

-- CreateIndex
CREATE INDEX "FeedInteraction_feedItemId_type_idx" ON "FeedInteraction"("feedItemId", "type");

-- CreateIndex
CREATE INDEX "FeedInteraction_userId_createdAt_idx" ON "FeedInteraction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FeedInteraction_parentId_idx" ON "FeedInteraction"("parentId");

-- CreateIndex
CREATE INDEX "SocialUserFollow_followingId_idx" ON "SocialUserFollow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialUserFollow_followerId_followingId_key" ON "SocialUserFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "SocialActivityLog_actorUserId_createdAt_idx" ON "SocialActivityLog"("actorUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SocialActivityLog_targetType_targetId_idx" ON "SocialActivityLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "SocialActivityLog_feedItemId_idx" ON "SocialActivityLog"("feedItemId");

-- CreateIndex
CREATE INDEX "FeedSubscription_userId_idx" ON "FeedSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedSubscription_userId_targetType_targetKey_key" ON "FeedSubscription"("userId", "targetType", "targetKey");

-- CreateIndex
CREATE INDEX "posts_publishedAt_idx" ON "posts"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_authorUserId_publishedAt_idx" ON "posts"("authorUserId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_companyId_publishedAt_idx" ON "posts"("companyId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_trainingProviderId_publishedAt_idx" ON "posts"("trainingProviderId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_postType_publishedAt_idx" ON "posts"("postType", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "post_likes_postId_idx" ON "post_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comments_parentId_idx" ON "post_comments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "pinned_posts_postId_key" ON "pinned_posts"("postId");

-- CreateIndex
CREATE INDEX "pinned_posts_scope_scopeKey_idx" ON "pinned_posts"("scope", "scopeKey");

-- CreateIndex
CREATE INDEX "follow_relationships_targetType_targetId_idx" ON "follow_relationships"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "follow_relationships_followerUserId_targetType_targetId_key" ON "follow_relationships"("followerUserId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_trainingProviderId_key" ON "provider_profiles"("trainingProviderId");

-- CreateIndex
CREATE INDEX "sponsored_ads_active_startsAt_idx" ON "sponsored_ads"("active", "startsAt");

-- CreateIndex
CREATE INDEX "media_attachments_postId_idx" ON "media_attachments"("postId");

-- CreateIndex
CREATE INDEX "moderation_flags_postId_status_idx" ON "moderation_flags"("postId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "trending_metrics_postId_key" ON "trending_metrics"("postId");

-- CreateIndex
CREATE INDEX "trending_metrics_score_idx" ON "trending_metrics"("score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "saved_posts_postId_userId_key" ON "saved_posts"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingTopic_slug_key" ON "TrendingTopic"("slug");

-- CreateIndex
CREATE INDEX "TrendingTopic_active_rankScore_idx" ON "TrendingTopic"("active", "rankScore" DESC);

-- CreateIndex
CREATE INDEX "WeatherAlert_region_startsAt_idx" ON "WeatherAlert"("region", "startsAt" DESC);

-- CreateIndex
CREATE INDEX "WeatherAlert_companyId_severity_idx" ON "WeatherAlert"("companyId", "severity");

-- CreateIndex
CREATE INDEX "weather_alerts_zoneId_effectiveAt_idx" ON "weather_alerts"("zoneId", "effectiveAt" DESC);

-- CreateIndex
CREATE INDEX "weather_alerts_expiresAt_idx" ON "weather_alerts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "weather_alerts_alertId_zoneId_key" ON "weather_alerts"("alertId", "zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "weather_zone_map_zoneId_key" ON "weather_zone_map"("zoneId");

-- CreateIndex
CREATE INDEX "user_location_history_userId_updatedAt_idx" ON "user_location_history"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "weather_alert_deliveries_alertId_idx" ON "weather_alert_deliveries"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "weather_alert_deliveries_userId_alertId_key" ON "weather_alert_deliveries"("userId", "alertId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHomepagePreferences_userId_key" ON "UserHomepagePreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPost_slug_key" ON "JobPost"("slug");

-- CreateIndex
CREATE INDEX "JobPost_active_publishedAt_idx" ON "JobPost"("active", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "JobPost_companyId_active_idx" ON "JobPost"("companyId", "active");

-- CreateIndex
CREATE INDEX "JobPost_trade_active_idx" ON "JobPost"("trade", "active");

-- CreateIndex
CREATE INDEX "JobPost_locationRegion_active_idx" ON "JobPost"("locationRegion", "active");

-- CreateIndex
CREATE INDEX "JobPost_payMin_payMax_idx" ON "JobPost"("payMin", "payMax");

-- CreateIndex
CREATE INDEX "JobPost_experienceLevel_idx" ON "JobPost"("experienceLevel");

-- CreateIndex
CREATE UNIQUE INDEX "JobBoardWorkerProfile_workerId_key" ON "JobBoardWorkerProfile"("workerId");

-- CreateIndex
CREATE INDEX "JobBoardWorkerProfile_primaryTrade_openToWork_idx" ON "JobBoardWorkerProfile"("primaryTrade", "openToWork");

-- CreateIndex
CREATE INDEX "JobBoardWorkerProfile_locationRegion_idx" ON "JobBoardWorkerProfile"("locationRegion");

-- CreateIndex
CREATE INDEX "JobBoardPortfolioPhoto_profileId_sortOrder_idx" ON "JobBoardPortfolioPhoto"("profileId", "sortOrder");

-- CreateIndex
CREATE INDEX "JobBoardWorkHistory_profileId_idx" ON "JobBoardWorkHistory"("profileId");

-- CreateIndex
CREATE INDEX "JobBoardWorkerEndorsement_profileId_idx" ON "JobBoardWorkerEndorsement"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "JobBoardWorkerEndorsement_profileId_endorserUserId_skill_key" ON "JobBoardWorkerEndorsement"("profileId", "endorserUserId", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "JobBoardApplication_chatRoomId_key" ON "JobBoardApplication"("chatRoomId");

-- CreateIndex
CREATE INDEX "JobBoardApplication_jobId_status_idx" ON "JobBoardApplication"("jobId", "status");

-- CreateIndex
CREATE INDEX "JobBoardApplication_workerId_status_idx" ON "JobBoardApplication"("workerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobBoardApplication_jobId_workerId_key" ON "JobBoardApplication"("jobId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyBlogCategory_slug_key" ON "SafetyBlogCategory"("slug");

-- CreateIndex
CREATE INDEX "SafetyBlogCategory_sortOrder_idx" ON "SafetyBlogCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyBlogTag_slug_key" ON "SafetyBlogTag"("slug");

-- CreateIndex
CREATE INDEX "SafetyBlogPostTag_tagId_idx" ON "SafetyBlogPostTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyArticle_slug_key" ON "SafetyArticle"("slug");

-- CreateIndex
CREATE INDEX "SafetyArticle_active_publishedAt_idx" ON "SafetyArticle"("active", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "SafetyArticle_status_publishedAt_idx" ON "SafetyArticle"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "SafetyArticle_featured_publishedAt_idx" ON "SafetyArticle"("featured", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "SafetyArticle_categoryId_publishedAt_idx" ON "SafetyArticle"("categoryId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "SafetyArticle_safetyLevel_idx" ON "SafetyArticle"("safetyLevel");

-- CreateIndex
CREATE INDEX "SafetyBlogComment_postId_status_createdAt_idx" ON "SafetyBlogComment"("postId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyBlogComment_parentId_idx" ON "SafetyBlogComment"("parentId");

-- CreateIndex
CREATE INDEX "SafetyBlogCommentVote_commentId_idx" ON "SafetyBlogCommentVote"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyBlogCommentVote_commentId_voterKey_key" ON "SafetyBlogCommentVote"("commentId", "voterKey");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");

-- CreateIndex
CREATE INDEX "ExpertProfile_reputationScore_idx" ON "ExpertProfile"("reputationScore" DESC);

-- CreateIndex
CREATE INDEX "ExpertProfile_badgeLevel_idx" ON "ExpertProfile"("badgeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertQaTag_slug_key" ON "ExpertQaTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertQaQuestion_slug_key" ON "ExpertQaQuestion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertQaQuestion_acceptedAnswerId_key" ON "ExpertQaQuestion"("acceptedAnswerId");

-- CreateIndex
CREATE INDEX "ExpertQaQuestion_status_createdAt_idx" ON "ExpertQaQuestion"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ExpertQaQuestion_moderationStatus_createdAt_idx" ON "ExpertQaQuestion"("moderationStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ExpertQaQuestion_companyId_createdAt_idx" ON "ExpertQaQuestion"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ExpertQaQuestion_trade_idx" ON "ExpertQaQuestion"("trade");

-- CreateIndex
CREATE INDEX "ExpertQaQuestion_voteScore_idx" ON "ExpertQaQuestion"("voteScore" DESC);

-- CreateIndex
CREATE INDEX "ExpertQaAttachment_questionId_idx" ON "ExpertQaAttachment"("questionId");

-- CreateIndex
CREATE INDEX "ExpertQaAnswer_questionId_voteScore_idx" ON "ExpertQaAnswer"("questionId", "voteScore" DESC);

-- CreateIndex
CREATE INDEX "ExpertQaAnswer_authorUserId_idx" ON "ExpertQaAnswer"("authorUserId");

-- CreateIndex
CREATE INDEX "ExpertQaAnswerVote_answerId_idx" ON "ExpertQaAnswerVote"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertQaAnswerVote_answerId_voterKey_key" ON "ExpertQaAnswerVote"("answerId", "voterKey");

-- CreateIndex
CREATE INDEX "ExpertEndorsement_expertProfileId_idx" ON "ExpertEndorsement"("expertProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertEndorsement_expertProfileId_endorsedByUserId_skill_key" ON "ExpertEndorsement"("expertProfileId", "endorsedByUserId", "skill");

-- CreateIndex
CREATE INDEX "ModerationAutoRule_enabled_priority_idx" ON "ModerationAutoRule"("enabled", "priority" DESC);

-- CreateIndex
CREATE INDEX "ModerationCase_status_priority_createdAt_idx" ON "ModerationCase"("status", "priority" DESC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ModerationCase_targetType_targetId_idx" ON "ModerationCase"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ModerationCase_reporterUserId_idx" ON "ModerationCase"("reporterUserId");

-- CreateIndex
CREATE INDEX "ExpertVerificationRequest_status_submittedAt_idx" ON "ExpertVerificationRequest"("status", "submittedAt" DESC);

-- CreateIndex
CREATE INDEX "ExpertVerificationRequest_userId_idx" ON "ExpertVerificationRequest"("userId");

-- CreateIndex
CREATE INDEX "safety_form_definitions_category_isActive_idx" ON "safety_form_definitions"("category", "isActive");

-- CreateIndex
CREATE INDEX "safety_form_definitions_companyId_idx" ON "safety_form_definitions"("companyId");

-- CreateIndex
CREATE INDEX "safety_form_versions_definitionId_version_idx" ON "safety_form_versions"("definitionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "safety_form_versions_definitionId_version_key" ON "safety_form_versions"("definitionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "safety_forms_clientSyncId_key" ON "safety_forms"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_forms_formType_status_idx" ON "safety_forms"("formType", "status");

-- CreateIndex
CREATE INDEX "safety_forms_definitionId_status_idx" ON "safety_forms"("definitionId", "status");

-- CreateIndex
CREATE INDEX "safety_forms_companyId_status_updatedAt_idx" ON "safety_forms"("companyId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "safety_forms_projectId_status_idx" ON "safety_forms"("projectId", "status");

-- CreateIndex
CREATE INDEX "idx_safety_form_project_status_updated" ON "safety_forms"("projectId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "safety_forms_workerId_createdAt_idx" ON "safety_forms"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_forms_siteId_status_idx" ON "safety_forms"("siteId", "status");

-- CreateIndex
CREATE INDEX "safety_form_submissions_formId_submittedAt_idx" ON "safety_form_submissions"("formId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "safety_form_submissions_formId_versionNumber_key" ON "safety_form_submissions"("formId", "versionNumber");

-- CreateIndex
CREATE INDEX "safety_form_attachments_formId_idx" ON "safety_form_attachments"("formId");

-- CreateIndex
CREATE INDEX "safety_form_templates_formType_active_idx" ON "safety_form_templates"("formType", "active");

-- CreateIndex
CREATE INDEX "safety_form_templates_companyId_projectId_idx" ON "safety_form_templates"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "safety_form_signatures_formId_idx" ON "safety_form_signatures"("formId");

-- CreateIndex
CREATE INDEX "safety_form_actions_formId_status_idx" ON "safety_form_actions"("formId", "status");

-- CreateIndex
CREATE INDEX "safety_form_audit_log_formId_createdAt_idx" ON "safety_form_audit_log"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "cail_entry_projectId_status_idx" ON "cail_entry"("projectId", "status");

-- CreateIndex
CREATE INDEX "cail_entry_ownerCompanyId_status_idx" ON "cail_entry"("ownerCompanyId", "status");

-- CreateIndex
CREATE INDEX "cail_entry_dueDate_idx" ON "cail_entry"("dueDate");

-- CreateIndex
CREATE INDEX "cail_entry_sourceType_sourceId_idx" ON "cail_entry"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "cail_entry_sourceType_sourceId_sourceItemId_key" ON "cail_entry"("sourceType", "sourceId", "sourceItemId");

-- CreateIndex
CREATE INDEX "cail_attachment_cailId_idx" ON "cail_attachment"("cailId");

-- CreateIndex
CREATE INDEX "cail_activity_log_cailId_createdAt_idx" ON "cail_activity_log"("cailId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_inspection_projectId_status_idx" ON "safety_inspection"("projectId", "status");

-- CreateIndex
CREATE INDEX "safety_inspection_inspectorUserId_createdAt_idx" ON "safety_inspection"("inspectorUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "safety_inspection_item_cailEntryId_key" ON "safety_inspection_item"("cailEntryId");

-- CreateIndex
CREATE INDEX "safety_inspection_item_inspectionId_idx" ON "safety_inspection_item"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "bbo_observation_cailEntryId_key" ON "bbo_observation"("cailEntryId");

-- CreateIndex
CREATE INDEX "bbo_observation_projectId_polarity_idx" ON "bbo_observation"("projectId", "polarity");

-- CreateIndex
CREATE INDEX "bbo_observation_observedByUserId_observedAt_idx" ON "bbo_observation"("observedByUserId", "observedAt");

-- CreateIndex
CREATE INDEX "incident_investigation_projectId_investigationStatus_idx" ON "incident_investigation"("projectId", "investigationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "incident_corrective_action_plan_cailEntryId_key" ON "incident_corrective_action_plan"("cailEntryId");

-- CreateIndex
CREATE INDEX "incident_corrective_action_plan_incidentId_idx" ON "incident_corrective_action_plan"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_learned_entry_cailId_key" ON "lessons_learned_entry"("cailId");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_projectId_publishedAt_idx" ON "lessons_learned_entry"("projectId", "publishedAt");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_companyId_publishedAt_idx" ON "lessons_learned_entry"("companyId", "publishedAt");

-- CreateIndex
CREATE INDEX "lessons_learned_entry_aiClusterId_idx" ON "lessons_learned_entry"("aiClusterId");

-- CreateIndex
CREATE INDEX "project_safety_role_projectId_role_idx" ON "project_safety_role"("projectId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "project_safety_role_projectId_userId_key" ON "project_safety_role"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_safety_risk_snapshot_projectId_computedAt_idx" ON "project_safety_risk_snapshot"("projectId", "computedAt");

-- CreateIndex
CREATE INDEX "access_zone_rules_projectId_active_idx" ON "access_zone_rules"("projectId", "active");

-- CreateIndex
CREATE INDEX "access_zone_rules_zoneType_idx" ON "access_zone_rules"("zoneType");

-- CreateIndex
CREATE UNIQUE INDEX "access_zone_rules_projectId_zoneCode_key" ON "access_zone_rules"("projectId", "zoneCode");

-- CreateIndex
CREATE INDEX "site_access_grant_workerId_projectId_zoneCode_idx" ON "site_access_grant"("workerId", "projectId", "zoneCode");

-- CreateIndex
CREATE INDEX "site_access_grant_projectId_grantedAt_idx" ON "site_access_grant"("projectId", "grantedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sds_document_clientSyncId_key" ON "sds_document"("clientSyncId");

-- CreateIndex
CREATE INDEX "sds_document_companyId_productName_idx" ON "sds_document"("companyId", "productName");

-- CreateIndex
CREATE INDEX "sds_document_projectId_status_idx" ON "sds_document"("projectId", "status");

-- CreateIndex
CREATE INDEX "sds_document_expiresAt_idx" ON "sds_document"("expiresAt");

-- CreateIndex
CREATE INDEX "sds_document_parentDocumentId_idx" ON "sds_document"("parentDocumentId");

-- CreateIndex
CREATE INDEX "chemical_inventory_item_siteId_idx" ON "chemical_inventory_item"("siteId");

-- CreateIndex
CREATE INDEX "chemical_inventory_item_projectId_idx" ON "chemical_inventory_item"("projectId");

-- CreateIndex
CREATE INDEX "chemical_inventory_item_sdsDocumentId_idx" ON "chemical_inventory_item"("sdsDocumentId");

-- CreateIndex
CREATE INDEX "chemical_inventory_item_chemicalExpiry_idx" ON "chemical_inventory_item"("chemicalExpiry");

-- CreateIndex
CREATE UNIQUE INDEX "policy_document_clientSyncId_key" ON "policy_document"("clientSyncId");

-- CreateIndex
CREATE INDEX "policy_document_companyId_category_idx" ON "policy_document"("companyId", "category");

-- CreateIndex
CREATE INDEX "policy_document_projectId_status_idx" ON "policy_document"("projectId", "status");

-- CreateIndex
CREATE INDEX "policy_acknowledgment_workerId_idx" ON "policy_acknowledgment"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "policy_acknowledgment_policyDocumentId_workerId_key" ON "policy_acknowledgment"("policyDocumentId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_plan_clientSyncId_key" ON "emergency_plan"("clientSyncId");

-- CreateIndex
CREATE INDEX "emergency_plan_siteId_active_idx" ON "emergency_plan"("siteId", "active");

-- CreateIndex
CREATE INDEX "emergency_plan_companyId_planType_status_idx" ON "emergency_plan"("companyId", "planType", "status");

-- CreateIndex
CREATE INDEX "emergency_plan_projectId_status_idx" ON "emergency_plan"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "muster_sessions_clientSyncId_key" ON "muster_sessions"("clientSyncId");

-- CreateIndex
CREATE INDEX "muster_sessions_siteId_status_idx" ON "muster_sessions"("siteId", "status");

-- CreateIndex
CREATE INDEX "muster_sessions_projectId_triggeredAt_idx" ON "muster_sessions"("projectId", "triggeredAt");

-- CreateIndex
CREATE INDEX "muster_sessions_emergencyEventId_idx" ON "muster_sessions"("emergencyEventId");

-- CreateIndex
CREATE UNIQUE INDEX "muster_attendance_clientSyncId_key" ON "muster_attendance"("clientSyncId");

-- CreateIndex
CREATE INDEX "muster_attendance_musterEventId_idx" ON "muster_attendance"("musterEventId");

-- CreateIndex
CREATE UNIQUE INDEX "muster_attendance_musterEventId_workerId_key" ON "muster_attendance"("musterEventId", "workerId");

-- CreateIndex
CREATE INDEX "safety_station_heartbeat_stationId_createdAt_idx" ON "safety_station_heartbeat"("stationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_taskId_key" ON "jha_flha"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_clientSyncId_key" ON "jha_flha"("clientSyncId");

-- CreateIndex
CREATE INDEX "jha_flha_projectId_status_idx" ON "jha_flha"("projectId", "status");

-- CreateIndex
CREATE INDEX "jha_flha_companyId_createdAt_idx" ON "jha_flha"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "jha_flha_siteId_status_idx" ON "jha_flha"("siteId", "status");

-- CreateIndex
CREATE INDEX "jha_flha_workPackageId_idx" ON "jha_flha"("workPackageId");

-- CreateIndex
CREATE INDEX "jha_flha_taskId_idx" ON "jha_flha"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_version_jhaFlhaId_versionNumber_key" ON "jha_flha_version"("jhaFlhaId", "versionNumber");

-- CreateIndex
CREATE INDEX "jha_flha_hazard_jhaFlhaId_sortOrder_idx" ON "jha_flha_hazard"("jhaFlhaId", "sortOrder");

-- CreateIndex
CREATE INDEX "jha_flha_control_jhaFlhaId_idx" ON "jha_flha_control"("jhaFlhaId");

-- CreateIndex
CREATE INDEX "jha_flha_control_hazardId_idx" ON "jha_flha_control"("hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_energy_source_jhaFlhaId_energyType_key" ON "jha_flha_energy_source"("jhaFlhaId", "energyType");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_worker_jhaFlhaId_workerId_key" ON "jha_flha_worker"("jhaFlhaId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "jha_flha_equipment_jhaFlhaId_equipmentId_key" ON "jha_flha_equipment"("jhaFlhaId", "equipmentId");

-- CreateIndex
CREATE INDEX "jha_flha_signature_jhaFlhaId_idx" ON "jha_flha_signature"("jhaFlhaId");

-- CreateIndex
CREATE INDEX "jha_flha_attachment_jhaFlhaId_idx" ON "jha_flha_attachment"("jhaFlhaId");

-- CreateIndex
CREATE INDEX "jha_flha_corrective_action_jhaFlhaId_idx" ON "jha_flha_corrective_action"("jhaFlhaId");

-- CreateIndex
CREATE INDEX "hazard_library_companyId_category_idx" ON "hazard_library"("companyId", "category");

-- CreateIndex
CREATE INDEX "hazard_library_projectId_category_idx" ON "hazard_library"("projectId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_library_seed_key_companyId_key" ON "hazard_library"("seed_key", "companyId");

-- CreateIndex
CREATE INDEX "control_library_companyId_controlType_idx" ON "control_library"("companyId", "controlType");

-- CreateIndex
CREATE UNIQUE INDEX "control_library_seed_key_companyId_key" ON "control_library"("seed_key", "companyId");

-- CreateIndex
CREATE INDEX "system_catalog_catalog_type_active_idx" ON "system_catalog"("catalog_type", "active");

-- CreateIndex
CREATE INDEX "jha_task_library_companyId_taskCode_idx" ON "jha_task_library"("companyId", "taskCode");

-- CreateIndex
CREATE INDEX "jha_task_library_projectId_taskCode_idx" ON "jha_task_library"("projectId", "taskCode");

-- CreateIndex
CREATE INDEX "jha_flha_audit_log_jhaFlhaId_createdAt_idx" ON "jha_flha_audit_log"("jhaFlhaId", "createdAt");

-- CreateIndex
CREATE INDEX "sif_indicator_companyId_code_idx" ON "sif_indicator"("companyId", "code");

-- CreateIndex
CREATE INDEX "sif_indicator_projectId_code_idx" ON "sif_indicator"("projectId", "code");

-- CreateIndex
CREATE INDEX "heca_category_companyId_code_idx" ON "heca_category"("companyId", "code");

-- CreateIndex
CREATE INDEX "sif_heca_event_projectId_status_idx" ON "sif_heca_event"("projectId", "status");

-- CreateIndex
CREATE INDEX "sif_heca_event_companyId_createdAt_idx" ON "sif_heca_event"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "sif_heca_event_workerId_status_idx" ON "sif_heca_event"("workerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sif_heca_event_sourceType_sourceId_sourceItemId_key" ON "sif_heca_event"("sourceType", "sourceId", "sourceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "sif_score_eventId_key" ON "sif_score"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "heca_score_eventId_key" ON "heca_score"("eventId");

-- CreateIndex
CREATE INDEX "heca_score_hecaCategoryCode_idx" ON "heca_score"("hecaCategoryCode");

-- CreateIndex
CREATE INDEX "sif_heca_link_eventId_idx" ON "sif_heca_link"("eventId");

-- CreateIndex
CREATE INDEX "sif_heca_corrective_action_eventId_status_idx" ON "sif_heca_corrective_action"("eventId", "status");

-- CreateIndex
CREATE INDEX "sif_heca_audit_eventId_createdAt_idx" ON "sif_heca_audit"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_template_clientSyncId_key" ON "pm_inspection_template"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_inspection_template_companyId_category_status_idx" ON "pm_inspection_template"("companyId", "category", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_template_projectId_status_idx" ON "pm_inspection_template"("projectId", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_template_parentTemplateId_idx" ON "pm_inspection_template"("parentTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_template_seed_key_companyId_key" ON "pm_inspection_template"("seed_key", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_clientSyncId_key" ON "pm_inspection"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_inspection_projectId_status_idx" ON "pm_inspection"("projectId", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_companyId_createdAt_idx" ON "pm_inspection"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_inspection_equipmentId_status_idx" ON "pm_inspection"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_inspectorUserId_createdAt_idx" ON "pm_inspection"("inspectorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_inspection_workerId_status_idx" ON "pm_inspection"("workerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_deficiency_cailEntryId_key" ON "pm_inspection_deficiency"("cailEntryId");

-- CreateIndex
CREATE INDEX "pm_inspection_deficiency_inspectionId_status_idx" ON "pm_inspection_deficiency"("inspectionId", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_deficiency_severity_status_idx" ON "pm_inspection_deficiency"("severity", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_attachment_clientSyncId_key" ON "pm_inspection_attachment"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_inspection_attachment_inspectionId_idx" ON "pm_inspection_attachment"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_signature_clientSyncId_key" ON "pm_inspection_signature"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_inspection_signature_inspectionId_idx" ON "pm_inspection_signature"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_signature_inspectionId_role_key" ON "pm_inspection_signature"("inspectionId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_corrective_action_cailEntryId_key" ON "pm_inspection_corrective_action"("cailEntryId");

-- CreateIndex
CREATE INDEX "pm_inspection_corrective_action_inspectionId_status_idx" ON "pm_inspection_corrective_action"("inspectionId", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_audit_inspectionId_createdAt_idx" ON "pm_inspection_audit"("inspectionId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_safety_event_type_library_projectId_code_idx" ON "pm_safety_event_type_library"("projectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_type_library_companyId_code_key" ON "pm_safety_event_type_library"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "pm_root_cause_library_companyId_code_key" ON "pm_root_cause_library"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "pm_contributing_factor_library_companyId_code_key" ON "pm_contributing_factor_library"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_pmInspectionId_key" ON "pm_safety_event"("pmInspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_clientSyncId_key" ON "pm_safety_event"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_safety_event_projectId_status_idx" ON "pm_safety_event"("projectId", "status");

-- CreateIndex
CREATE INDEX "pm_safety_event_companyId_eventType_createdAt_idx" ON "pm_safety_event"("companyId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "pm_safety_event_severity_status_idx" ON "pm_safety_event"("severity", "status");

-- CreateIndex
CREATE INDEX "pm_safety_event_legacyIncidentId_idx" ON "pm_safety_event"("legacyIncidentId");

-- CreateIndex
CREATE INDEX "pm_safety_event_pmInspectionId_idx" ON "pm_safety_event"("pmInspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_version_eventId_version_key" ON "pm_safety_event_version"("eventId", "version");

-- CreateIndex
CREATE INDEX "pm_safety_event_injury_eventId_idx" ON "pm_safety_event_injury"("eventId");

-- CreateIndex
CREATE INDEX "pm_safety_event_person_eventId_idx" ON "pm_safety_event_person"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_equipment_eventId_equipmentId_key" ON "pm_safety_event_equipment"("eventId", "equipmentId");

-- CreateIndex
CREATE INDEX "pm_safety_event_witness_eventId_idx" ON "pm_safety_event_witness"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_statement_clientSyncId_key" ON "pm_safety_event_statement"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_safety_event_statement_eventId_idx" ON "pm_safety_event_statement"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_attachment_clientSyncId_key" ON "pm_safety_event_attachment"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_safety_event_attachment_eventId_idx" ON "pm_safety_event_attachment"("eventId");

-- CreateIndex
CREATE INDEX "pm_safety_event_root_cause_eventId_idx" ON "pm_safety_event_root_cause"("eventId");

-- CreateIndex
CREATE INDEX "pm_safety_event_contributing_factor_eventId_idx" ON "pm_safety_event_contributing_factor"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_corrective_action_cailEntryId_key" ON "pm_safety_event_corrective_action"("cailEntryId");

-- CreateIndex
CREATE INDEX "pm_safety_event_corrective_action_eventId_status_idx" ON "pm_safety_event_corrective_action"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_event_investigation_event_id_key" ON "pm_safety_event_investigation"("event_id");

-- CreateIndex
CREATE INDEX "pm_safety_event_audit_eventId_createdAt_idx" ON "pm_safety_event_audit"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_capa_company_config_companyId_key" ON "pm_capa_company_config"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_actions_cailEntryId_key" ON "corrective_actions"("cailEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_actions_clientSyncId_key" ON "corrective_actions"("clientSyncId");

-- CreateIndex
CREATE INDEX "corrective_actions_projectId_status_idx" ON "corrective_actions"("projectId", "status");

-- CreateIndex
CREATE INDEX "corrective_actions_companyId_priorityScore_idx" ON "corrective_actions"("companyId", "priorityScore");

-- CreateIndex
CREATE INDEX "corrective_actions_dueAt_status_idx" ON "corrective_actions"("dueAt", "status");

-- CreateIndex
CREATE INDEX "corrective_actions_sourceModule_sourceId_idx" ON "corrective_actions"("sourceModule", "sourceId");

-- CreateIndex
CREATE INDEX "corrective_actions_equipmentId_status_idx" ON "corrective_actions"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "corrective_actions_hazardId_idx" ON "corrective_actions"("hazardId");

-- CreateIndex
CREATE INDEX "corrective_actions_controlId_idx" ON "corrective_actions"("controlId");

-- CreateIndex
CREATE INDEX "corrective_actions_workerId_status_idx" ON "corrective_actions"("workerId", "status");

-- CreateIndex
CREATE INDEX "corrective_action_assignments_actionId_idx" ON "corrective_action_assignments"("actionId");

-- CreateIndex
CREATE INDEX "corrective_action_assignments_userId_idx" ON "corrective_action_assignments"("userId");

-- CreateIndex
CREATE INDEX "corrective_action_assignments_workerId_idx" ON "corrective_action_assignments"("workerId");

-- CreateIndex
CREATE INDEX "corrective_action_escalations_actionId_level_idx" ON "corrective_action_escalations"("actionId", "level");

-- CreateIndex
CREATE INDEX "corrective_action_verifications_actionId_idx" ON "corrective_action_verifications"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_action_attachments_clientSyncId_key" ON "corrective_action_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "corrective_action_attachments_actionId_idx" ON "corrective_action_attachments"("actionId");

-- CreateIndex
CREATE INDEX "pm_corrective_action_signature_actionId_idx" ON "pm_corrective_action_signature"("actionId");

-- CreateIndex
CREATE INDEX "corrective_action_audit_actionId_createdAt_idx" ON "corrective_action_audit"("actionId", "createdAt");

-- CreateIndex
CREATE INDEX "corrective_action_audit_eventType_createdAt_idx" ON "corrective_action_audit"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_action_versions_actionId_version_key" ON "corrective_action_versions"("actionId", "version");

-- CreateIndex
CREATE INDEX "corrective_action_links_linkType_linkedId_idx" ON "corrective_action_links"("linkType", "linkedId");

-- CreateIndex
CREATE UNIQUE INDEX "corrective_action_links_actionId_linkType_linkedId_key" ON "corrective_action_links"("actionId", "linkType", "linkedId");

-- CreateIndex
CREATE INDEX "pm_capa_overrides_companyId_projectId_active_idx" ON "pm_capa_overrides"("companyId", "projectId", "active");

-- CreateIndex
CREATE INDEX "pm_capa_overrides_expiresAt_idx" ON "pm_capa_overrides"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_capa_offline_cache_cacheKey_key" ON "pm_capa_offline_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "pm_capa_offline_cache_companyId_idx" ON "pm_capa_offline_cache"("companyId");

-- CreateIndex
CREATE INDEX "pm_capa_offline_cache_projectId_idx" ON "pm_capa_offline_cache"("projectId");

-- CreateIndex
CREATE INDEX "topic_library_categories_companyId_idx" ON "topic_library_categories"("companyId");

-- CreateIndex
CREATE INDEX "topic_library_companyId_projectId_idx" ON "topic_library"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "topic_library_categoryId_idx" ON "topic_library"("categoryId");

-- CreateIndex
CREATE INDEX "topic_library_active_idx" ON "topic_library"("active");

-- CreateIndex
CREATE INDEX "safety_meeting_templates_companyId_projectId_idx" ON "safety_meeting_templates"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "safety_meeting_templates_meetingType_status_idx" ON "safety_meeting_templates"("meetingType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meetings_cailEntryId_key" ON "safety_meetings"("cailEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meetings_pmInspectionId_key" ON "safety_meetings"("pmInspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meetings_clientSyncId_key" ON "safety_meetings"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_meetings_projectId_status_idx" ON "safety_meetings"("projectId", "status");

-- CreateIndex
CREATE INDEX "safety_meetings_companyId_meetingType_idx" ON "safety_meetings"("companyId", "meetingType");

-- CreateIndex
CREATE INDEX "safety_meetings_scheduledAt_idx" ON "safety_meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "safety_meetings_siteId_status_idx" ON "safety_meetings"("siteId", "status");

-- CreateIndex
CREATE INDEX "safety_meetings_pmInspectionId_idx" ON "safety_meetings"("pmInspectionId");

-- CreateIndex
CREATE INDEX "safety_meeting_topics_meetingId_idx" ON "safety_meeting_topics"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meeting_attendees_clientSyncId_key" ON "safety_meeting_attendees"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_meeting_attendees_workerId_idx" ON "safety_meeting_attendees"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meeting_attendees_meetingId_workerId_key" ON "safety_meeting_attendees"("meetingId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meeting_signatures_clientSyncId_key" ON "safety_meeting_signatures"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_meeting_signatures_meetingId_idx" ON "safety_meeting_signatures"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meeting_attachments_clientSyncId_key" ON "safety_meeting_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_meeting_attachments_meetingId_idx" ON "safety_meeting_attachments"("meetingId");

-- CreateIndex
CREATE INDEX "safety_meeting_corrective_actions_correctiveActionId_idx" ON "safety_meeting_corrective_actions"("correctiveActionId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_meeting_corrective_actions_meetingId_correctiveActio_key" ON "safety_meeting_corrective_actions"("meetingId", "correctiveActionId");

-- CreateIndex
CREATE INDEX "safety_meeting_audit_meetingId_createdAt_idx" ON "safety_meeting_audit"("meetingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "site_access_meeting_requirement_projectId_meetingType_zoneC_key" ON "site_access_meeting_requirement"("projectId", "meetingType", "zoneCode");

-- CreateIndex
CREATE UNIQUE INDEX "sds_version_sdsDocumentId_version_key" ON "sds_version"("sdsDocumentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "sds_attachment_clientSyncId_key" ON "sds_attachment"("clientSyncId");

-- CreateIndex
CREATE INDEX "sds_attachment_sdsDocumentId_idx" ON "sds_attachment"("sdsDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_controlled_document_clientSyncId_key" ON "pm_controlled_document"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_controlled_document_companyId_documentType_status_idx" ON "pm_controlled_document"("companyId", "documentType", "status");

-- CreateIndex
CREATE INDEX "pm_controlled_document_projectId_status_idx" ON "pm_controlled_document"("projectId", "status");

-- CreateIndex
CREATE INDEX "pm_controlled_document_equipmentId_idx" ON "pm_controlled_document"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_version_documentId_version_key" ON "document_version"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_attachment_clientSyncId_key" ON "document_attachment"("clientSyncId");

-- CreateIndex
CREATE INDEX "document_attachment_documentId_idx" ON "document_attachment"("documentId");

-- CreateIndex
CREATE INDEX "document_attachment_sdsDocumentId_idx" ON "document_attachment"("sdsDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_acknowledgment_clientSyncId_key" ON "document_acknowledgment"("clientSyncId");

-- CreateIndex
CREATE INDEX "document_acknowledgment_workerId_idx" ON "document_acknowledgment"("workerId");

-- CreateIndex
CREATE INDEX "document_acknowledgment_controlledDocumentId_idx" ON "document_acknowledgment"("controlledDocumentId");

-- CreateIndex
CREATE INDEX "document_acknowledgment_sdsDocumentId_idx" ON "document_acknowledgment"("sdsDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturer_instruction_controlledDocId_key" ON "manufacturer_instruction"("controlledDocId");

-- CreateIndex
CREATE INDEX "manufacturer_instruction_companyId_equipmentId_idx" ON "manufacturer_instruction"("companyId", "equipmentId");

-- CreateIndex
CREATE INDEX "document_audit_entityType_entityId_createdAt_idx" ON "document_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_certifications_clientSyncId_key" ON "equipment_certifications"("clientSyncId");

-- CreateIndex
CREATE INDEX "equipment_certifications_equipmentId_status_idx" ON "equipment_certifications"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "equipment_certifications_expiresAt_idx" ON "equipment_certifications"("expiresAt");

-- CreateIndex
CREATE INDEX "equipment_certifications_companyId_certificationType_idx" ON "equipment_certifications"("companyId", "certificationType");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_inspections_pmInspectionId_key" ON "equipment_inspections"("pmInspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_inspections_clientSyncId_key" ON "equipment_inspections"("clientSyncId");

-- CreateIndex
CREATE INDEX "equipment_inspections_equipmentId_cadence_idx" ON "equipment_inspections"("equipmentId", "cadence");

-- CreateIndex
CREATE INDEX "equipment_inspections_projectId_createdAt_idx" ON "equipment_inspections"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "equipment_inspection_items_equipmentInspectionId_idx" ON "equipment_inspection_items"("equipmentInspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_failures_clientSyncId_key" ON "equipment_failures"("clientSyncId");

-- CreateIndex
CREATE INDEX "equipment_failures_equipmentId_status_idx" ON "equipment_failures"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "equipment_failures_companyId_failureType_idx" ON "equipment_failures"("companyId", "failureType");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_loto_clientSyncId_key" ON "equipment_loto"("clientSyncId");

-- CreateIndex
CREATE INDEX "equipment_loto_equipmentId_status_idx" ON "equipment_loto"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "equipment_loto_companyId_createdAt_idx" ON "equipment_loto"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "worker_equipment_authorizations_clientSyncId_key" ON "worker_equipment_authorizations"("clientSyncId");

-- CreateIndex
CREATE INDEX "worker_equipment_authorizations_workerId_authType_active_idx" ON "worker_equipment_authorizations"("workerId", "authType", "active");

-- CreateIndex
CREATE INDEX "worker_equipment_authorizations_equipmentId_idx" ON "worker_equipment_authorizations"("equipmentId");

-- CreateIndex
CREATE INDEX "worker_equipment_authorizations_expiresAt_idx" ON "worker_equipment_authorizations"("expiresAt");

-- CreateIndex
CREATE INDEX "equipment_condition_scores_equipmentId_scoredAt_idx" ON "equipment_condition_scores"("equipmentId", "scoredAt");

-- CreateIndex
CREATE INDEX "equipment_assignment_audit_equipmentId_createdAt_idx" ON "equipment_assignment_audit"("equipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "equipment_audit_entityType_entityId_createdAt_idx" ON "equipment_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_plan_versions_planId_version_key" ON "emergency_plan_versions"("planId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_plan_acknowledgment_clientSyncId_key" ON "emergency_plan_acknowledgment"("clientSyncId");

-- CreateIndex
CREATE INDEX "emergency_plan_acknowledgment_workerId_idx" ON "emergency_plan_acknowledgment"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_plan_acknowledgment_planId_workerId_key" ON "emergency_plan_acknowledgment"("planId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_events_clientSyncId_key" ON "emergency_events"("clientSyncId");

-- CreateIndex
CREATE INDEX "emergency_events_companyId_eventType_status_idx" ON "emergency_events"("companyId", "eventType", "status");

-- CreateIndex
CREATE INDEX "emergency_events_projectId_declaredAt_idx" ON "emergency_events"("projectId", "declaredAt");

-- CreateIndex
CREATE INDEX "emergency_events_siteId_status_idx" ON "emergency_events"("siteId", "status");

-- CreateIndex
CREATE INDEX "emergency_event_people_emergencyEventId_idx" ON "emergency_event_people"("emergencyEventId");

-- CreateIndex
CREATE INDEX "emergency_event_equipment_emergencyEventId_idx" ON "emergency_event_equipment"("emergencyEventId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_event_attachments_clientSyncId_key" ON "emergency_event_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "emergency_event_attachments_emergencyEventId_idx" ON "emergency_event_attachments"("emergencyEventId");

-- CreateIndex
CREATE INDEX "emergency_notifications_emergencyEventId_status_idx" ON "emergency_notifications"("emergencyEventId", "status");

-- CreateIndex
CREATE INDEX "emergency_notifications_musterEventId_idx" ON "emergency_notifications"("musterEventId");

-- CreateIndex
CREATE INDEX "emergency_notifications_companyId_createdAt_idx" ON "emergency_notifications"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "emergency_equipment_companyId_siteId_idx" ON "emergency_equipment"("companyId", "siteId");

-- CreateIndex
CREATE INDEX "emergency_equipment_expiresAt_idx" ON "emergency_equipment"("expiresAt");

-- CreateIndex
CREATE INDEX "emergency_equipment_inspections_emergencyEquipmentId_inspec_idx" ON "emergency_equipment_inspections"("emergencyEquipmentId", "inspectedAt");

-- CreateIndex
CREATE INDEX "pm_site_emergency_lock_projectId_active_idx" ON "pm_site_emergency_lock"("projectId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "pm_site_emergency_lock_projectId_emergencyEventId_key" ON "pm_site_emergency_lock"("projectId", "emergencyEventId");

-- CreateIndex
CREATE INDEX "emergency_audit_entityType_entityId_createdAt_idx" ON "emergency_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "access_points_clientSyncId_key" ON "access_points"("clientSyncId");

-- CreateIndex
CREATE INDEX "access_points_companyId_projectId_idx" ON "access_points"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "access_points_siteId_active_idx" ON "access_points"("siteId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "access_attempts_clientSyncId_key" ON "access_attempts"("clientSyncId");

-- CreateIndex
CREATE INDEX "access_attempts_projectId_createdAt_idx" ON "access_attempts"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "access_attempts_workerId_createdAt_idx" ON "access_attempts"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "access_attempts_decision_idx" ON "access_attempts"("decision");

-- CreateIndex
CREATE INDEX "access_denials_attemptId_idx" ON "access_denials"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "access_overrides_clientSyncId_key" ON "access_overrides"("clientSyncId");

-- CreateIndex
CREATE INDEX "access_overrides_projectId_workerId_active_idx" ON "access_overrides"("projectId", "workerId", "active");

-- CreateIndex
CREATE INDEX "access_overrides_expiresAt_idx" ON "access_overrides"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "access_attachments_clientSyncId_key" ON "access_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "access_attachments_attemptId_idx" ON "access_attachments"("attemptId");

-- CreateIndex
CREATE INDEX "worker_access_requirements_workerId_satisfied_idx" ON "worker_access_requirements"("workerId", "satisfied");

-- CreateIndex
CREATE UNIQUE INDEX "worker_access_requirements_workerId_requirementType_require_key" ON "worker_access_requirements"("workerId", "requirementType", "requirementKey", "projectId");

-- CreateIndex
CREATE INDEX "equipment_access_requirements_equipmentId_satisfied_idx" ON "equipment_access_requirements"("equipmentId", "satisfied");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_access_requirements_equipmentId_requirementType_r_key" ON "equipment_access_requirements"("equipmentId", "requirementType", "requirementKey");

-- CreateIndex
CREATE INDEX "access_audit_entityType_entityId_createdAt_idx" ON "access_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "safety_station_access_logs_clientSyncId_key" ON "safety_station_access_logs"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_station_access_logs_stationId_createdAt_idx" ON "safety_station_access_logs"("stationId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_station_access_logs_workerId_createdAt_idx" ON "safety_station_access_logs"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_station_access_logs_projectId_granted_idx" ON "safety_station_access_logs"("projectId", "granted");

-- CreateIndex
CREATE UNIQUE INDEX "safety_station_equipment_logs_clientSyncId_key" ON "safety_station_equipment_logs"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_station_equipment_logs_stationId_createdAt_idx" ON "safety_station_equipment_logs"("stationId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_station_equipment_logs_equipmentId_idx" ON "safety_station_equipment_logs"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "safety_station_muster_logs_clientSyncId_key" ON "safety_station_muster_logs"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_station_muster_logs_stationId_createdAt_idx" ON "safety_station_muster_logs"("stationId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_station_muster_logs_musterEventId_idx" ON "safety_station_muster_logs"("musterEventId");

-- CreateIndex
CREATE INDEX "safety_station_offline_cache_stationId_updatedAt_idx" ON "safety_station_offline_cache"("stationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "safety_station_offline_cache_stationId_cacheKey_key" ON "safety_station_offline_cache"("stationId", "cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "safety_station_attachments_clientSyncId_key" ON "safety_station_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "safety_station_attachments_stationId_entityType_entityId_idx" ON "safety_station_attachments"("stationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "safety_station_audit_stationId_createdAt_idx" ON "safety_station_audit"("stationId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_station_audit_entityType_entityId_createdAt_idx" ON "safety_station_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_safety_profiles_projectId_key" ON "pm_project_safety_profiles"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_safety_profiles_clientSyncId_key" ON "pm_project_safety_profiles"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_project_safety_profiles_companyId_status_idx" ON "pm_project_safety_profiles"("companyId", "status");

-- CreateIndex
CREATE INDEX "pm_project_safety_profiles_riskLevel_idx" ON "pm_project_safety_profiles"("riskLevel");

-- CreateIndex
CREATE INDEX "pm_project_safety_profile_versions_profileId_publishedAt_idx" ON "pm_project_safety_profile_versions"("profileId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_safety_profile_versions_profileId_version_key" ON "pm_project_safety_profile_versions"("profileId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_hazards_clientSyncId_key" ON "pm_project_hazards"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_project_hazards_projectId_category_status_idx" ON "pm_project_hazards"("projectId", "category", "status");

-- CreateIndex
CREATE INDEX "pm_project_hazards_projectId_active_idx" ON "pm_project_hazards"("projectId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_controls_clientSyncId_key" ON "pm_project_controls"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_project_controls_projectId_controlType_status_idx" ON "pm_project_controls"("projectId", "controlType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_safety_overrides_clientSyncId_key" ON "pm_project_safety_overrides"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_project_safety_overrides_projectId_ruleType_active_idx" ON "pm_project_safety_overrides"("projectId", "ruleType", "active");

-- CreateIndex
CREATE INDEX "pm_project_safety_overrides_expiresAt_idx" ON "pm_project_safety_overrides"("expiresAt");

-- CreateIndex
CREATE INDEX "pm_project_safety_context_audit_projectId_createdAt_idx" ON "pm_project_safety_context_audit"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_project_safety_context_audit_entityType_entityId_created_idx" ON "pm_project_safety_context_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_project_safety_offline_cache_projectId_updatedAt_idx" ON "pm_project_safety_offline_cache"("projectId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_safety_offline_cache_projectId_cacheKey_key" ON "pm_project_safety_offline_cache"("projectId", "cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_profiles_companyId_key" ON "company_safety_profiles"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_profiles_clientSyncId_key" ON "company_safety_profiles"("clientSyncId");

-- CreateIndex
CREATE INDEX "company_safety_profiles_status_idx" ON "company_safety_profiles"("status");

-- CreateIndex
CREATE INDEX "company_safety_profiles_corporateRiskLevel_idx" ON "company_safety_profiles"("corporateRiskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_profile_versions_profileId_version_key" ON "company_safety_profile_versions"("profileId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "company_hazard_library_clientSyncId_key" ON "company_hazard_library"("clientSyncId");

-- CreateIndex
CREATE INDEX "company_hazard_library_companyId_category_status_idx" ON "company_hazard_library"("companyId", "category", "status");

-- CreateIndex
CREATE INDEX "company_hazard_library_companyId_active_idx" ON "company_hazard_library"("companyId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "company_control_library_clientSyncId_key" ON "company_control_library"("clientSyncId");

-- CreateIndex
CREATE INDEX "company_control_library_companyId_controlType_status_idx" ON "company_control_library"("companyId", "controlType", "status");

-- CreateIndex
CREATE INDEX "company_training_matrix_companyId_roleType_idx" ON "company_training_matrix"("companyId", "roleType");

-- CreateIndex
CREATE UNIQUE INDEX "company_training_matrix_companyId_roleType_trainingCode_key" ON "company_training_matrix"("companyId", "roleType", "trainingCode");

-- CreateIndex
CREATE UNIQUE INDEX "company_policies_clientSyncId_key" ON "company_policies"("clientSyncId");

-- CreateIndex
CREATE INDEX "company_policies_companyId_policyType_status_idx" ON "company_policies"("companyId", "policyType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "company_policy_versions_policyId_version_key" ON "company_policy_versions"("policyId", "version");

-- CreateIndex
CREATE INDEX "company_policy_acknowledgments_workerId_idx" ON "company_policy_acknowledgments"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "company_policy_acknowledgments_policyId_workerId_key" ON "company_policy_acknowledgments"("policyId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "company_sds_library_legacySdsId_key" ON "company_sds_library"("legacySdsId");

-- CreateIndex
CREATE INDEX "company_sds_library_companyId_productName_idx" ON "company_sds_library"("companyId", "productName");

-- CreateIndex
CREATE INDEX "company_sds_library_expiresAt_idx" ON "company_sds_library"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "company_sds_versions_sdsId_version_key" ON "company_sds_versions"("sdsId", "version");

-- CreateIndex
CREATE INDEX "company_emergency_plans_companyId_planType_idx" ON "company_emergency_plans"("companyId", "planType");

-- CreateIndex
CREATE UNIQUE INDEX "company_emergency_plan_versions_planId_version_key" ON "company_emergency_plan_versions"("planId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "company_equipment_rules_companyId_ruleKey_key" ON "company_equipment_rules"("companyId", "ruleKey");

-- CreateIndex
CREATE UNIQUE INDEX "company_zone_templates_companyId_templateCode_key" ON "company_zone_templates"("companyId", "templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_overrides_clientSyncId_key" ON "company_safety_overrides"("clientSyncId");

-- CreateIndex
CREATE INDEX "company_safety_overrides_companyId_overrideType_active_idx" ON "company_safety_overrides"("companyId", "overrideType", "active");

-- CreateIndex
CREATE INDEX "company_safety_audit_companyId_createdAt_idx" ON "company_safety_audit"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "company_safety_audit_entityType_entityId_createdAt_idx" ON "company_safety_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "company_safety_offline_cache_companyId_updatedAt_idx" ON "company_safety_offline_cache"("companyId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "company_safety_offline_cache_companyId_cacheKey_key" ON "company_safety_offline_cache"("companyId", "cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_workerId_key" ON "worker_profiles"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_clientSyncId_key" ON "worker_profiles"("clientSyncId");

-- CreateIndex
CREATE INDEX "worker_profiles_companyId_riskLevel_idx" ON "worker_profiles"("companyId", "riskLevel");

-- CreateIndex
CREATE INDEX "worker_profiles_safetyScore_idx" ON "worker_profiles"("safetyScore");

-- CreateIndex
CREATE INDEX "worker_training_workerId_trainingCode_idx" ON "worker_training"("workerId", "trainingCode");

-- CreateIndex
CREATE INDEX "worker_training_expiresAt_idx" ON "worker_training"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "worker_competencies_workerId_competencyKey_key" ON "worker_competencies"("workerId", "competencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "worker_authorizations_clientSyncId_key" ON "worker_authorizations"("clientSyncId");

-- CreateIndex
CREATE INDEX "worker_authorizations_workerId_authType_active_idx" ON "worker_authorizations"("workerId", "authType", "active");

-- CreateIndex
CREATE INDEX "worker_authorizations_expiresAt_idx" ON "worker_authorizations"("expiresAt");

-- CreateIndex
CREATE INDEX "worker_medical_restrictions_workerId_active_idx" ON "worker_medical_restrictions"("workerId", "active");

-- CreateIndex
CREATE INDEX "worker_hazard_exposure_workerId_exposedAt_idx" ON "worker_hazard_exposure"("workerId", "exposedAt");

-- CreateIndex
CREATE INDEX "worker_hazard_exposure_projectId_idx" ON "worker_hazard_exposure"("projectId");

-- CreateIndex
CREATE INDEX "worker_incident_history_workerId_occurredAt_idx" ON "worker_incident_history"("workerId", "occurredAt");

-- CreateIndex
CREATE INDEX "worker_corrective_actions_workerId_status_idx" ON "worker_corrective_actions"("workerId", "status");

-- CreateIndex
CREATE INDEX "worker_corrective_actions_capaId_idx" ON "worker_corrective_actions"("capaId");

-- CreateIndex
CREATE INDEX "worker_access_logs_workerId_createdAt_idx" ON "worker_access_logs"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "worker_access_logs_projectId_granted_idx" ON "worker_access_logs"("projectId", "granted");

-- CreateIndex
CREATE UNIQUE INDEX "worker_overrides_clientSyncId_key" ON "worker_overrides"("clientSyncId");

-- CreateIndex
CREATE INDEX "worker_overrides_workerId_active_idx" ON "worker_overrides"("workerId", "active");

-- CreateIndex
CREATE INDEX "worker_overrides_expiresAt_idx" ON "worker_overrides"("expiresAt");

-- CreateIndex
CREATE INDEX "worker_safety_scores_workerId_computedAt_idx" ON "worker_safety_scores"("workerId", "computedAt");

-- CreateIndex
CREATE INDEX "worker_safety_audit_workerId_createdAt_idx" ON "worker_safety_audit"("workerId", "createdAt");

-- CreateIndex
CREATE INDEX "worker_safety_offline_cache_workerId_updatedAt_idx" ON "worker_safety_offline_cache"("workerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "worker_safety_offline_cache_workerId_cacheKey_key" ON "worker_safety_offline_cache"("workerId", "cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_config_projectId_key" ON "pm_project_config"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "work_packages_clientSyncId_key" ON "work_packages"("clientSyncId");

-- CreateIndex
CREATE INDEX "work_packages_projectId_status_idx" ON "work_packages"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_packages_projectId_code_key" ON "work_packages"("projectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_clientSyncId_key" ON "tasks"("clientSyncId");

-- CreateIndex
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");

-- CreateIndex
CREATE INDEX "tasks_workPackageId_idx" ON "tasks"("workPackageId");

-- CreateIndex
CREATE INDEX "project_schedules_projectId_startAt_idx" ON "project_schedules"("projectId", "startAt");

-- CreateIndex
CREATE INDEX "project_schedules_workerId_startAt_idx" ON "project_schedules"("workerId", "startAt");

-- CreateIndex
CREATE INDEX "project_schedules_equipmentId_startAt_idx" ON "project_schedules"("equipmentId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_worker_assignments_clientSyncId_key" ON "pm_worker_assignments"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_worker_assignments_projectId_workerId_idx" ON "pm_worker_assignments"("projectId", "workerId");

-- CreateIndex
CREATE INDEX "pm_worker_assignments_taskId_idx" ON "pm_worker_assignments"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_equipment_assignments_clientSyncId_key" ON "pm_equipment_assignments"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_equipment_assignments_projectId_equipmentId_idx" ON "pm_equipment_assignments"("projectId", "equipmentId");

-- CreateIndex
CREATE INDEX "pm_equipment_assignments_taskId_idx" ON "pm_equipment_assignments"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "permits_clientSyncId_key" ON "permits"("clientSyncId");

-- CreateIndex
CREATE INDEX "permits_projectId_permitType_status_idx" ON "permits"("projectId", "permitType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "veripm_permits_pm_permit_id_key" ON "veripm_permits"("pm_permit_id");

-- CreateIndex
CREATE UNIQUE INDEX "veripm_permits_fieldos_task_id_key" ON "veripm_permits"("fieldos_task_id");

-- CreateIndex
CREATE INDEX "veripm_permits_company_id_status_idx" ON "veripm_permits"("company_id", "status");

-- CreateIndex
CREATE INDEX "veripm_permits_project_id_permit_type_status_idx" ON "veripm_permits"("project_id", "permit_type", "status");

-- CreateIndex
CREATE INDEX "veripm_permits_contractor_id_idx" ON "veripm_permits"("contractor_id");

-- CreateIndex
CREATE INDEX "veripm_permits_fieldos_task_id_idx" ON "veripm_permits"("fieldos_task_id");

-- CreateIndex
CREATE INDEX "veripm_permit_activity_permit_id_occurred_at_idx" ON "veripm_permit_activity"("permit_id", "occurred_at");

-- CreateIndex
CREATE INDEX "veripm_permit_activity_kind_occurred_at_idx" ON "veripm_permit_activity"("kind", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "permit_versions_permitId_version_key" ON "permit_versions"("permitId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "pm_attachments_clientSyncId_key" ON "pm_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_attachments_entityType_entityId_idx" ON "pm_attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "pm_attachments_projectId_status_idx" ON "pm_attachments"("projectId", "status");

-- CreateIndex
CREATE INDEX "pm_attachments_companyId_createdAt_idx" ON "pm_attachments"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_annotations_clientSyncId_key" ON "attachment_annotations"("clientSyncId");

-- CreateIndex
CREATE INDEX "attachment_annotations_attachmentId_createdAt_idx" ON "attachment_annotations"("attachmentId", "createdAt");

-- CreateIndex
CREATE INDEX "attachment_audit_attachmentId_createdAt_idx" ON "attachment_audit"("attachmentId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_audit_projectId_createdAt_idx" ON "pm_audit"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "pm_audit_entityType_entityId_createdAt_idx" ON "pm_audit"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_project_offline_cache_projectId_cacheKey_key" ON "pm_project_offline_cache"("projectId", "cacheKey");

-- CreateIndex
CREATE INDEX "offline_cache_deviceId_syncStatus_idx" ON "offline_cache"("deviceId", "syncStatus");

-- CreateIndex
CREATE INDEX "offline_cache_projectId_moduleType_idx" ON "offline_cache"("projectId", "moduleType");

-- CreateIndex
CREATE UNIQUE INDEX "offline_cache_deviceId_moduleType_recordId_key" ON "offline_cache"("deviceId", "moduleType", "recordId");

-- CreateIndex
CREATE INDEX "offline_conflicts_deviceId_resolvedAt_idx" ON "offline_conflicts"("deviceId", "resolvedAt");

-- CreateIndex
CREATE INDEX "offline_conflicts_moduleType_recordId_idx" ON "offline_conflicts"("moduleType", "recordId");

-- CreateIndex
CREATE INDEX "offline_audit_deviceId_createdAt_idx" ON "offline_audit"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "offline_audit_eventType_createdAt_idx" ON "offline_audit"("eventType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "hazards_clientSyncId_key" ON "hazards"("clientSyncId");

-- CreateIndex
CREATE INDEX "hazards_companyId_scopeLevel_status_idx" ON "hazards"("companyId", "scopeLevel", "status");

-- CreateIndex
CREATE INDEX "hazards_projectId_status_idx" ON "hazards"("projectId", "status");

-- CreateIndex
CREATE INDEX "hazards_taskId_idx" ON "hazards"("taskId");

-- CreateIndex
CREATE INDEX "hazards_workerId_idx" ON "hazards"("workerId");

-- CreateIndex
CREATE INDEX "hazards_parentHazardId_idx" ON "hazards"("parentHazardId");

-- CreateIndex
CREATE INDEX "hazards_sourceType_sourceId_idx" ON "hazards"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_versions_hazardId_version_key" ON "hazard_versions"("hazardId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_energy_hazardId_energyType_key" ON "hazard_energy"("hazardId", "energyType");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_controls_hazardId_controlId_key" ON "hazard_controls"("hazardId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_training_hazardId_trainingCode_key" ON "hazard_training"("hazardId", "trainingCode");

-- CreateIndex
CREATE INDEX "hazard_equipment_hazardId_idx" ON "hazard_equipment"("hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "hazard_ppe_hazardId_ppeType_key" ON "hazard_ppe"("hazardId", "ppeType");

-- CreateIndex
CREATE UNIQUE INDEX "controls_clientSyncId_key" ON "controls"("clientSyncId");

-- CreateIndex
CREATE INDEX "controls_companyId_scopeLevel_status_idx" ON "controls"("companyId", "scopeLevel", "status");

-- CreateIndex
CREATE INDEX "controls_projectId_controlType_status_idx" ON "controls"("projectId", "controlType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "control_versions_controlId_version_key" ON "control_versions"("controlId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "control_training_controlId_trainingCode_key" ON "control_training"("controlId", "trainingCode");

-- CreateIndex
CREATE INDEX "control_equipment_controlId_idx" ON "control_equipment"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "control_ppe_controlId_ppeType_key" ON "control_ppe"("controlId", "ppeType");

-- CreateIndex
CREATE INDEX "control_verification_controlId_stepOrder_idx" ON "control_verification"("controlId", "stepOrder");

-- CreateIndex
CREATE INDEX "hazard_audit_companyId_createdAt_idx" ON "hazard_audit"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "hazard_audit_hazardId_createdAt_idx" ON "hazard_audit"("hazardId", "createdAt");

-- CreateIndex
CREATE INDEX "control_audit_companyId_createdAt_idx" ON "control_audit"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "control_audit_controlId_createdAt_idx" ON "control_audit"("controlId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pm_hc_attachments_clientSyncId_key" ON "pm_hc_attachments"("clientSyncId");

-- CreateIndex
CREATE INDEX "pm_hc_attachments_entityType_hazardId_idx" ON "pm_hc_attachments"("entityType", "hazardId");

-- CreateIndex
CREATE INDEX "pm_hc_attachments_controlId_idx" ON "pm_hc_attachments"("controlId");

-- CreateIndex
CREATE INDEX "pm_hc_overrides_companyId_projectId_active_idx" ON "pm_hc_overrides"("companyId", "projectId", "active");

-- CreateIndex
CREATE INDEX "pm_hc_overrides_expiresAt_idx" ON "pm_hc_overrides"("expiresAt");

-- CreateIndex
CREATE INDEX "pm_hc_offline_cache_companyId_idx" ON "pm_hc_offline_cache"("companyId");

-- CreateIndex
CREATE INDEX "pm_hc_offline_cache_projectId_idx" ON "pm_hc_offline_cache"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "pm_hc_offline_cache_cacheKey_key" ON "pm_hc_offline_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "cail_models_status_idx" ON "cail_models"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cail_models_companyId_modelKey_key" ON "cail_models"("companyId", "modelKey");

-- CreateIndex
CREATE UNIQUE INDEX "cail_model_versions_modelId_version_key" ON "cail_model_versions"("modelId", "version");

-- CreateIndex
CREATE INDEX "cail_model_audit_modelId_createdAt_idx" ON "cail_model_audit"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "cail_training_data_companyId_sourceModule_idx" ON "cail_training_data"("companyId", "sourceModule");

-- CreateIndex
CREATE INDEX "cail_training_data_projectId_taggedAt_idx" ON "cail_training_data"("projectId", "taggedAt");

-- CreateIndex
CREATE INDEX "cail_predictions_companyId_projectId_predictionType_idx" ON "cail_predictions"("companyId", "projectId", "predictionType");

-- CreateIndex
CREATE INDEX "cail_predictions_entityType_entityId_idx" ON "cail_predictions"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "cail_predictions_createdAt_idx" ON "cail_predictions"("createdAt");

-- CreateIndex
CREATE INDEX "cail_scores_companyId_projectId_scoreType_idx" ON "cail_scores"("companyId", "projectId", "scoreType");

-- CreateIndex
CREATE INDEX "cail_scores_entityType_entityId_scoreType_idx" ON "cail_scores"("entityType", "entityId", "scoreType");

-- CreateIndex
CREATE INDEX "cail_scores_computedAt_idx" ON "cail_scores"("computedAt");

-- CreateIndex
CREATE INDEX "cail_recommendations_companyId_projectId_status_idx" ON "cail_recommendations"("companyId", "projectId", "status");

-- CreateIndex
CREATE INDEX "cail_recommendations_recommendationType_idx" ON "cail_recommendations"("recommendationType");

-- CreateIndex
CREATE INDEX "cail_correlations_companyId_projectId_idx" ON "cail_correlations"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "cail_correlations_leftModule_leftEntityId_idx" ON "cail_correlations"("leftModule", "leftEntityId");

-- CreateIndex
CREATE INDEX "cail_correlations_rightModule_rightEntityId_idx" ON "cail_correlations"("rightModule", "rightEntityId");

-- CreateIndex
CREATE INDEX "cail_explainability_companyId_targetType_targetId_idx" ON "cail_explainability"("companyId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "cail_explainability_predictionId_idx" ON "cail_explainability"("predictionId");

-- CreateIndex
CREATE INDEX "cail_explainability_scoreId_idx" ON "cail_explainability"("scoreId");

-- CreateIndex
CREATE INDEX "cail_inference_logs_companyId_createdAt_idx" ON "cail_inference_logs"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "cail_inference_logs_projectId_inferenceMode_idx" ON "cail_inference_logs"("projectId", "inferenceMode");

-- CreateIndex
CREATE INDEX "cail_offline_cache_companyId_projectId_idx" ON "cail_offline_cache"("companyId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "cail_offline_cache_cacheKey_key" ON "cail_offline_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "orientation_packages_company_id_idx" ON "orientation_packages"("company_id");

-- CreateIndex
CREATE INDEX "orientation_packages_project_id_idx" ON "orientation_packages"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "orientation_versions_package_id_version_number_key" ON "orientation_versions"("package_id", "version_number");

-- CreateIndex
CREATE INDEX "orientation_assignments_package_id_scope_idx" ON "orientation_assignments"("package_id", "scope");

-- CreateIndex
CREATE INDEX "orientation_worker_progress_worker_id_status_idx" ON "orientation_worker_progress"("worker_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orientation_worker_progress_package_id_worker_id_key" ON "orientation_worker_progress"("package_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_photo_finding_client_sync_id_key" ON "pm_inspection_photo_finding"("client_sync_id");

-- CreateIndex
CREATE INDEX "pm_inspection_photo_finding_inspection_id_category_idx" ON "pm_inspection_photo_finding"("inspection_id", "category");

-- CreateIndex
CREATE INDEX "pm_inspection_photo_finding_corrective_action_id_idx" ON "pm_inspection_photo_finding"("corrective_action_id");

-- CreateIndex
CREATE INDEX "pm_inspection_photo_finding_scl_state_heca_involved_idx" ON "pm_inspection_photo_finding"("scl_state", "heca_involved");

-- CreateIndex
CREATE UNIQUE INDEX "pm_inspection_contractor_dispatch_client_sync_id_key" ON "pm_inspection_contractor_dispatch"("client_sync_id");

-- CreateIndex
CREATE INDEX "pm_inspection_contractor_dispatch_subcontractor_company_id__idx" ON "pm_inspection_contractor_dispatch"("subcontractor_company_id", "status");

-- CreateIndex
CREATE INDEX "pm_inspection_contractor_dispatch_corrective_action_id_idx" ON "pm_inspection_contractor_dispatch"("corrective_action_id");

-- CreateIndex
CREATE INDEX "pm_substance_test_pool_company_id_active_idx" ON "pm_substance_test_pool"("company_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_pool_member_pool_id_worker_id_key" ON "pm_substance_test_pool_member"("pool_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_event_client_sync_id_key" ON "pm_substance_test_event"("client_sync_id");

-- CreateIndex
CREATE INDEX "pm_substance_test_event_company_id_status_idx" ON "pm_substance_test_event"("company_id", "status");

-- CreateIndex
CREATE INDEX "pm_substance_test_event_worker_id_created_at_idx" ON "pm_substance_test_event"("worker_id", "created_at");

-- CreateIndex
CREATE INDEX "pm_substance_test_event_project_id_test_type_idx" ON "pm_substance_test_event"("project_id", "test_type");

-- CreateIndex
CREATE INDEX "pm_substance_test_event_incident_event_id_idx" ON "pm_substance_test_event"("incident_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_result_test_event_id_key" ON "pm_substance_test_result"("test_event_id");

-- CreateIndex
CREATE INDEX "pm_substance_test_result_outcome_recorded_at_idx" ON "pm_substance_test_result"("outcome", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_custody_transfer_signature_id_key" ON "pm_substance_test_custody_transfer"("signature_id");

-- CreateIndex
CREATE INDEX "pm_substance_test_custody_transfer_test_event_id_transferre_idx" ON "pm_substance_test_custody_transfer"("test_event_id", "transferred_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_custody_transfer_test_event_id_sequence_n_key" ON "pm_substance_test_custody_transfer"("test_event_id", "sequence_number");

-- CreateIndex
CREATE INDEX "pm_substance_test_signature_test_event_id_signed_at_idx" ON "pm_substance_test_signature"("test_event_id", "signed_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_substance_test_attachment_client_sync_id_key" ON "pm_substance_test_attachment"("client_sync_id");

-- CreateIndex
CREATE INDEX "pm_substance_test_attachment_test_event_id_document_type_idx" ON "pm_substance_test_attachment"("test_event_id", "document_type");

-- CreateIndex
CREATE INDEX "pm_predictive_safety_forecast_company_id_week_start_idx" ON "pm_predictive_safety_forecast"("company_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "pm_predictive_safety_forecast_company_id_project_id_week_st_key" ON "pm_predictive_safety_forecast"("company_id", "project_id", "week_start");

-- CreateIndex
CREATE INDEX "pm_contractor_portal_membership_contractor_company_id_activ_idx" ON "pm_contractor_portal_membership"("contractor_company_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "pm_contractor_portal_membership_prime_company_id_contractor_key" ON "pm_contractor_portal_membership"("prime_company_id", "contractor_company_id", "project_id");

-- CreateIndex
CREATE INDEX "pm_contractor_finding_acknowledgment_contractor_company_id__idx" ON "pm_contractor_finding_acknowledgment"("contractor_company_id", "acknowledged_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_contractor_finding_acknowledgment_deficiency_id_contract_key" ON "pm_contractor_finding_acknowledgment"("deficiency_id", "contractor_company_id");

-- CreateIndex
CREATE INDEX "pm_contractor_portal_message_contractor_company_id_created__idx" ON "pm_contractor_portal_message"("contractor_company_id", "created_at");

-- CreateIndex
CREATE INDEX "pm_contractor_portal_message_prime_company_id_contractor_co_idx" ON "pm_contractor_portal_message"("prime_company_id", "contractor_company_id");

-- CreateIndex
CREATE INDEX "pm_safety_hub_snapshot_company_id_generated_at_idx" ON "pm_safety_hub_snapshot"("company_id", "generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "pm_safety_hub_snapshot_company_id_project_id_key" ON "pm_safety_hub_snapshot"("company_id", "project_id");

-- CreateIndex
CREATE INDEX "pm_safety_evidence_index_company_id_domain_captured_at_idx" ON "pm_safety_evidence_index"("company_id", "domain", "captured_at");

-- CreateIndex
CREATE INDEX "pm_safety_evidence_index_project_id_domain_idx" ON "pm_safety_evidence_index"("project_id", "domain");

-- CreateIndex
CREATE INDEX "pm_safety_evidence_index_source_type_source_id_idx" ON "pm_safety_evidence_index"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "pm_safety_hub_event_log_company_id_occurred_at_idx" ON "pm_safety_hub_event_log"("company_id", "occurred_at");

-- CreateIndex
CREATE INDEX "pm_safety_hub_event_log_project_id_occurred_at_idx" ON "pm_safety_hub_event_log"("project_id", "occurred_at");

-- CreateIndex
CREATE INDEX "pm_safety_hub_event_log_event_name_idx" ON "pm_safety_hub_event_log"("event_name");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sms_risk_context_client_sync_id_key" ON "pm_sms_risk_context"("client_sync_id");

-- CreateIndex
CREATE INDEX "pm_sms_risk_context_company_id_scl_state_idx" ON "pm_sms_risk_context"("company_id", "scl_state");

-- CreateIndex
CREATE INDEX "pm_sms_risk_context_company_id_heca_involved_high_energy_fl_idx" ON "pm_sms_risk_context"("company_id", "heca_involved", "high_energy_flag");

-- CreateIndex
CREATE INDEX "pm_sms_risk_context_project_id_entity_type_idx" ON "pm_sms_risk_context"("project_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sms_risk_context_entity_type_entity_id_key" ON "pm_sms_risk_context"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "pm_sms_heca_library_company_id_active_idx" ON "pm_sms_heca_library"("company_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sms_heca_library_company_id_code_key" ON "pm_sms_heca_library"("company_id", "code");

-- CreateIndex
CREATE INDEX "pm_sms_weekly_risk_forecast_company_id_week_start_idx" ON "pm_sms_weekly_risk_forecast"("company_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sms_weekly_risk_forecast_company_id_project_id_week_star_key" ON "pm_sms_weekly_risk_forecast"("company_id", "project_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "pm_sms_notification_route_company_id_event_key_key" ON "pm_sms_notification_route"("company_id", "event_key");

-- CreateIndex
CREATE UNIQUE INDEX "acp_tenants_slug_key" ON "acp_tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "acp_tenants_company_id_key" ON "acp_tenants"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_roles_tenant_id_key_key" ON "acp_roles"("tenant_id", "key");

-- CreateIndex
CREATE INDEX "acp_user_roles_user_id_idx" ON "acp_user_roles"("user_id");

-- CreateIndex
CREATE INDEX "acp_user_roles_tenant_id_idx" ON "acp_user_roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_user_roles_user_id_role_id_tenant_id_key" ON "acp_user_roles"("user_id", "role_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_permissions_key_key" ON "acp_permissions"("key");

-- CreateIndex
CREATE INDEX "acp_permissions_module_idx" ON "acp_permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "acp_subscription_tiers_key_key" ON "acp_subscription_tiers"("key");

-- CreateIndex
CREATE UNIQUE INDEX "acp_tenant_subscriptions_tenant_id_key" ON "acp_tenant_subscriptions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "acp_feature_flags_key_key" ON "acp_feature_flags"("key");

-- CreateIndex
CREATE INDEX "acp_audit_logs_tenant_id_created_at_idx" ON "acp_audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "acp_audit_logs_entity_type_entity_id_idx" ON "acp_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "vera_assessment_run_engine_companyId_evaluatedAt_idx" ON "vera_assessment_run"("engine", "companyId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "vera_assessment_run_engine_workerId_evaluatedAt_idx" ON "vera_assessment_run"("engine", "workerId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "vera_assessment_run_engine_projectId_evaluatedAt_idx" ON "vera_assessment_run"("engine", "projectId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "fit_test_run_workerId_performedAt_idx" ON "fit_test_run"("workerId", "performedAt");

-- CreateIndex
CREATE INDEX "fit_test_run_tenantId_expiresAt_idx" ON "fit_test_run"("tenantId", "expiresAt");

-- CreateIndex
CREATE INDEX "fit_test_run_expiresAt_idx" ON "fit_test_run"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "vera_api_keys_key_hash_key" ON "vera_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "vera_api_keys_key_prefix_active_idx" ON "vera_api_keys"("key_prefix", "active");

-- CreateIndex
CREATE INDEX "vera_api_keys_company_id_active_idx" ON "vera_api_keys"("company_id", "active");

-- CreateIndex
CREATE INDEX "worker_wallet_bundles_worker_id_synced_at_idx" ON "worker_wallet_bundles"("worker_id", "synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "worker_wallet_bundles_worker_id_version_key" ON "worker_wallet_bundles"("worker_id", "version");

-- CreateIndex
CREATE INDEX "core_offline_sync_batches_device_id_status_idx" ON "core_offline_sync_batches"("device_id", "status");

-- CreateIndex
CREATE INDEX "core_offline_sync_batches_company_id_module_type_submitted__idx" ON "core_offline_sync_batches"("company_id", "module_type", "submitted_at");

-- CreateIndex
CREATE INDEX "core_offline_sync_conflicts_device_id_resolved_at_idx" ON "core_offline_sync_conflicts"("device_id", "resolved_at");

-- CreateIndex
CREATE INDEX "core_offline_sync_conflicts_module_type_record_key_idx" ON "core_offline_sync_conflicts"("module_type", "record_key");

-- CreateIndex
CREATE UNIQUE INDEX "event_outbox_idempotencyKey_key" ON "event_outbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "event_outbox_status_nextRetryAt_createdAt_idx" ON "event_outbox"("status", "nextRetryAt", "createdAt");

-- CreateIndex
CREATE INDEX "event_outbox_eventName_createdAt_idx" ON "event_outbox"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "event_dead_letter_eventName_createdAt_idx" ON "event_dead_letter"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "renewal_recommendations_workerId_status_idx" ON "renewal_recommendations"("workerId", "status");

-- CreateIndex
CREATE INDEX "renewal_recommendations_expiresAt_idx" ON "renewal_recommendations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "renewal_recommendations_certificationId_windowDays_key" ON "renewal_recommendations"("certificationId", "windowDays");

-- CreateIndex
CREATE INDEX "renewal_vendor_availability_cache_certType_expiresAt_idx" ON "renewal_vendor_availability_cache"("certType", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "renewal_vendor_availability_cache_certType_source_key" ON "renewal_vendor_availability_cache"("certType", "source");

-- CreateIndex
CREATE INDEX "booking_records_workerId_status_idx" ON "booking_records"("workerId", "status");

-- CreateIndex
CREATE INDEX "booking_records_recommendationId_idx" ON "booking_records"("recommendationId");

-- CreateIndex
CREATE INDEX "booking_records_vendorSource_status_idx" ON "booking_records"("vendorSource", "status");

-- CreateIndex
CREATE INDEX "renewal_vendor_sync_logs_vendorSource_action_createdAt_idx" ON "renewal_vendor_sync_logs"("vendorSource", "action", "createdAt");

-- CreateIndex
CREATE INDEX "vendor_availability_cache_certType_idx" ON "vendor_availability_cache"("certType");

-- CreateIndex
CREATE INDEX "vendor_availability_cache_vendorId_idx" ON "vendor_availability_cache"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_availability_cache_vendorId_certType_idx" ON "vendor_availability_cache"("vendorId", "certType");

-- CreateIndex
CREATE INDEX "vendor_availability_cache_lastSyncedAt_idx" ON "vendor_availability_cache"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "vendor_sync_logs_vendorId_createdAt_idx" ON "vendor_sync_logs"("vendorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_userId_key" ON "hub_worker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_workerId_key" ON "hub_worker_profiles"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_worker_profiles_jobBoardProfileId_key" ON "hub_worker_profiles"("jobBoardProfileId");

-- CreateIndex
CREATE INDEX "hub_worker_profiles_primaryTrade_locationRegion_idx" ON "hub_worker_profiles"("primaryTrade", "locationRegion");

-- CreateIndex
CREATE INDEX "hub_worker_profiles_workerId_idx" ON "hub_worker_profiles"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_company_pages_companyId_key" ON "hub_company_pages"("companyId");

-- CreateIndex
CREATE INDEX "hub_company_members_userId_idx" ON "hub_company_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hub_company_members_companyPageId_userId_key" ON "hub_company_members"("companyPageId", "userId");

-- CreateIndex
CREATE INDEX "hub_connections_addresseeUserId_status_idx" ON "hub_connections"("addresseeUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hub_connections_requesterUserId_addresseeUserId_key" ON "hub_connections"("requesterUserId", "addresseeUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_veriforge_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_veriforge_users_role_id" ON "users"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "idx_veriforge_training_assignment_user_id" ON "trainingAssignments"("userId");

-- CreateIndex
CREATE INDEX "idx_veriforge_training_assignment_module_id" ON "trainingAssignments"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "uq_veriforge_training_assignment_user_module" ON "trainingAssignments"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "idx_veriforge_verification_check_user_id" ON "verificationChecks"("userId");

-- CreateIndex
CREATE INDEX "idx_veriforge_verification_workflow_check_id" ON "verificationWorkflows"("checkId");

-- CreateIndex
CREATE UNIQUE INDEX "complianceRequirements_name_key" ON "complianceRequirements"("name");

-- CreateIndex
CREATE INDEX "idx_veriforge_audit_logs_user_id" ON "auditLogs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "anonymized_tokens_token_key" ON "anonymized_tokens"("token");

-- CreateIndex
CREATE INDEX "anonymized_tokens_plane_idx" ON "anonymized_tokens"("plane");

-- CreateIndex
CREATE INDEX "anonymized_tokens_source_id_hash_idx" ON "anonymized_tokens"("source_id_hash");

-- CreateIndex
CREATE UNIQUE INDEX "industry_projects_token_key" ON "industry_projects"("token");

-- CreateIndex
CREATE INDEX "industry_projects_industry_subtype_scale_idx" ON "industry_projects"("industry", "subtype", "scale");

-- CreateIndex
CREATE UNIQUE INDEX "industry_companies_token_key" ON "industry_companies"("token");

-- CreateIndex
CREATE INDEX "industry_companies_industry_subtype_scale_idx" ON "industry_companies"("industry", "subtype", "scale");

-- CreateIndex
CREATE INDEX "project_metrics_period_idx" ON "project_metrics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "project_metrics_project_id_period_key" ON "project_metrics"("project_id", "period");

-- CreateIndex
CREATE INDEX "company_metrics_period_idx" ON "company_metrics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "company_metrics_company_id_period_key" ON "company_metrics"("company_id", "period");

-- CreateIndex
CREATE INDEX "leading_indicators_entity_type_period_idx" ON "leading_indicators"("entity_type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "leading_indicators_entity_type_token_period_key" ON "leading_indicators"("entity_type", "token", "period");

-- CreateIndex
CREATE INDEX "visi_corrective_actions_entity_type_period_idx" ON "visi_corrective_actions"("entity_type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "visi_corrective_actions_entity_type_token_period_key" ON "visi_corrective_actions"("entity_type", "token", "period");

-- CreateIndex
CREATE INDEX "competency_profiles_entity_type_period_idx" ON "competency_profiles"("entity_type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "competency_profiles_entity_type_token_period_key" ON "competency_profiles"("entity_type", "token", "period");

-- CreateIndex
CREATE INDEX "trend_cache_entity_type_period_idx" ON "trend_cache"("entity_type", "period");

-- CreateIndex
CREATE INDEX "trend_cache_expires_at_idx" ON "trend_cache"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "trend_cache_cohort_key" ON "trend_cache"("entity_type", "industry", "subtype", "scale", "period", "report_kind", "horizon");

-- CreateIndex
CREATE UNIQUE INDEX "selector_state_user_id_key" ON "selector_state"("user_id");

-- CreateIndex
CREATE INDEX "selector_state_entity_type_idx" ON "selector_state"("entity_type");

-- CreateIndex
CREATE INDEX "sms_geo_nodes_company_id_parent_geo_node_id_idx" ON "sms_geo_nodes"("company_id", "parent_geo_node_id");

-- CreateIndex
CREATE INDEX "sms_geo_nodes_company_id_geo_level_geo_code_idx" ON "sms_geo_nodes"("company_id", "geo_level", "geo_code");

-- CreateIndex
CREATE UNIQUE INDEX "sms_geo_nodes_company_id_geo_code_key" ON "sms_geo_nodes"("company_id", "geo_code");

-- CreateIndex
CREATE INDEX "sms_geo_node_entitlements_company_id_available_idx" ON "sms_geo_node_entitlements"("company_id", "available");

-- CreateIndex
CREATE UNIQUE INDEX "sms_geo_node_entitlements_company_id_geo_node_id_key" ON "sms_geo_node_entitlements"("company_id", "geo_node_id");

-- CreateIndex
CREATE INDEX "sms_project_geo_map_company_id_site_geo_node_id_idx" ON "sms_project_geo_map"("company_id", "site_geo_node_id");

-- CreateIndex
CREATE INDEX "sms_industry_benchmark_cohorts_industry_code_region_scope_p_idx" ON "sms_industry_benchmark_cohorts"("industry_code", "region_scope", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "sms_industry_benchmark_cohorts_industry_code_region_scope_p_key" ON "sms_industry_benchmark_cohorts"("industry_code", "region_scope", "period_grain", "period_start", "metric_key");

-- CreateIndex
CREATE INDEX "sms_company_metrics_company_id_period_end_idx" ON "sms_company_metrics"("company_id", "period_end" DESC);

-- CreateIndex
CREATE INDEX "sms_company_metrics_company_id_industry_code_period_end_idx" ON "sms_company_metrics"("company_id", "industry_code", "period_end" DESC);

-- CreateIndex
CREATE INDEX "sms_company_metrics_company_id_incident_rate_per_200k_idx" ON "sms_company_metrics"("company_id", "incident_rate_per_200k");

-- CreateIndex
CREATE UNIQUE INDEX "sms_company_metrics_company_id_period_grain_period_start_key" ON "sms_company_metrics"("company_id", "period_grain", "period_start");

-- CreateIndex
CREATE INDEX "sms_project_metrics_company_id_project_id_period_end_idx" ON "sms_project_metrics"("company_id", "project_id", "period_end" DESC);

-- CreateIndex
CREATE INDEX "sms_project_metrics_site_geo_node_id_period_end_idx" ON "sms_project_metrics"("site_geo_node_id", "period_end" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sms_project_metrics_company_id_project_id_period_grain_peri_key" ON "sms_project_metrics"("company_id", "project_id", "period_grain", "period_start");

-- CreateIndex
CREATE INDEX "sms_regional_metrics_company_id_parent_geo_node_id_period_e_idx" ON "sms_regional_metrics"("company_id", "parent_geo_node_id", "period_end" DESC);

-- CreateIndex
CREATE INDEX "sms_regional_metrics_company_id_geo_code_idx" ON "sms_regional_metrics"("company_id", "geo_code");

-- CreateIndex
CREATE INDEX "sms_regional_metrics_company_id_geo_level_hotspot_score_idx" ON "sms_regional_metrics"("company_id", "geo_level", "hotspot_score" DESC);

-- CreateIndex
CREATE INDEX "sms_regional_metrics_company_id_available_idx" ON "sms_regional_metrics"("company_id", "available");

-- CreateIndex
CREATE UNIQUE INDEX "sms_regional_metrics_company_id_geo_node_id_period_grain_pe_key" ON "sms_regional_metrics"("company_id", "geo_node_id", "period_grain", "period_start");

-- CreateIndex
CREATE INDEX "sms_competency_metrics_company_id_period_grain_period_start_idx" ON "sms_competency_metrics"("company_id", "period_grain", "period_start");

-- CreateIndex
CREATE INDEX "sms_competency_metrics_company_id_project_id_role_key_compe_idx" ON "sms_competency_metrics"("company_id", "project_id", "role_key", "competency_key");

-- CreateIndex
CREATE INDEX "sms_competency_metrics_company_id_risk_index_idx" ON "sms_competency_metrics"("company_id", "risk_index" DESC);

-- CreateIndex
CREATE INDEX "sms_inspection_metrics_company_id_project_id_period_end_idx" ON "sms_inspection_metrics"("company_id", "project_id", "period_end" DESC);

-- CreateIndex
CREATE INDEX "sms_incident_metrics_company_id_project_id_period_end_idx" ON "sms_incident_metrics"("company_id", "project_id", "period_end" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sms_flha_records_sor_jha_flha_id_key" ON "sms_flha_records"("sor_jha_flha_id");

-- CreateIndex
CREATE INDEX "sms_flha_records_company_id_project_id_status_idx" ON "sms_flha_records"("company_id", "project_id", "status");

-- CreateIndex
CREATE INDEX "sms_flha_records_company_id_work_date_idx" ON "sms_flha_records"("company_id", "work_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sms_jha_records_sor_jha_flha_id_key" ON "sms_jha_records"("sor_jha_flha_id");

-- CreateIndex
CREATE INDEX "sms_jha_records_company_id_project_id_status_idx" ON "sms_jha_records"("company_id", "project_id", "status");

-- CreateIndex
CREATE INDEX "sms_jha_records_company_id_template_key_idx" ON "sms_jha_records"("company_id", "template_key");

-- CreateIndex
CREATE UNIQUE INDEX "sms_erp_records_sor_emergency_plan_id_key" ON "sms_erp_records"("sor_emergency_plan_id");

-- CreateIndex
CREATE INDEX "sms_erp_records_company_id_project_id_status_idx" ON "sms_erp_records"("company_id", "project_id", "status");

-- CreateIndex
CREATE INDEX "sms_erp_records_company_id_scenario_idx" ON "sms_erp_records"("company_id", "scenario");

-- CreateIndex
CREATE INDEX "sms_erp_drill_sessions_erp_record_id_started_at_idx" ON "sms_erp_drill_sessions"("erp_record_id", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sms_erp_drill_roster_session_id_person_key_key" ON "sms_erp_drill_roster"("session_id", "person_key");

-- CreateIndex
CREATE UNIQUE INDEX "sms_corrective_actions_sor_action_id_key" ON "sms_corrective_actions"("sor_action_id");

-- CreateIndex
CREATE INDEX "sms_corrective_actions_company_id_project_id_status_idx" ON "sms_corrective_actions"("company_id", "project_id", "status");

-- CreateIndex
CREATE INDEX "sms_corrective_actions_company_id_due_at_idx" ON "sms_corrective_actions"("company_id", "due_at");

-- CreateIndex
CREATE INDEX "sms_corrective_actions_company_id_sla_breached_idx" ON "sms_corrective_actions"("company_id", "sla_breached");

-- CreateIndex
CREATE UNIQUE INDEX "sms_safety_meetings_sor_meeting_id_key" ON "sms_safety_meetings"("sor_meeting_id");

-- CreateIndex
CREATE INDEX "sms_safety_meetings_company_id_project_id_scheduled_at_idx" ON "sms_safety_meetings"("company_id", "project_id", "scheduled_at" DESC);

-- CreateIndex
CREATE INDEX "sms_ai_insights_cache_company_id_behavior_id_expires_at_idx" ON "sms_ai_insights_cache"("company_id", "behavior_id", "expires_at");

-- CreateIndex
CREATE INDEX "sms_ai_insights_cache_company_id_project_id_behavior_id_idx" ON "sms_ai_insights_cache"("company_id", "project_id", "behavior_id");

-- CreateIndex
CREATE INDEX "sms_ai_insights_cache_expires_at_idx" ON "sms_ai_insights_cache"("expires_at");

-- CreateIndex
CREATE INDEX "sms_ai_insights_cache_company_id_input_hash_behavior_id_pag_idx" ON "sms_ai_insights_cache"("company_id", "input_hash", "behavior_id", "page_context");

-- CreateIndex
CREATE INDEX "sms_record_links_company_id_to_type_to_id_idx" ON "sms_record_links"("company_id", "to_type", "to_id");

-- CreateIndex
CREATE UNIQUE INDEX "sms_record_links_company_id_from_type_from_id_to_type_to_id_key" ON "sms_record_links"("company_id", "from_type", "from_id", "to_type", "to_id", "link_role");

-- CreateIndex
CREATE INDEX "sms_audit_log_company_id_created_at_idx" ON "sms_audit_log"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sms_audit_log_entity_type_entity_id_idx" ON "sms_audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "sms_audit_log_actor_user_id_created_at_idx" ON "sms_audit_log"("actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sms_ai_suggestion_audit_company_id_suggestion_id_idx" ON "sms_ai_suggestion_audit"("company_id", "suggestion_id");

-- CreateIndex
CREATE INDEX "sms_ai_suggestion_audit_company_id_created_at_idx" ON "sms_ai_suggestion_audit"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sms_cail_inference_logs_company_id_behavior_id_created_at_idx" ON "sms_cail_inference_logs"("company_id", "behavior_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sms_metrics_outbox_processed_at_created_at_idx" ON "sms_metrics_outbox"("processed_at", "created_at");

-- CreateIndex
CREATE INDEX "sms_metrics_outbox_company_id_event_type_idx" ON "sms_metrics_outbox"("company_id", "event_type");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseInstructors_AB_unique" ON "_CourseInstructors"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseInstructors_B_index" ON "_CourseInstructors"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_acp_tenant_id_fkey" FOREIGN KEY ("acp_tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_analytics" ADD CONSTRAINT "company_analytics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_usage_daily" ADD CONSTRAINT "company_usage_daily_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_requests" ADD CONSTRAINT "feedback_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_requests" ADD CONSTRAINT "feedback_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingIngestionRun" ADD CONSTRAINT "TrainingIngestionRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingIngestionRun" ADD CONSTRAINT "TrainingIngestionRun_coreFileId_fkey" FOREIGN KEY ("coreFileId") REFERENCES "CoreFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequirement" ADD CONSTRAINT "TrainingRequirement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreComplianceNote" ADD CONSTRAINT "CoreComplianceNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDailyLog" ADD CONSTRAINT "CoreDailyLog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreSiteRisk" ADD CONSTRAINT "CoreSiteRisk_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyObservation" ADD CONSTRAINT "SafetyObservation_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMeetingRecord" ADD CONSTRAINT "CoreMeetingRecord_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_workerUserId_fkey" FOREIGN KEY ("workerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflow" ADD CONSTRAINT "PmSafetyWorkflow_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmSafetyWorkflowEvent" ADD CONSTRAINT "PmSafetyWorkflowEvent_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "PmSafetyWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteContact" ADD CONSTRAINT "SiteContact_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_facilitatorWorkerId_fkey" FOREIGN KEY ("facilitatorWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyStation" ADD CONSTRAINT "SafetyStation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentCategory" ADD CONSTRAINT "EquipmentCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentType" ADD CONSTRAINT "EquipmentType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EquipmentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAttachment" ADD CONSTRAINT "EquipmentAttachment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMaintenance" ADD CONSTRAINT "EquipmentMaintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentCalibration" ADD CONSTRAINT "EquipmentCalibration_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationSchedule" ADD CONSTRAINT "CalibrationSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLockout" ADD CONSTRAINT "EquipmentLockout_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLockout" ADD CONSTRAINT "EquipmentLockout_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentComplianceStatus" ADD CONSTRAINT "EquipmentComplianceStatus_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentComplianceStatus" ADD CONSTRAINT "EquipmentComplianceStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentComment" ADD CONSTRAINT "IncidentComment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentComment" ADD CONSTRAINT "IncidentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_certificateSignedByInstructorId_fkey" FOREIGN KEY ("certificateSignedByInstructorId") REFERENCES "TrainingInstructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_ingestionRunId_fkey" FOREIGN KEY ("ingestionRunId") REFERENCES "TrainingIngestionRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingVerificationRun" ADD CONSTRAINT "TrainingVerificationRun_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_ledger_events" ADD CONSTRAINT "credential_ledger_events_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttestation" ADD CONSTRAINT "TrainingAttestation_attestedByWorkerId_fkey" FOREIGN KEY ("attestedByWorkerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_rules" ADD CONSTRAINT "project_compliance_rules_requiredCredentialTypeId_fkey" FOREIGN KEY ("requiredCredentialTypeId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_compliance_alerts" ADD CONSTRAINT "project_compliance_alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "project_compliance_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSyncConfig" ADD CONSTRAINT "ProviderSyncConfig_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSyncRun" ADD CONSTRAINT "ProviderSyncRun_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingInstructor" ADD CONSTRAINT "TrainingInstructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCourse" ADD CONSTRAINT "TrainingCourse_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCourseStandard" ADD CONSTRAINT "TrainingCourseStandard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderComplianceStatus" ADD CONSTRAINT "ProviderComplianceStatus_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurisdictionRequirement" ADD CONSTRAINT "JurisdictionRequirement_standardCode_fkey" FOREIGN KEY ("standardCode") REFERENCES "TrainingStandard"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurisdictionRequirement" ADD CONSTRAINT "JurisdictionRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderQualificationRule" ADD CONSTRAINT "ProviderQualificationRule_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorQualificationRule" ADD CONSTRAINT "InstructorQualificationRule_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationResult" ADD CONSTRAINT "TrainingValidationResult_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationRejection" ADD CONSTRAINT "TrainingValidationRejection_validationResultId_fkey" FOREIGN KEY ("validationResultId") REFERENCES "TrainingValidationResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingValidationRejection" ADD CONSTRAINT "TrainingValidationRejection_rejectionReasonId_fkey" FOREIGN KEY ("rejectionReasonId") REFERENCES "TrainingRejectionReason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_verification_decisions" ADD CONSTRAINT "regulatory_verification_decisions_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_verification_decisions" ADD CONSTRAINT "regulatory_verification_decisions_validation_result_id_fkey" FOREIGN KEY ("validation_result_id") REFERENCES "TrainingValidationResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_credential_nfts" ADD CONSTRAINT "training_credential_nfts_regulatory_verification_decision__fkey" FOREIGN KEY ("regulatory_verification_decision_id") REFERENCES "regulatory_verification_decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_mint_jobs" ADD CONSTRAINT "nft_mint_jobs_training_record_id_fkey" FOREIGN KEY ("training_record_id") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSiteAccess" ADD CONSTRAINT "WorkerSiteAccess_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSiteAccess" ADD CONSTRAINT "WorkerSiteAccess_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTrainingRequirement" ADD CONSTRAINT "EquipmentTrainingRequirement_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTrainingRequirement" ADD CONSTRAINT "EquipmentTrainingRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalSignoff" ADD CONSTRAINT "DigitalSignoff_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "InspectionChecklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyEvaluation" ADD CONSTRAINT "CompetencyEvaluation_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentCompetencyRequirement" ADD CONSTRAINT "EquipmentCompetencyRequirement_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentCompetencyRequirement" ADD CONSTRAINT "EquipmentCompetencyRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTypeCompetencyRequirement" ADD CONSTRAINT "EquipmentTypeCompetencyRequirement_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTypeCompetencyRequirement" ADD CONSTRAINT "EquipmentTypeCompetencyRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerWalletItem" ADD CONSTRAINT "WorkerWalletItem_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyEquipmentAuditView" ADD CONSTRAINT "CompanyEquipmentAuditView_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyEquipmentAuditView" ADD CONSTRAINT "CompanyEquipmentAuditView_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreFile" ADD CONSTRAINT "CoreFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatFile" ADD CONSTRAINT "ChatFile_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationEvent" ADD CONSTRAINT "ChatModerationEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationEvent" ADD CONSTRAINT "ChatModerationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_coreMeetingRecordId_fkey" FOREIGN KEY ("coreMeetingRecordId") REFERENCES "CoreMeetingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreActionItem" ADD CONSTRAINT "CoreActionItem_coreDailyLogId_fkey" FOREIGN KEY ("coreDailyLogId") REFERENCES "CoreDailyLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyLink" ADD CONSTRAINT "CompanyLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLink" ADD CONSTRAINT "EquipmentLink_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLink" ADD CONSTRAINT "EquipmentLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLinkWorker" ADD CONSTRAINT "EquipmentLinkWorker_equipmentLinkId_fkey" FOREIGN KEY ("equipmentLinkId") REFERENCES "EquipmentLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentLinkWorker" ADD CONSTRAINT "EquipmentLinkWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAssignment" ADD CONSTRAINT "ProjectAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentProjectAssignment" ADD CONSTRAINT "EquipmentProjectAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionMembership" ADD CONSTRAINT "UnionMembership_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionDispatch" ADD CONSTRAINT "UnionDispatch_dispatchedBy_fkey" FOREIGN KEY ("dispatchedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallProviderLink" ADD CONSTRAINT "UnionHallProviderLink_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_trainingRecordId_fkey" FOREIGN KEY ("trainingRecordId") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnionHallTrainingReceipt" ADD CONSTRAINT "UnionHallTrainingReceipt_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerMergeRecord" ADD CONSTRAINT "WorkerMergeRecord_survivorWorkerId_fkey" FOREIGN KEY ("survivorWorkerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerMergeRecord" ADD CONSTRAINT "WorkerMergeRecord_mergedWorkerId_fkey" FOREIGN KEY ("mergedWorkerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMergeRecord" ADD CONSTRAINT "EquipmentMergeRecord_survivorEquipmentId_fkey" FOREIGN KEY ("survivorEquipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMergeRecord" ADD CONSTRAINT "EquipmentMergeRecord_mergedEquipmentId_fkey" FOREIGN KEY ("mergedEquipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPE" ADD CONSTRAINT "PPE_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolInspection" ADD CONSTRAINT "ToolInspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_ppeId_fkey" FOREIGN KEY ("ppeId") REFERENCES "PPE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEInspection" ADD CONSTRAINT "PPEInspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolAssignment" ADD CONSTRAINT "ToolAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_ppeId_fkey" FOREIGN KEY ("ppeId") REFERENCES "PPE"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPEAssignment" ADD CONSTRAINT "PPEAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_unionHallId_fkey" FOREIGN KEY ("unionHallId") REFERENCES "UnionHall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedInteraction" ADD CONSTRAINT "FeedInteraction_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedInteraction" ADD CONSTRAINT "FeedInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedInteraction" ADD CONSTRAINT "FeedInteraction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FeedInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialUserFollow" ADD CONSTRAINT "SocialUserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialUserFollow" ADD CONSTRAINT "SocialUserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialActivityLog" ADD CONSTRAINT "SocialActivityLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedSubscription" ADD CONSTRAINT "FeedSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_posts" ADD CONSTRAINT "pinned_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_posts" ADD CONSTRAINT "pinned_posts_pinnedByUserId_fkey" FOREIGN KEY ("pinnedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_relationships" ADD CONSTRAINT "follow_relationships_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_trainingProviderId_fkey" FOREIGN KEY ("trainingProviderId") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trending_metrics" ADD CONSTRAINT "trending_metrics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingTopic" ADD CONSTRAINT "TrendingTopic_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherAlert" ADD CONSTRAINT "WeatherAlert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_location_history" ADD CONSTRAINT "user_location_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_alert_deliveries" ADD CONSTRAINT "weather_alert_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_alert_deliveries" ADD CONSTRAINT "weather_alert_deliveries_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "weather_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomepagePreferences" ADD CONSTRAINT "UserHomepagePreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardJobTicket" ADD CONSTRAINT "JobBoardJobTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardWorkerProfile" ADD CONSTRAINT "JobBoardWorkerProfile_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardWorkerSkill" ADD CONSTRAINT "JobBoardWorkerSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardPortfolioPhoto" ADD CONSTRAINT "JobBoardPortfolioPhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardWorkHistory" ADD CONSTRAINT "JobBoardWorkHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardWorkerEndorsement" ADD CONSTRAINT "JobBoardWorkerEndorsement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardWorkerEndorsement" ADD CONSTRAINT "JobBoardWorkerEndorsement_endorserUserId_fkey" FOREIGN KEY ("endorserUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogPostTag" ADD CONSTRAINT "SafetyBlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogPostTag" ADD CONSTRAINT "SafetyBlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SafetyBlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogRelatedPost" ADD CONSTRAINT "SafetyBlogRelatedPost_fromPostId_fkey" FOREIGN KEY ("fromPostId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogRelatedPost" ADD CONSTRAINT "SafetyBlogRelatedPost_toPostId_fkey" FOREIGN KEY ("toPostId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyArticle" ADD CONSTRAINT "SafetyArticle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyArticle" ADD CONSTRAINT "SafetyArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SafetyBlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SafetyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SafetyBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogComment" ADD CONSTRAINT "SafetyBlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogCommentVote" ADD CONSTRAINT "SafetyBlogCommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "SafetyBlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyBlogCommentVote" ADD CONSTRAINT "SafetyBlogCommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestion" ADD CONSTRAINT "ExpertQaQuestion_acceptedAnswerId_fkey" FOREIGN KEY ("acceptedAnswerId") REFERENCES "ExpertQaAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestionTag" ADD CONSTRAINT "ExpertQaQuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaQuestionTag" ADD CONSTRAINT "ExpertQaQuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ExpertQaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAttachment" ADD CONSTRAINT "ExpertQaAttachment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExpertQaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAnswer" ADD CONSTRAINT "ExpertQaAnswer_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAnswerVote" ADD CONSTRAINT "ExpertQaAnswerVote_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "ExpertQaAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertQaAnswerVote" ADD CONSTRAINT "ExpertQaAnswerVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertEndorsement" ADD CONSTRAINT "ExpertEndorsement_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertEndorsement" ADD CONSTRAINT "ExpertEndorsement_endorsedByUserId_fkey" FOREIGN KEY ("endorsedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_autoRuleId_fkey" FOREIGN KEY ("autoRuleId") REFERENCES "ModerationAutoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_expertProfileId_fkey" FOREIGN KEY ("expertProfileId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertVerificationRequest" ADD CONSTRAINT "ExpertVerificationRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_definitions" ADD CONSTRAINT "safety_form_definitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_versions" ADD CONSTRAINT "safety_form_versions_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "safety_form_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "safety_form_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_forms" ADD CONSTRAINT "safety_forms_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_submissions" ADD CONSTRAINT "safety_form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_attachments" ADD CONSTRAINT "safety_form_attachments_formId_fkey" FOREIGN KEY ("formId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_templates" ADD CONSTRAINT "safety_form_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_templates" ADD CONSTRAINT "safety_form_templates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_signatures" ADD CONSTRAINT "safety_form_signatures_formId_fkey" FOREIGN KEY ("formId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_signatures" ADD CONSTRAINT "safety_form_signatures_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_actions" ADD CONSTRAINT "safety_form_actions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_audit_log" ADD CONSTRAINT "safety_form_audit_log_formId_fkey" FOREIGN KEY ("formId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_audit_log" ADD CONSTRAINT "safety_form_audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_entry" ADD CONSTRAINT "cail_entry_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_attachment" ADD CONSTRAINT "cail_attachment_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_attachment" ADD CONSTRAINT "cail_attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_activity_log" ADD CONSTRAINT "cail_activity_log_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_activity_log" ADD CONSTRAINT "cail_activity_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection" ADD CONSTRAINT "safety_inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "safety_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspection_item" ADD CONSTRAINT "safety_inspection_item_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_observedByUserId_fkey" FOREIGN KEY ("observedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_observerCompanyId_fkey" FOREIGN KEY ("observerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbo_observation" ADD CONSTRAINT "bbo_observation_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_investigation" ADD CONSTRAINT "incident_investigation_leadInvestigatorId_fkey" FOREIGN KEY ("leadInvestigatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_corrective_action_plan" ADD CONSTRAINT "incident_corrective_action_plan_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_corrective_action_plan" ADD CONSTRAINT "incident_corrective_action_plan_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspection_cail_link" ADD CONSTRAINT "equipment_inspection_cail_link_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspection_cail_link" ADD CONSTRAINT "equipment_inspection_cail_link_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_cail_link" ADD CONSTRAINT "safety_form_cail_link_safetyFormId_fkey" FOREIGN KEY ("safetyFormId") REFERENCES "safety_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_form_cail_link" ADD CONSTRAINT "safety_form_cail_link_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_cailId_fkey" FOREIGN KEY ("cailId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons_learned_entry" ADD CONSTRAINT "lessons_learned_entry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_role" ADD CONSTRAINT "project_safety_role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_risk_snapshot" ADD CONSTRAINT "project_safety_risk_snapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_safety_plan" ADD CONSTRAINT "project_safety_plan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_zone_rules" ADD CONSTRAINT "access_zone_rules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_zone_rules" ADD CONSTRAINT "access_zone_rules_accessPointId_fkey" FOREIGN KEY ("accessPointId") REFERENCES "access_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access_grant" ADD CONSTRAINT "site_access_grant_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_document" ADD CONSTRAINT "sds_document_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "sds_document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_inventory_item" ADD CONSTRAINT "chemical_inventory_item_sdsDocumentId_fkey" FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_document" ADD CONSTRAINT "policy_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_document" ADD CONSTRAINT "policy_document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acknowledgment" ADD CONSTRAINT "policy_acknowledgment_policyDocumentId_fkey" FOREIGN KEY ("policyDocumentId") REFERENCES "policy_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acknowledgment" ADD CONSTRAINT "policy_acknowledgment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan" ADD CONSTRAINT "emergency_plan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_sessions" ADD CONSTRAINT "muster_sessions_triggeredByUser_fkey" FOREIGN KEY ("triggeredByUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_attendance" ADD CONSTRAINT "muster_attendance_musterEventId_fkey" FOREIGN KEY ("musterEventId") REFERENCES "muster_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muster_attendance" ADD CONSTRAINT "muster_attendance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_heartbeat" ADD CONSTRAINT "safety_station_heartbeat_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_taskLibraryId_fkey" FOREIGN KEY ("taskLibraryId") REFERENCES "jha_task_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha" ADD CONSTRAINT "jha_flha_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_version" ADD CONSTRAINT "jha_flha_version_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_version" ADD CONSTRAINT "jha_flha_version_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_hazard" ADD CONSTRAINT "jha_flha_hazard_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_control" ADD CONSTRAINT "jha_flha_control_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_control" ADD CONSTRAINT "jha_flha_control_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "jha_flha_hazard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_energy_source" ADD CONSTRAINT "jha_flha_energy_source_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_worker" ADD CONSTRAINT "jha_flha_worker_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_worker" ADD CONSTRAINT "jha_flha_worker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_equipment" ADD CONSTRAINT "jha_flha_equipment_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_equipment" ADD CONSTRAINT "jha_flha_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_signature" ADD CONSTRAINT "jha_flha_signature_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_signature" ADD CONSTRAINT "jha_flha_signature_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_attachment" ADD CONSTRAINT "jha_flha_attachment_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_corrective_action" ADD CONSTRAINT "jha_flha_corrective_action_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_library" ADD CONSTRAINT "hazard_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_library" ADD CONSTRAINT "hazard_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_library" ADD CONSTRAINT "control_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_library" ADD CONSTRAINT "control_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_task_library" ADD CONSTRAINT "jha_task_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_task_library" ADD CONSTRAINT "jha_task_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_audit_log" ADD CONSTRAINT "jha_flha_audit_log_jhaFlhaId_fkey" FOREIGN KEY ("jhaFlhaId") REFERENCES "jha_flha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jha_flha_audit_log" ADD CONSTRAINT "jha_flha_audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_indicator" ADD CONSTRAINT "sif_indicator_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_indicator" ADD CONSTRAINT "sif_indicator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heca_category" ADD CONSTRAINT "heca_category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heca_category" ADD CONSTRAINT "heca_category_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_event" ADD CONSTRAINT "sif_heca_event_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_score" ADD CONSTRAINT "sif_score_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heca_score" ADD CONSTRAINT "heca_score_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_link" ADD CONSTRAINT "sif_heca_link_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_corrective_action" ADD CONSTRAINT "sif_heca_corrective_action_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_audit" ADD CONSTRAINT "sif_heca_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "sif_heca_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sif_heca_audit" ADD CONSTRAINT "sif_heca_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_template" ADD CONSTRAINT "pm_inspection_template_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "pm_inspection_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "pm_inspection_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection" ADD CONSTRAINT "pm_inspection_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_subcontractorCompanyId_fkey" FOREIGN KEY ("subcontractorCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_deficiency" ADD CONSTRAINT "pm_inspection_deficiency_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_deficiencyId_fkey" FOREIGN KEY ("deficiencyId") REFERENCES "pm_inspection_deficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_attachment" ADD CONSTRAINT "pm_inspection_attachment_correctiveId_fkey" FOREIGN KEY ("correctiveId") REFERENCES "pm_inspection_corrective_action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_signature" ADD CONSTRAINT "pm_inspection_signature_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_signature" ADD CONSTRAINT "pm_inspection_signature_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_signature" ADD CONSTRAINT "pm_inspection_signature_core_file_id_fkey" FOREIGN KEY ("core_file_id") REFERENCES "CoreFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_corrective_action" ADD CONSTRAINT "pm_inspection_corrective_action_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_audit" ADD CONSTRAINT "pm_inspection_audit_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_audit" ADD CONSTRAINT "pm_inspection_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_type_library" ADD CONSTRAINT "pm_safety_event_type_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_type_library" ADD CONSTRAINT "pm_safety_event_type_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_root_cause_library" ADD CONSTRAINT "pm_root_cause_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contributing_factor_library" ADD CONSTRAINT "pm_contributing_factor_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event" ADD CONSTRAINT "pm_safety_event_pmInspectionId_fkey" FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_version" ADD CONSTRAINT "pm_safety_event_version_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_injury" ADD CONSTRAINT "pm_safety_event_injury_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_injury" ADD CONSTRAINT "pm_safety_event_injury_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_person" ADD CONSTRAINT "pm_safety_event_person_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_person" ADD CONSTRAINT "pm_safety_event_person_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_equipment" ADD CONSTRAINT "pm_safety_event_equipment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_equipment" ADD CONSTRAINT "pm_safety_event_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_witness" ADD CONSTRAINT "pm_safety_event_witness_capturedByUserId_fkey" FOREIGN KEY ("capturedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_statement" ADD CONSTRAINT "pm_safety_event_statement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_statement" ADD CONSTRAINT "pm_safety_event_statement_witnessId_fkey" FOREIGN KEY ("witnessId") REFERENCES "pm_safety_event_witness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_attachment" ADD CONSTRAINT "pm_safety_event_attachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_root_cause" ADD CONSTRAINT "pm_safety_event_root_cause_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_contributing_factor" ADD CONSTRAINT "pm_safety_event_contributing_factor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_corrective_action" ADD CONSTRAINT "pm_safety_event_corrective_action_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_investigation" ADD CONSTRAINT "pm_safety_event_investigation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_investigation" ADD CONSTRAINT "pm_safety_event_investigation_lead_investigator_id_fkey" FOREIGN KEY ("lead_investigator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_audit" ADD CONSTRAINT "pm_safety_event_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "pm_safety_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_event_audit" ADD CONSTRAINT "pm_safety_event_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_capa_company_config" ADD CONSTRAINT "pm_capa_company_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_parentActionId_fkey" FOREIGN KEY ("parentActionId") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_assignments" ADD CONSTRAINT "corrective_action_assignments_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_assignments" ADD CONSTRAINT "corrective_action_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_escalations" ADD CONSTRAINT "corrective_action_escalations_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_verifications" ADD CONSTRAINT "corrective_action_verifications_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_verifications" ADD CONSTRAINT "corrective_action_verifications_verifierUserId_fkey" FOREIGN KEY ("verifierUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_attachments" ADD CONSTRAINT "corrective_action_attachments_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_corrective_action_signature" ADD CONSTRAINT "pm_corrective_action_signature_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_audit" ADD CONSTRAINT "corrective_action_audit_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_audit" ADD CONSTRAINT "corrective_action_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_versions" ADD CONSTRAINT "corrective_action_versions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_action_links" ADD CONSTRAINT "corrective_action_links_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_capa_overrides" ADD CONSTRAINT "pm_capa_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_capa_overrides" ADD CONSTRAINT "pm_capa_overrides_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_capa_offline_cache" ADD CONSTRAINT "pm_capa_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_capa_offline_cache" ADD CONSTRAINT "pm_capa_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_library_categories" ADD CONSTRAINT "topic_library_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_library_categories" ADD CONSTRAINT "topic_library_categories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_library" ADD CONSTRAINT "topic_library_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "topic_library_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_templates" ADD CONSTRAINT "safety_meeting_templates_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "safety_meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "safety_meeting_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_facilitatorWorkerId_fkey" FOREIGN KEY ("facilitatorWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_cailEntryId_fkey" FOREIGN KEY ("cailEntryId") REFERENCES "cail_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_safetyStationId_fkey" FOREIGN KEY ("safetyStationId") REFERENCES "SafetyStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meetings" ADD CONSTRAINT "safety_meetings_pmInspectionId_fkey" FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_topics" ADD CONSTRAINT "safety_meeting_topics_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_topics" ADD CONSTRAINT "safety_meeting_topics_topicLibraryId_fkey" FOREIGN KEY ("topicLibraryId") REFERENCES "topic_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_attendees" ADD CONSTRAINT "safety_meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_attendees" ADD CONSTRAINT "safety_meeting_attendees_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "safety_meeting_attendees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_signatures" ADD CONSTRAINT "safety_meeting_signatures_signerWorkerId_fkey" FOREIGN KEY ("signerWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "safety_meeting_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_attachments" ADD CONSTRAINT "safety_meeting_attachments_correctiveActionId_fkey" FOREIGN KEY ("correctiveActionId") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "safety_meeting_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_corrective_actions" ADD CONSTRAINT "safety_meeting_corrective_actions_correctiveActionId_fkey" FOREIGN KEY ("correctiveActionId") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_audit" ADD CONSTRAINT "safety_meeting_audit_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "safety_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_meeting_audit" ADD CONSTRAINT "safety_meeting_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_access_meeting_requirement" ADD CONSTRAINT "site_access_meeting_requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_version" ADD CONSTRAINT "sds_version_sdsDocumentId_fkey" FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sds_attachment" ADD CONSTRAINT "sds_attachment_sdsDocumentId_fkey" FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_controlled_document" ADD CONSTRAINT "pm_controlled_document_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_attachment" ADD CONSTRAINT "document_attachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_sdsDocumentId_fkey" FOREIGN KEY ("sdsDocumentId") REFERENCES "sds_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acknowledgment" ADD CONSTRAINT "document_acknowledgment_controlledDocumentId_fkey" FOREIGN KEY ("controlledDocumentId") REFERENCES "pm_controlled_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturer_instruction" ADD CONSTRAINT "manufacturer_instruction_controlledDocId_fkey" FOREIGN KEY ("controlledDocId") REFERENCES "pm_controlled_document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_audit" ADD CONSTRAINT "document_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_certifications" ADD CONSTRAINT "equipment_certifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_certifications" ADD CONSTRAINT "equipment_certifications_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_pmInspectionId_fkey" FOREIGN KEY ("pmInspectionId") REFERENCES "pm_inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_inspection_items" ADD CONSTRAINT "equipment_inspection_items_equipmentInspectionId_fkey" FOREIGN KEY ("equipmentInspectionId") REFERENCES "equipment_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_failures" ADD CONSTRAINT "equipment_failures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_failures" ADD CONSTRAINT "equipment_failures_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_loto" ADD CONSTRAINT "equipment_loto_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_loto" ADD CONSTRAINT "equipment_loto_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_equipment_authorizations" ADD CONSTRAINT "worker_equipment_authorizations_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_condition_scores" ADD CONSTRAINT "equipment_condition_scores_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignment_audit" ADD CONSTRAINT "equipment_assignment_audit_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_audit" ADD CONSTRAINT "equipment_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan_versions" ADD CONSTRAINT "emergency_plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "emergency_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan_acknowledgment" ADD CONSTRAINT "emergency_plan_acknowledgment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "emergency_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_plan_acknowledgment" ADD CONSTRAINT "emergency_plan_acknowledgment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_event_people" ADD CONSTRAINT "emergency_event_people_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_event_people" ADD CONSTRAINT "emergency_event_people_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_event_equipment" ADD CONSTRAINT "emergency_event_equipment_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_event_attachments" ADD CONSTRAINT "emergency_event_attachments_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_notifications" ADD CONSTRAINT "emergency_notifications_musterEventId_fkey" FOREIGN KEY ("musterEventId") REFERENCES "muster_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_equipment" ADD CONSTRAINT "emergency_equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_equipment_inspections" ADD CONSTRAINT "emergency_equipment_inspections_emergencyEquipmentId_fkey" FOREIGN KEY ("emergencyEquipmentId") REFERENCES "emergency_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_site_emergency_lock" ADD CONSTRAINT "pm_site_emergency_lock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_site_emergency_lock" ADD CONSTRAINT "pm_site_emergency_lock_emergencyEventId_fkey" FOREIGN KEY ("emergencyEventId") REFERENCES "emergency_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_audit" ADD CONSTRAINT "emergency_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_accessPointId_fkey" FOREIGN KEY ("accessPointId") REFERENCES "access_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attempts" ADD CONSTRAINT "access_attempts_overrideId_fkey" FOREIGN KEY ("overrideId") REFERENCES "access_overrides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_denials" ADD CONSTRAINT "access_denials_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "access_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_overrides" ADD CONSTRAINT "access_overrides_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_attachments" ADD CONSTRAINT "access_attachments_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "access_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_access_requirements" ADD CONSTRAINT "worker_access_requirements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_access_requirements" ADD CONSTRAINT "worker_access_requirements_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_access_requirements" ADD CONSTRAINT "equipment_access_requirements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_access_requirements" ADD CONSTRAINT "equipment_access_requirements_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_audit" ADD CONSTRAINT "access_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_access_logs" ADD CONSTRAINT "safety_station_access_logs_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_access_logs" ADD CONSTRAINT "safety_station_access_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_equipment_logs" ADD CONSTRAINT "safety_station_equipment_logs_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_equipment_logs" ADD CONSTRAINT "safety_station_equipment_logs_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_muster_logs" ADD CONSTRAINT "safety_station_muster_logs_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_muster_logs" ADD CONSTRAINT "safety_station_muster_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_offline_cache" ADD CONSTRAINT "safety_station_offline_cache_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_attachments" ADD CONSTRAINT "safety_station_attachments_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "SafetyStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_station_audit" ADD CONSTRAINT "safety_station_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_profiles" ADD CONSTRAINT "pm_project_safety_profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_profiles" ADD CONSTRAINT "pm_project_safety_profiles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_profiles" ADD CONSTRAINT "pm_project_safety_profiles_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_profile_versions" ADD CONSTRAINT "pm_project_safety_profile_versions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pm_project_safety_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_profile_versions" ADD CONSTRAINT "pm_project_safety_profile_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_hazards" ADD CONSTRAINT "pm_project_hazards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_hazards" ADD CONSTRAINT "pm_project_hazards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_hazards" ADD CONSTRAINT "pm_project_hazards_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pm_project_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_controls" ADD CONSTRAINT "pm_project_controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_controls" ADD CONSTRAINT "pm_project_controls_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_controls" ADD CONSTRAINT "pm_project_controls_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pm_project_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_overrides" ADD CONSTRAINT "pm_project_safety_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_overrides" ADD CONSTRAINT "pm_project_safety_overrides_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_overrides" ADD CONSTRAINT "pm_project_safety_overrides_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pm_project_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_overrides" ADD CONSTRAINT "pm_project_safety_overrides_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_context_audit" ADD CONSTRAINT "pm_project_safety_context_audit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pm_project_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_context_audit" ADD CONSTRAINT "pm_project_safety_context_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_safety_offline_cache" ADD CONSTRAINT "pm_project_safety_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_profiles" ADD CONSTRAINT "company_safety_profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_profiles" ADD CONSTRAINT "company_safety_profiles_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_profile_versions" ADD CONSTRAINT "company_safety_profile_versions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_profile_versions" ADD CONSTRAINT "company_safety_profile_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hazard_library" ADD CONSTRAINT "company_hazard_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hazard_library" ADD CONSTRAINT "company_hazard_library_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_control_library" ADD CONSTRAINT "company_control_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_control_library" ADD CONSTRAINT "company_control_library_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_training_matrix" ADD CONSTRAINT "company_training_matrix_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_training_matrix" ADD CONSTRAINT "company_training_matrix_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policies" ADD CONSTRAINT "company_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policies" ADD CONSTRAINT "company_policies_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policy_versions" ADD CONSTRAINT "company_policy_versions_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "company_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policy_acknowledgments" ADD CONSTRAINT "company_policy_acknowledgments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "company_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_policy_acknowledgments" ADD CONSTRAINT "company_policy_acknowledgments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_sds_library" ADD CONSTRAINT "company_sds_library_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_sds_versions" ADD CONSTRAINT "company_sds_versions_sdsId_fkey" FOREIGN KEY ("sdsId") REFERENCES "company_sds_library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_emergency_plans" ADD CONSTRAINT "company_emergency_plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_emergency_plan_versions" ADD CONSTRAINT "company_emergency_plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "company_emergency_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_equipment_rules" ADD CONSTRAINT "company_equipment_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_equipment_rules" ADD CONSTRAINT "company_equipment_rules_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_zone_templates" ADD CONSTRAINT "company_zone_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_zone_templates" ADD CONSTRAINT "company_zone_templates_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_overrides" ADD CONSTRAINT "company_safety_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_overrides" ADD CONSTRAINT "company_safety_overrides_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_overrides" ADD CONSTRAINT "company_safety_overrides_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_audit" ADD CONSTRAINT "company_safety_audit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_safety_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_audit" ADD CONSTRAINT "company_safety_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_safety_offline_cache" ADD CONSTRAINT "company_safety_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_training" ADD CONSTRAINT "worker_training_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_training" ADD CONSTRAINT "worker_training_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_competencies" ADD CONSTRAINT "worker_competencies_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_competencies" ADD CONSTRAINT "worker_competencies_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_authorizations" ADD CONSTRAINT "worker_authorizations_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_authorizations" ADD CONSTRAINT "worker_authorizations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_medical_restrictions" ADD CONSTRAINT "worker_medical_restrictions_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_medical_restrictions" ADD CONSTRAINT "worker_medical_restrictions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_hazard_exposure" ADD CONSTRAINT "worker_hazard_exposure_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_hazard_exposure" ADD CONSTRAINT "worker_hazard_exposure_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_incident_history" ADD CONSTRAINT "worker_incident_history_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_incident_history" ADD CONSTRAINT "worker_incident_history_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_corrective_actions" ADD CONSTRAINT "worker_corrective_actions_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_corrective_actions" ADD CONSTRAINT "worker_corrective_actions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_access_logs" ADD CONSTRAINT "worker_access_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_access_logs" ADD CONSTRAINT "worker_access_logs_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_overrides" ADD CONSTRAINT "worker_overrides_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_overrides" ADD CONSTRAINT "worker_overrides_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_safety_scores" ADD CONSTRAINT "worker_safety_scores_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_safety_scores" ADD CONSTRAINT "worker_safety_scores_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_safety_audit" ADD CONSTRAINT "worker_safety_audit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_safety_audit" ADD CONSTRAINT "worker_safety_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_safety_offline_cache" ADD CONSTRAINT "worker_safety_offline_cache_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_config" ADD CONSTRAINT "pm_project_config_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_packages" ADD CONSTRAINT "work_packages_configId_fkey" FOREIGN KEY ("configId") REFERENCES "pm_project_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_schedules" ADD CONSTRAINT "project_schedules_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_worker_assignments" ADD CONSTRAINT "pm_worker_assignments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_equipment_assignments" ADD CONSTRAINT "pm_equipment_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veripm_permits" ADD CONSTRAINT "veripm_permits_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veripm_permits" ADD CONSTRAINT "veripm_permits_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veripm_permits" ADD CONSTRAINT "veripm_permits_pm_permit_id_fkey" FOREIGN KEY ("pm_permit_id") REFERENCES "permits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veripm_permits" ADD CONSTRAINT "veripm_permits_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veripm_permit_activity" ADD CONSTRAINT "veripm_permit_activity_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "veripm_permits"("permit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_versions" ADD CONSTRAINT "permit_versions_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_attachments" ADD CONSTRAINT "pm_attachments_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_annotations" ADD CONSTRAINT "attachment_annotations_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "pm_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_annotations" ADD CONSTRAINT "attachment_annotations_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_audit" ADD CONSTRAINT "attachment_audit_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "pm_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_audit" ADD CONSTRAINT "attachment_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_audit" ADD CONSTRAINT "pm_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_project_offline_cache" ADD CONSTRAINT "pm_project_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_cache" ADD CONSTRAINT "offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_cache" ADD CONSTRAINT "offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_conflicts" ADD CONSTRAINT "offline_conflicts_cacheId_fkey" FOREIGN KEY ("cacheId") REFERENCES "offline_cache"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_conflicts" ADD CONSTRAINT "offline_conflicts_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_audit" ADD CONSTRAINT "offline_audit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_audit" ADD CONSTRAINT "offline_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazards" ADD CONSTRAINT "hazards_parentHazardId_fkey" FOREIGN KEY ("parentHazardId") REFERENCES "hazards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_versions" ADD CONSTRAINT "hazard_versions_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_energy" ADD CONSTRAINT "hazard_energy_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_controls" ADD CONSTRAINT "hazard_controls_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_training" ADD CONSTRAINT "hazard_training_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_equipment" ADD CONSTRAINT "hazard_equipment_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_ppe" ADD CONSTRAINT "hazard_ppe_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_parentControlId_fkey" FOREIGN KEY ("parentControlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_versions" ADD CONSTRAINT "control_versions_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_training" ADD CONSTRAINT "control_training_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_equipment" ADD CONSTRAINT "control_equipment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_ppe" ADD CONSTRAINT "control_ppe_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_verification" ADD CONSTRAINT "control_verification_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_audit" ADD CONSTRAINT "hazard_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_audit" ADD CONSTRAINT "control_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_attachments" ADD CONSTRAINT "pm_hc_attachments_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "hazards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_attachments" ADD CONSTRAINT "pm_hc_attachments_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_overrides" ADD CONSTRAINT "pm_hc_overrides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_overrides" ADD CONSTRAINT "pm_hc_overrides_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_offline_cache" ADD CONSTRAINT "pm_hc_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_hc_offline_cache" ADD CONSTRAINT "pm_hc_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_models" ADD CONSTRAINT "cail_models_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_model_versions" ADD CONSTRAINT "cail_model_versions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "cail_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_model_audit" ADD CONSTRAINT "cail_model_audit_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "cail_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_model_audit" ADD CONSTRAINT "cail_model_audit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_training_data" ADD CONSTRAINT "cail_training_data_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_training_data" ADD CONSTRAINT "cail_training_data_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_predictions" ADD CONSTRAINT "cail_predictions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_predictions" ADD CONSTRAINT "cail_predictions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_scores" ADD CONSTRAINT "cail_scores_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_scores" ADD CONSTRAINT "cail_scores_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_recommendations" ADD CONSTRAINT "cail_recommendations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_recommendations" ADD CONSTRAINT "cail_recommendations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_correlations" ADD CONSTRAINT "cail_correlations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_correlations" ADD CONSTRAINT "cail_correlations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_explainability" ADD CONSTRAINT "cail_explainability_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_explainability" ADD CONSTRAINT "cail_explainability_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_inference_logs" ADD CONSTRAINT "cail_inference_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_offline_cache" ADD CONSTRAINT "cail_offline_cache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cail_offline_cache" ADD CONSTRAINT "cail_offline_cache_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_packages" ADD CONSTRAINT "orientation_packages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_packages" ADD CONSTRAINT "orientation_packages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_packages" ADD CONSTRAINT "orientation_packages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_packages" ADD CONSTRAINT "orientation_packages_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_versions" ADD CONSTRAINT "orientation_versions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "orientation_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_versions" ADD CONSTRAINT "orientation_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_assignments" ADD CONSTRAINT "orientation_assignments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "orientation_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_worker_progress" ADD CONSTRAINT "orientation_worker_progress_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "orientation_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_worker_progress" ADD CONSTRAINT "orientation_worker_progress_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_photo_finding" ADD CONSTRAINT "pm_inspection_photo_finding_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "pm_inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_photo_finding" ADD CONSTRAINT "pm_inspection_photo_finding_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "pm_inspection_attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_photo_finding" ADD CONSTRAINT "pm_inspection_photo_finding_deficiency_id_fkey" FOREIGN KEY ("deficiency_id") REFERENCES "pm_inspection_deficiency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_photo_finding" ADD CONSTRAINT "pm_inspection_photo_finding_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_contractor_dispatch" ADD CONSTRAINT "pm_inspection_contractor_dispatch_corrective_action_id_fkey" FOREIGN KEY ("corrective_action_id") REFERENCES "corrective_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_inspection_contractor_dispatch" ADD CONSTRAINT "pm_inspection_contractor_dispatch_subcontractor_company_id_fkey" FOREIGN KEY ("subcontractor_company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_pool" ADD CONSTRAINT "pm_substance_test_pool_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_pool" ADD CONSTRAINT "pm_substance_test_pool_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_pool_member" ADD CONSTRAINT "pm_substance_test_pool_member_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pm_substance_test_pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_pool_member" ADD CONSTRAINT "pm_substance_test_pool_member_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_incident_event_id_fkey" FOREIGN KEY ("incident_event_id") REFERENCES "pm_safety_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pm_substance_test_pool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_event" ADD CONSTRAINT "pm_substance_test_event_der_user_id_fkey" FOREIGN KEY ("der_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_result" ADD CONSTRAINT "pm_substance_test_result_test_event_id_fkey" FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_result" ADD CONSTRAINT "pm_substance_test_result_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_custody_transfer" ADD CONSTRAINT "pm_substance_test_custody_transfer_test_event_id_fkey" FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_custody_transfer" ADD CONSTRAINT "pm_substance_test_custody_transfer_signature_id_fkey" FOREIGN KEY ("signature_id") REFERENCES "pm_substance_test_signature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_signature" ADD CONSTRAINT "pm_substance_test_signature_test_event_id_fkey" FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_signature" ADD CONSTRAINT "pm_substance_test_signature_signed_by_user_id_fkey" FOREIGN KEY ("signed_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_attachment" ADD CONSTRAINT "pm_substance_test_attachment_test_event_id_fkey" FOREIGN KEY ("test_event_id") REFERENCES "pm_substance_test_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_substance_test_attachment" ADD CONSTRAINT "pm_substance_test_attachment_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_predictive_safety_forecast" ADD CONSTRAINT "pm_predictive_safety_forecast_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_predictive_safety_forecast" ADD CONSTRAINT "pm_predictive_safety_forecast_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_membership" ADD CONSTRAINT "pm_contractor_portal_membership_prime_company_id_fkey" FOREIGN KEY ("prime_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_membership" ADD CONSTRAINT "pm_contractor_portal_membership_contractor_company_id_fkey" FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_membership" ADD CONSTRAINT "pm_contractor_portal_membership_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_finding_acknowledgment" ADD CONSTRAINT "pm_contractor_finding_acknowledgment_deficiency_id_fkey" FOREIGN KEY ("deficiency_id") REFERENCES "pm_inspection_deficiency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_finding_acknowledgment" ADD CONSTRAINT "pm_contractor_finding_acknowledgment_contractor_company_id_fkey" FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_finding_acknowledgment" ADD CONSTRAINT "pm_contractor_finding_acknowledgment_acknowledged_by_user__fkey" FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_message" ADD CONSTRAINT "pm_contractor_portal_message_prime_company_id_fkey" FOREIGN KEY ("prime_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_message" ADD CONSTRAINT "pm_contractor_portal_message_contractor_company_id_fkey" FOREIGN KEY ("contractor_company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_contractor_portal_message" ADD CONSTRAINT "pm_contractor_portal_message_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_hub_snapshot" ADD CONSTRAINT "pm_safety_hub_snapshot_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_hub_snapshot" ADD CONSTRAINT "pm_safety_hub_snapshot_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_evidence_index" ADD CONSTRAINT "pm_safety_evidence_index_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_evidence_index" ADD CONSTRAINT "pm_safety_evidence_index_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_evidence_index" ADD CONSTRAINT "pm_safety_evidence_index_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_hub_event_log" ADD CONSTRAINT "pm_safety_hub_event_log_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_hub_event_log" ADD CONSTRAINT "pm_safety_hub_event_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_safety_hub_event_log" ADD CONSTRAINT "pm_safety_hub_event_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_risk_context" ADD CONSTRAINT "pm_sms_risk_context_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_risk_context" ADD CONSTRAINT "pm_sms_risk_context_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_risk_context" ADD CONSTRAINT "pm_sms_risk_context_heca_library_entry_id_fkey" FOREIGN KEY ("heca_library_entry_id") REFERENCES "pm_sms_heca_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_heca_library" ADD CONSTRAINT "pm_sms_heca_library_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_heca_library" ADD CONSTRAINT "pm_sms_heca_library_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_weekly_risk_forecast" ADD CONSTRAINT "pm_sms_weekly_risk_forecast_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_weekly_risk_forecast" ADD CONSTRAINT "pm_sms_weekly_risk_forecast_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pm_sms_notification_route" ADD CONSTRAINT "pm_sms_notification_route_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenants" ADD CONSTRAINT "acp_tenants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_roles" ADD CONSTRAINT "acp_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_user_roles" ADD CONSTRAINT "acp_user_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "acp_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_role_permissions" ADD CONSTRAINT "acp_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "acp_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenant_subscriptions" ADD CONSTRAINT "acp_tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenant_subscriptions" ADD CONSTRAINT "acp_tenant_subscriptions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "acp_subscription_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenant_feature_flags" ADD CONSTRAINT "acp_tenant_feature_flags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_tenant_feature_flags" ADD CONSTRAINT "acp_tenant_feature_flags_feature_flag_id_fkey" FOREIGN KEY ("feature_flag_id") REFERENCES "acp_feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "acp_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acp_audit_logs" ADD CONSTRAINT "acp_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_assessment_run" ADD CONSTRAINT "vera_assessment_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_assessment_run" ADD CONSTRAINT "vera_assessment_run_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_assessment_run" ADD CONSTRAINT "vera_assessment_run_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_assessment_run" ADD CONSTRAINT "vera_assessment_run_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fit_test_run" ADD CONSTRAINT "fit_test_run_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fit_test_run" ADD CONSTRAINT "fit_test_run_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fit_test_run" ADD CONSTRAINT "fit_test_run_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_training_provider_id_fkey" FOREIGN KEY ("training_provider_id") REFERENCES "TrainingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vera_api_keys" ADD CONSTRAINT "vera_api_keys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_wallet_bundles" ADD CONSTRAINT "worker_wallet_bundles_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_wallet_bundles" ADD CONSTRAINT "worker_wallet_bundles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_batches" ADD CONSTRAINT "core_offline_sync_batches_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_conflicts" ADD CONSTRAINT "core_offline_sync_conflicts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "core_offline_sync_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_offline_sync_conflicts" ADD CONSTRAINT "core_offline_sync_conflicts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_dead_letter" ADD CONSTRAINT "event_dead_letter_outboxId_fkey" FOREIGN KEY ("outboxId") REFERENCES "event_outbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_worker_profiles" ADD CONSTRAINT "hub_worker_profiles_jobBoardProfileId_fkey" FOREIGN KEY ("jobBoardProfileId") REFERENCES "JobBoardWorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_company_pages" ADD CONSTRAINT "hub_company_pages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_company_members" ADD CONSTRAINT "hub_company_members_companyPageId_fkey" FOREIGN KEY ("companyPageId") REFERENCES "hub_company_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_company_members" ADD CONSTRAINT "hub_company_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_connections" ADD CONSTRAINT "hub_connections_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_connections" ADD CONSTRAINT "hub_connections_addresseeUserId_fkey" FOREIGN KEY ("addresseeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainingAssignments" ADD CONSTRAINT "trainingAssignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainingAssignments" ADD CONSTRAINT "trainingAssignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "trainingModules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificationChecks" ADD CONSTRAINT "verificationChecks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificationWorkflows" ADD CONSTRAINT "verificationWorkflows_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "verificationChecks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLogs" ADD CONSTRAINT "auditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_projects" ADD CONSTRAINT "industry_projects_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_companies" ADD CONSTRAINT "industry_companies_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_metrics" ADD CONSTRAINT "project_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "industry_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics" ADD CONSTRAINT "company_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "industry_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leading_indicators" ADD CONSTRAINT "leading_indicators_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visi_corrective_actions" ADD CONSTRAINT "visi_corrective_actions_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_profiles" ADD CONSTRAINT "competency_profiles_token_fkey" FOREIGN KEY ("token") REFERENCES "anonymized_tokens"("token") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_geo_nodes" ADD CONSTRAINT "sms_geo_nodes_parent_geo_node_id_fkey" FOREIGN KEY ("parent_geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_geo_node_entitlements" ADD CONSTRAINT "sms_geo_node_entitlements_geo_node_id_fkey" FOREIGN KEY ("geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_site_geo_node_id_fkey" FOREIGN KEY ("site_geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_country_geo_node_id_fkey" FOREIGN KEY ("country_geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_project_geo_map" ADD CONSTRAINT "sms_project_geo_map_province_geo_node_id_fkey" FOREIGN KEY ("province_geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_project_metrics" ADD CONSTRAINT "sms_project_metrics_site_geo_node_id_fkey" FOREIGN KEY ("site_geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_regional_metrics" ADD CONSTRAINT "sms_regional_metrics_geo_node_id_fkey" FOREIGN KEY ("geo_node_id") REFERENCES "sms_geo_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_flha_records" ADD CONSTRAINT "sms_flha_records_jha_record_id_fkey" FOREIGN KEY ("jha_record_id") REFERENCES "sms_jha_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_jha_records" ADD CONSTRAINT "sms_jha_records_erp_record_id_fkey" FOREIGN KEY ("erp_record_id") REFERENCES "sms_erp_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_erp_drill_sessions" ADD CONSTRAINT "sms_erp_drill_sessions_erp_record_id_fkey" FOREIGN KEY ("erp_record_id") REFERENCES "sms_erp_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_erp_drill_roster" ADD CONSTRAINT "sms_erp_drill_roster_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sms_erp_drill_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_A_fkey" FOREIGN KEY ("A") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingInstructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

