import { SafetyMeetingStatus } from '@prisma/client';
import { PmSafetyMeetingsService } from './pm-safety-meetings.service';
import { PmSafetyMeetingsTemplatesService } from './pm-safety-meetings-templates.service';
import { PmSafetyMeetingsTopicLibraryService } from './pm-safety-meetings-topic-library.service';
import { PmSafetyMeetingsIntelligenceService } from './pm-safety-meetings-intelligence.service';
export declare class PmSafetyMeetingsController {
    private readonly meetings;
    private readonly templates;
    private readonly topics;
    private readonly intelligence;
    constructor(meetings: PmSafetyMeetingsService, templates: PmSafetyMeetingsTemplatesService, topics: PmSafetyMeetingsTopicLibraryService, intelligence: PmSafetyMeetingsIntelligenceService);
    list(projectId?: string, companyId?: string, status?: SafetyMeetingStatus, meetingType?: string): Promise<({
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    analytics(projectId: string): Promise<{
        meetingCount: number;
        byType: Record<string, number>;
        attendanceRate: number;
        capaFromMeetings: number;
        avgQualityScore: number;
        leadingIndicators: {
            meetingsPerWeek: number;
            capaPerMeeting: number;
        };
    }>;
    workerAccess(workerId: string, projectId: string): Promise<{
        granted: boolean;
        denialReasons: string[];
        checks: Record<string, boolean>;
    }>;
    sync(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listTopics(companyId: string, projectId?: string, category?: string): Promise<({
        category: {
            id: string;
            companyId: number;
            projectId: number | null;
            code: import(".prisma/client").$Enums.TopicLibraryCategoryCode;
            name: string;
            description: string | null;
            sortOrder: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        categoryId: string | null;
        scope: import(".prisma/client").$Enums.TopicLibraryScope;
        title: string;
        summary: string | null;
        discussionPoints: import(".prisma/client").Prisma.JsonValue;
        requiredControls: import(".prisma/client").Prisma.JsonValue;
        requiredAttachments: import(".prisma/client").Prisma.JsonValue;
        isHighRisk: boolean;
        requiresSifReview: boolean;
        sifHecaTags: import(".prisma/client").Prisma.JsonValue;
        sourceRefs: import(".prisma/client").Prisma.JsonValue;
        usageCount: number;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createTopic(body: Record<string, unknown>): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        categoryId: string | null;
        scope: import(".prisma/client").$Enums.TopicLibraryScope;
        title: string;
        summary: string | null;
        discussionPoints: import(".prisma/client").Prisma.JsonValue;
        requiredControls: import(".prisma/client").Prisma.JsonValue;
        requiredAttachments: import(".prisma/client").Prisma.JsonValue;
        isHighRisk: boolean;
        requiresSifReview: boolean;
        sifHecaTags: import(".prisma/client").Prisma.JsonValue;
        sourceRefs: import(".prisma/client").Prisma.JsonValue;
        usageCount: number;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suggestTopics(projectId: string, companyId: string): Promise<import("./topic-suggest.engine").TopicSuggestion[]>;
    listTemplates(companyId: string, projectId?: string, meetingType?: string): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        name: string;
        description: string | null;
        version: number;
        status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
        agendaJson: import(".prisma/client").Prisma.JsonValue;
        requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
        publishedAt: Date | null;
        publishedByUserId: number | null;
        parentTemplateId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createTemplate(body: Record<string, unknown>): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        name: string;
        description: string | null;
        version: number;
        status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
        agendaJson: import(".prisma/client").Prisma.JsonValue;
        requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
        publishedAt: Date | null;
        publishedByUserId: number | null;
        parentTemplateId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publishTemplate(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        name: string;
        description: string | null;
        version: number;
        status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
        agendaJson: import(".prisma/client").Prisma.JsonValue;
        requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
        publishedAt: Date | null;
        publishedByUserId: number | null;
        parentTemplateId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    get(id: string): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: {
        user?: {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publish(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    start(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    complete(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    lock(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    review(id: string, body: {
        outcome: string;
        notes?: string;
    }, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addAttendee(id: string, body: {
        workerId: number;
    }, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            companyId: number | null;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        };
    } & {
        id: string;
        meetingId: string;
        workerId: number;
        status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
        checkedInAt: Date | null;
        trainingValid: boolean | null;
        equipmentAuthorized: boolean | null;
        identityVerified: boolean;
        verificationMethod: string | null;
        notes: string | null;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkIn(id: string, workerId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            companyId: number | null;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        };
    } & {
        id: string;
        meetingId: string;
        workerId: number;
        status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
        checkedInAt: Date | null;
        trainingValid: boolean | null;
        equipmentAuthorized: boolean | null;
        identityVerified: boolean;
        verificationMethod: string | null;
        notes: string | null;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    signOn(id: string, body: {
        workerId: number;
        signatureData?: string;
        signerName?: string;
    }, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        meeting: {
            template: {
                id: string;
                companyId: number;
                projectId: number | null;
                meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
                name: string;
                description: string | null;
                version: number;
                status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
                agendaJson: import(".prisma/client").Prisma.JsonValue;
                requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
                publishedAt: Date | null;
                publishedByUserId: number | null;
                parentTemplateId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            attachments: {
                id: string;
                meetingId: string;
                topicId: string | null;
                correctiveActionId: string | null;
                fileName: string | null;
                mimeType: string | null;
                storageKey: string | null;
                dataUrl: string | null;
                annotationJson: import(".prisma/client").Prisma.JsonValue | null;
                phase: string;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
            signatures: {
                id: string;
                meetingId: string;
                attendeeId: string | null;
                role: string;
                signerUserId: number | null;
                signerWorkerId: number | null;
                signatureData: string | null;
                signedAt: Date;
                clientSyncId: string | null;
            }[];
            facilitator: {
                id: number;
                firstName: string;
                lastName: string;
            };
            topics: {
                id: string;
                meetingId: string;
                topicLibraryId: string | null;
                sortOrder: number;
                title: string;
                discussionPoints: import(".prisma/client").Prisma.JsonValue;
                requiredControls: import(".prisma/client").Prisma.JsonValue;
                requiredActions: import(".prisma/client").Prisma.JsonValue;
                notes: string | null;
                isHighRisk: boolean;
                sourceModule: string | null;
                sourceId: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            attendees: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                meetingId: string;
                workerId: number;
                status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
                checkedInAt: Date | null;
                trainingValid: boolean | null;
                equipmentAuthorized: boolean | null;
                identityVerified: boolean;
                verificationMethod: string | null;
                notes: string | null;
                clientSyncId: string | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            correctiveLinks: ({
                correctiveAction: {
                    id: string;
                    status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                    title: string;
                };
            } & {
                id: string;
                meetingId: string;
                topicId: string | null;
                correctiveActionId: string;
                origin: string;
                createdAt: Date;
            })[];
        } & {
            id: string;
            companyId: number;
            projectId: number;
            siteId: number | null;
            templateId: string | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            customMeetingTypeLabel: string | null;
            status: import(".prisma/client").$Enums.SafetyMeetingStatus;
            title: string;
            locationNote: string | null;
            scheduledAt: Date | null;
            startedAt: Date | null;
            completedAt: Date | null;
            lockedAt: Date | null;
            facilitatorWorkerId: number | null;
            supervisorUserId: number | null;
            requiresSupervisorReview: boolean;
            reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
            reviewNotes: string | null;
            reviewedAt: Date | null;
            reviewedByUserId: number | null;
            qualityScore: number | null;
            engagementScore: number | null;
            cailEntryId: string | null;
            safetyStationId: number | null;
            discussionNotes: string | null;
            hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
            controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
            metadata: import(".prisma/client").Prisma.JsonValue;
            pmInspectionId: string | null;
            clientSyncId: string | null;
            clientVersion: number;
            deletedAt: Date | null;
            createdByUserId: number;
            createdAt: Date;
            updatedAt: Date;
        };
        attendee: {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        signature: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        };
        presence: {
            workerId: number;
            projectId: number;
            markedPresentAt: Date;
            source: string;
        };
    }>;
    sign(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        meetingId: string;
        attendeeId: string | null;
        role: string;
        signerUserId: number | null;
        signerWorkerId: number | null;
        signatureData: string | null;
        signedAt: Date;
        clientSyncId: string | null;
    }>;
    createCapa(id: string, body: Record<string, unknown>, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: import(".prisma/client").Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    score(id: string): Promise<import("./pm-safety-meetings-intelligence.service").MeetingQualityReport>;
    linkStation(id: string, stationId: string): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
