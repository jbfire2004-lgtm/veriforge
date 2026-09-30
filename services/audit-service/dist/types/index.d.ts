export interface AuthJwtPayload {
    sub: string;
    user_id: string;
    company_id: string;
    email?: string;
    roles?: string[];
}
export interface IngestEventInput {
    companyId: string;
    module: string;
    eventType: string;
    actorId: string;
    eventData: Record<string, unknown>;
}
export interface ListEventsQuery {
    companyId: string;
    module?: string;
    actorId?: string;
    eventType?: string;
    limit: number;
    offset: number;
    from?: Date;
    to?: Date;
}
export interface AuditEventDto {
    id: string;
    companyId: string;
    module: string;
    eventType: string;
    actorId: string;
    eventData: unknown;
    createdAt: string;
}
