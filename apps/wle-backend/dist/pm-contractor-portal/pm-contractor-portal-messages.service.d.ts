import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PmContractorPortalAccessService, type PortalActor } from './pm-contractor-portal-access.service';
export declare class PmContractorPortalMessagesService {
    private readonly prisma;
    private readonly access;
    private readonly notifications?;
    constructor(prisma: PrismaService, access: PmContractorPortalAccessService, notifications?: NotificationsService);
    listThreads(actor: PortalActor, opts?: {
        primeCompanyId?: number;
        projectId?: number;
    }): Promise<{
        messages: ({
            primeCompany: {
                id: number;
                name: string;
            };
            sender: {
                id: number;
                username: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            primeCompanyId: number;
            contractorCompanyId: number;
            projectId: number | null;
            senderUserId: number;
            body: string;
            relatedType: string | null;
            relatedId: string | null;
            readAt: Date | null;
            createdAt: Date;
        })[];
    } | {
        messages: ({
            contractorCompany: {
                id: number;
                name: string;
            };
            sender: {
                id: number;
                username: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            primeCompanyId: number;
            contractorCompanyId: number;
            projectId: number | null;
            senderUserId: number;
            body: string;
            relatedType: string | null;
            relatedId: string | null;
            readAt: Date | null;
            createdAt: Date;
        })[];
    }>;
    sendMessage(actor: PortalActor, body: {
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId?: number;
        text: string;
        relatedType?: string;
        relatedId?: string;
    }): Promise<{
        primeCompany: {
            id: number;
            name: string;
        };
        sender: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        senderUserId: number;
        body: string;
        relatedType: string | null;
        relatedId: string | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    markRead(actor: PortalActor, messageId: string): Promise<{
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        senderUserId: number;
        body: string;
        relatedType: string | null;
        relatedId: string | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    private notifyRecipients;
    private contractorRecipientIds;
    private primeRecipientIds;
}
