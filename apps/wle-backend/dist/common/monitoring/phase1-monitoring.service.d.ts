import { AuditService } from '../../audit/audit.service';
export type Phase1AuditInput = {
    userId?: number | null;
    action: string;
    entity?: string | null;
    entityId?: number | null;
    metadata?: Record<string, unknown> | null;
    ip?: string | null;
    userAgent?: string | null;
};
export declare class Phase1MonitoringService {
    private readonly audit;
    private readonly logger;
    constructor(audit: AuditService);
    private base;
    private emit;
    processing(domain: string, action: string, data?: Record<string, unknown>): void;
    warn(domain: string, action: string, data?: Record<string, unknown>): void;
    error(domain: string, action: string, data?: Record<string, unknown>): void;
    persistAudit(input: Phase1AuditInput): Promise<void>;
}
