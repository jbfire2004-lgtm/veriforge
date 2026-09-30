import { z } from 'zod';
export declare const FieldOsZoneEventTypeSchema: z.ZodEnum<["entry", "exit", "document_review", "sign_on", "permit_activation", "hazard_update", "breach"]>;
export declare const FieldOsZoneEventSourceSchema: z.ZodEnum<["gps", "ble", "qr", "nfc", "ui", "system"]>;
export declare const FieldOsZoneEventSeveritySchema: z.ZodEnum<["info", "warning", "critical"]>;
export declare const FieldOsQueuePrioritySchema: z.ZodEnum<["critical", "operational", "informational"]>;
export declare const FieldOsEventActorSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodNumber>;
    guestTokenId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: string | undefined;
    userId?: number | undefined;
    guestTokenId?: string | undefined;
}, {
    role?: string | undefined;
    userId?: number | undefined;
    guestTokenId?: string | undefined;
}>;
export declare const FieldOsEventGeoSchema: z.ZodObject<{
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    confidenceScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat?: number | undefined;
    lng?: number | undefined;
    confidenceScore?: number | undefined;
}, {
    lat?: number | undefined;
    lng?: number | undefined;
    confidenceScore?: number | undefined;
}>;
export declare const FieldOsEventVersionContextSchema: z.ZodObject<{
    zoneVersion: z.ZodOptional<z.ZodNumber>;
    policyVersion: z.ZodOptional<z.ZodNumber>;
    documentVersion: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    zoneVersion?: number | undefined;
    policyVersion?: number | undefined;
    documentVersion?: number | undefined;
}, {
    zoneVersion?: number | undefined;
    policyVersion?: number | undefined;
    documentVersion?: number | undefined;
}>;
export declare const FieldOsZoneEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    companyId: z.ZodNumber;
    projectId: z.ZodOptional<z.ZodNumber>;
    zoneId: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodString;
    actor: z.ZodOptional<z.ZodObject<{
        userId: z.ZodOptional<z.ZodNumber>;
        guestTokenId: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role?: string | undefined;
        userId?: number | undefined;
        guestTokenId?: string | undefined;
    }, {
        role?: string | undefined;
        userId?: number | undefined;
        guestTokenId?: string | undefined;
    }>>;
    eventType: z.ZodEnum<["entry", "exit", "document_review", "sign_on", "permit_activation", "hazard_update", "breach"]>;
    source: z.ZodEnum<["gps", "ble", "qr", "nfc", "ui", "system"]>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    occurredAt: z.ZodString;
    ingestedAt: z.ZodOptional<z.ZodString>;
    permitId: z.ZodOptional<z.ZodString>;
    documentId: z.ZodOptional<z.ZodString>;
    dedupeKey: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    geo: z.ZodOptional<z.ZodObject<{
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        confidenceScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lat?: number | undefined;
        lng?: number | undefined;
        confidenceScore?: number | undefined;
    }, {
        lat?: number | undefined;
        lng?: number | undefined;
        confidenceScore?: number | undefined;
    }>>;
    versions: z.ZodOptional<z.ZodObject<{
        zoneVersion: z.ZodOptional<z.ZodNumber>;
        policyVersion: z.ZodOptional<z.ZodNumber>;
        documentVersion: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        zoneVersion?: number | undefined;
        policyVersion?: number | undefined;
        documentVersion?: number | undefined;
    }, {
        zoneVersion?: number | undefined;
        policyVersion?: number | undefined;
        documentVersion?: number | undefined;
    }>>;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    signatureHash: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
    payload: Record<string, unknown>;
    severity: "critical" | "info" | "warning";
    eventId: string;
    deviceId: string;
    eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
    occurredAt: string;
    dedupeKey: string;
    projectId?: number | undefined;
    versions?: {
        zoneVersion?: number | undefined;
        policyVersion?: number | undefined;
        documentVersion?: number | undefined;
    } | undefined;
    zoneId?: string | undefined;
    actor?: {
        role?: string | undefined;
        userId?: number | undefined;
        guestTokenId?: string | undefined;
    } | undefined;
    ingestedAt?: string | undefined;
    permitId?: string | undefined;
    documentId?: string | undefined;
    correlationId?: string | undefined;
    geo?: {
        lat?: number | undefined;
        lng?: number | undefined;
        confidenceScore?: number | undefined;
    } | undefined;
    signatureHash?: string | undefined;
}, {
    companyId: number;
    source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
    eventId: string;
    deviceId: string;
    eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
    occurredAt: string;
    dedupeKey: string;
    projectId?: number | undefined;
    payload?: Record<string, unknown> | undefined;
    severity?: "critical" | "info" | "warning" | undefined;
    versions?: {
        zoneVersion?: number | undefined;
        policyVersion?: number | undefined;
        documentVersion?: number | undefined;
    } | undefined;
    zoneId?: string | undefined;
    actor?: {
        role?: string | undefined;
        userId?: number | undefined;
        guestTokenId?: string | undefined;
    } | undefined;
    ingestedAt?: string | undefined;
    permitId?: string | undefined;
    documentId?: string | undefined;
    correlationId?: string | undefined;
    geo?: {
        lat?: number | undefined;
        lng?: number | undefined;
        confidenceScore?: number | undefined;
    } | undefined;
    signatureHash?: string | undefined;
}>;
export declare const FieldOsOfflineQueueItemSchema: z.ZodObject<{
    queueId: z.ZodString;
    priority: z.ZodEnum<["critical", "operational", "informational"]>;
    event: z.ZodObject<{
        eventId: z.ZodString;
        companyId: z.ZodNumber;
        projectId: z.ZodOptional<z.ZodNumber>;
        zoneId: z.ZodOptional<z.ZodString>;
        deviceId: z.ZodString;
        actor: z.ZodOptional<z.ZodObject<{
            userId: z.ZodOptional<z.ZodNumber>;
            guestTokenId: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        }, {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        }>>;
        eventType: z.ZodEnum<["entry", "exit", "document_review", "sign_on", "permit_activation", "hazard_update", "breach"]>;
        source: z.ZodEnum<["gps", "ble", "qr", "nfc", "ui", "system"]>;
        severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
        occurredAt: z.ZodString;
        ingestedAt: z.ZodOptional<z.ZodString>;
        permitId: z.ZodOptional<z.ZodString>;
        documentId: z.ZodOptional<z.ZodString>;
        dedupeKey: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        geo: z.ZodOptional<z.ZodObject<{
            lat: z.ZodOptional<z.ZodNumber>;
            lng: z.ZodOptional<z.ZodNumber>;
            confidenceScore: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        }, {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        }>>;
        versions: z.ZodOptional<z.ZodObject<{
            zoneVersion: z.ZodOptional<z.ZodNumber>;
            policyVersion: z.ZodOptional<z.ZodNumber>;
            documentVersion: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        }, {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        }>>;
        payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        signatureHash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        payload: Record<string, unknown>;
        severity: "critical" | "info" | "warning";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }, {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        payload?: Record<string, unknown> | undefined;
        severity?: "critical" | "info" | "warning" | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }>;
    attemptCount: z.ZodDefault<z.ZodNumber>;
    firstQueuedAt: z.ZodString;
    nextAttemptAt: z.ZodOptional<z.ZodString>;
    lastErrorCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    priority: "critical" | "operational" | "informational";
    queueId: string;
    event: {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        payload: Record<string, unknown>;
        severity: "critical" | "info" | "warning";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    };
    attemptCount: number;
    firstQueuedAt: string;
    nextAttemptAt?: string | undefined;
    lastErrorCode?: string | undefined;
}, {
    priority: "critical" | "operational" | "informational";
    queueId: string;
    event: {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        payload?: Record<string, unknown> | undefined;
        severity?: "critical" | "info" | "warning" | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    };
    firstQueuedAt: string;
    attemptCount?: number | undefined;
    nextAttemptAt?: string | undefined;
    lastErrorCode?: string | undefined;
}>;
export declare const FieldOsZoneEventBatchSchema: z.ZodObject<{
    batchId: z.ZodString;
    companyId: z.ZodNumber;
    deviceId: z.ZodString;
    cursor: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        queueId: z.ZodString;
        priority: z.ZodEnum<["critical", "operational", "informational"]>;
        event: z.ZodObject<{
            eventId: z.ZodString;
            companyId: z.ZodNumber;
            projectId: z.ZodOptional<z.ZodNumber>;
            zoneId: z.ZodOptional<z.ZodString>;
            deviceId: z.ZodString;
            actor: z.ZodOptional<z.ZodObject<{
                userId: z.ZodOptional<z.ZodNumber>;
                guestTokenId: z.ZodOptional<z.ZodString>;
                role: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            }, {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            }>>;
            eventType: z.ZodEnum<["entry", "exit", "document_review", "sign_on", "permit_activation", "hazard_update", "breach"]>;
            source: z.ZodEnum<["gps", "ble", "qr", "nfc", "ui", "system"]>;
            severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
            occurredAt: z.ZodString;
            ingestedAt: z.ZodOptional<z.ZodString>;
            permitId: z.ZodOptional<z.ZodString>;
            documentId: z.ZodOptional<z.ZodString>;
            dedupeKey: z.ZodString;
            correlationId: z.ZodOptional<z.ZodString>;
            geo: z.ZodOptional<z.ZodObject<{
                lat: z.ZodOptional<z.ZodNumber>;
                lng: z.ZodOptional<z.ZodNumber>;
                confidenceScore: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            }, {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            }>>;
            versions: z.ZodOptional<z.ZodObject<{
                zoneVersion: z.ZodOptional<z.ZodNumber>;
                policyVersion: z.ZodOptional<z.ZodNumber>;
                documentVersion: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            }, {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            }>>;
            payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            signatureHash: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            payload: Record<string, unknown>;
            severity: "critical" | "info" | "warning";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        }, {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            payload?: Record<string, unknown> | undefined;
            severity?: "critical" | "info" | "warning" | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        }>;
        attemptCount: z.ZodDefault<z.ZodNumber>;
        firstQueuedAt: z.ZodString;
        nextAttemptAt: z.ZodOptional<z.ZodString>;
        lastErrorCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        priority: "critical" | "operational" | "informational";
        queueId: string;
        event: {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            payload: Record<string, unknown>;
            severity: "critical" | "info" | "warning";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        };
        attemptCount: number;
        firstQueuedAt: string;
        nextAttemptAt?: string | undefined;
        lastErrorCode?: string | undefined;
    }, {
        priority: "critical" | "operational" | "informational";
        queueId: string;
        event: {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            payload?: Record<string, unknown> | undefined;
            severity?: "critical" | "info" | "warning" | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        };
        firstQueuedAt: string;
        attemptCount?: number | undefined;
        nextAttemptAt?: string | undefined;
        lastErrorCode?: string | undefined;
    }>, "many">;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    items: {
        priority: "critical" | "operational" | "informational";
        queueId: string;
        event: {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            payload: Record<string, unknown>;
            severity: "critical" | "info" | "warning";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        };
        attemptCount: number;
        firstQueuedAt: string;
        nextAttemptAt?: string | undefined;
        lastErrorCode?: string | undefined;
    }[];
    batchId: string;
    deviceId: string;
    createdAt?: string | undefined;
    cursor?: string | undefined;
}, {
    companyId: number;
    items: {
        priority: "critical" | "operational" | "informational";
        queueId: string;
        event: {
            companyId: number;
            source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
            eventId: string;
            deviceId: string;
            eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
            occurredAt: string;
            dedupeKey: string;
            projectId?: number | undefined;
            payload?: Record<string, unknown> | undefined;
            severity?: "critical" | "info" | "warning" | undefined;
            versions?: {
                zoneVersion?: number | undefined;
                policyVersion?: number | undefined;
                documentVersion?: number | undefined;
            } | undefined;
            zoneId?: string | undefined;
            actor?: {
                role?: string | undefined;
                userId?: number | undefined;
                guestTokenId?: string | undefined;
            } | undefined;
            ingestedAt?: string | undefined;
            permitId?: string | undefined;
            documentId?: string | undefined;
            correlationId?: string | undefined;
            geo?: {
                lat?: number | undefined;
                lng?: number | undefined;
                confidenceScore?: number | undefined;
            } | undefined;
            signatureHash?: string | undefined;
        };
        firstQueuedAt: string;
        attemptCount?: number | undefined;
        nextAttemptAt?: string | undefined;
        lastErrorCode?: string | undefined;
    }[];
    batchId: string;
    deviceId: string;
    createdAt?: string | undefined;
    cursor?: string | undefined;
}>;
export declare const FieldOsZoneEventIngestResultItemSchema: z.ZodObject<{
    eventId: z.ZodString;
    queueId: z.ZodString;
    accepted: z.ZodBoolean;
    reasonCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    accepted: boolean;
    queueId: string;
    reasonCode?: string | undefined;
}, {
    eventId: string;
    accepted: boolean;
    queueId: string;
    reasonCode?: string | undefined;
}>;
export declare const FieldOsZoneEventIngestResultSchema: z.ZodObject<{
    batchId: z.ZodString;
    acceptedCount: z.ZodNumber;
    rejectedCount: z.ZodNumber;
    nextCursor: z.ZodOptional<z.ZodString>;
    results: z.ZodArray<z.ZodObject<{
        eventId: z.ZodString;
        queueId: z.ZodString;
        accepted: z.ZodBoolean;
        reasonCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        eventId: string;
        accepted: boolean;
        queueId: string;
        reasonCode?: string | undefined;
    }, {
        eventId: string;
        accepted: boolean;
        queueId: string;
        reasonCode?: string | undefined;
    }>, "many">;
    syncedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    acceptedCount: number;
    batchId: string;
    syncedAt: string;
    rejectedCount: number;
    results: {
        eventId: string;
        accepted: boolean;
        queueId: string;
        reasonCode?: string | undefined;
    }[];
    nextCursor?: string | undefined;
}, {
    acceptedCount: number;
    batchId: string;
    syncedAt: string;
    rejectedCount: number;
    results: {
        eventId: string;
        accepted: boolean;
        queueId: string;
        reasonCode?: string | undefined;
    }[];
    nextCursor?: string | undefined;
}>;
export declare const FieldOsZoneEventSyncRequestSchema: z.ZodObject<{
    companyId: z.ZodNumber;
    deviceId: z.ZodString;
    sinceCursor: z.ZodOptional<z.ZodString>;
    maxItems: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    deviceId: string;
    sinceCursor?: string | undefined;
    maxItems?: number | undefined;
}, {
    companyId: number;
    deviceId: string;
    sinceCursor?: string | undefined;
    maxItems?: number | undefined;
}>;
export declare const FieldOsZoneEventSyncResponseSchema: z.ZodObject<{
    syncedAt: z.ZodString;
    cursor: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        eventId: z.ZodString;
        companyId: z.ZodNumber;
        projectId: z.ZodOptional<z.ZodNumber>;
        zoneId: z.ZodOptional<z.ZodString>;
        deviceId: z.ZodString;
        actor: z.ZodOptional<z.ZodObject<{
            userId: z.ZodOptional<z.ZodNumber>;
            guestTokenId: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        }, {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        }>>;
        eventType: z.ZodEnum<["entry", "exit", "document_review", "sign_on", "permit_activation", "hazard_update", "breach"]>;
        source: z.ZodEnum<["gps", "ble", "qr", "nfc", "ui", "system"]>;
        severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
        occurredAt: z.ZodString;
        ingestedAt: z.ZodOptional<z.ZodString>;
        permitId: z.ZodOptional<z.ZodString>;
        documentId: z.ZodOptional<z.ZodString>;
        dedupeKey: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        geo: z.ZodOptional<z.ZodObject<{
            lat: z.ZodOptional<z.ZodNumber>;
            lng: z.ZodOptional<z.ZodNumber>;
            confidenceScore: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        }, {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        }>>;
        versions: z.ZodOptional<z.ZodObject<{
            zoneVersion: z.ZodOptional<z.ZodNumber>;
            policyVersion: z.ZodOptional<z.ZodNumber>;
            documentVersion: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        }, {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        }>>;
        payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        signatureHash: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        payload: Record<string, unknown>;
        severity: "critical" | "info" | "warning";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }, {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        payload?: Record<string, unknown> | undefined;
        severity?: "critical" | "info" | "warning" | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cursor: string;
    syncedAt: string;
    events: {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        payload: Record<string, unknown>;
        severity: "critical" | "info" | "warning";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }[];
}, {
    cursor: string;
    syncedAt: string;
    events: {
        companyId: number;
        source: "qr" | "gps" | "ble" | "nfc" | "ui" | "system";
        eventId: string;
        deviceId: string;
        eventType: "entry" | "exit" | "document_review" | "sign_on" | "permit_activation" | "hazard_update" | "breach";
        occurredAt: string;
        dedupeKey: string;
        projectId?: number | undefined;
        payload?: Record<string, unknown> | undefined;
        severity?: "critical" | "info" | "warning" | undefined;
        versions?: {
            zoneVersion?: number | undefined;
            policyVersion?: number | undefined;
            documentVersion?: number | undefined;
        } | undefined;
        zoneId?: string | undefined;
        actor?: {
            role?: string | undefined;
            userId?: number | undefined;
            guestTokenId?: string | undefined;
        } | undefined;
        ingestedAt?: string | undefined;
        permitId?: string | undefined;
        documentId?: string | undefined;
        correlationId?: string | undefined;
        geo?: {
            lat?: number | undefined;
            lng?: number | undefined;
            confidenceScore?: number | undefined;
        } | undefined;
        signatureHash?: string | undefined;
    }[];
}>;
export type FieldOsZoneEventType = z.infer<typeof FieldOsZoneEventTypeSchema>;
export type FieldOsZoneEventSource = z.infer<typeof FieldOsZoneEventSourceSchema>;
export type FieldOsZoneEventSeverity = z.infer<typeof FieldOsZoneEventSeveritySchema>;
export type FieldOsQueuePriority = z.infer<typeof FieldOsQueuePrioritySchema>;
export type FieldOsZoneEvent = z.infer<typeof FieldOsZoneEventSchema>;
export type FieldOsOfflineQueueItem = z.infer<typeof FieldOsOfflineQueueItemSchema>;
export type FieldOsZoneEventBatch = z.infer<typeof FieldOsZoneEventBatchSchema>;
export type FieldOsZoneEventIngestResult = z.infer<typeof FieldOsZoneEventIngestResultSchema>;
export type FieldOsZoneEventSyncRequest = z.infer<typeof FieldOsZoneEventSyncRequestSchema>;
export type FieldOsZoneEventSyncResponse = z.infer<typeof FieldOsZoneEventSyncResponseSchema>;
