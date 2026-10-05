import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class AcpSeedService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seedCatalog(): Promise<void>;
    private ensureCompanyAdminRole;
    private ensurePlatformAdminRole;
    private assignPlatformAdminToLegacyAdmins;
    private ensureUserRoleAssignment;
}
