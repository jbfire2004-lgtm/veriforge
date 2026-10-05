import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DefinitionsLoader } from './definitions.loader';
export declare class DefinitionsService implements OnModuleInit {
    private readonly prisma;
    private readonly loader;
    constructor(prisma: PrismaService, loader: DefinitionsLoader);
    onModuleInit(): Promise<void>;
    seedDefinitions(): Promise<void>;
    listDefinitions(category?: string): {
        id: string;
        name: string;
        category: string;
        version: number;
        workflow: import("../engine/form-engine.types").SafetyFormWorkflowDefinition;
    }[];
    getDefinition(id: string): import("../engine/form-engine.types").SafetyFormDefinitionJson;
    getDefinitionFromDb(id: string): Promise<{
        id: string;
        name: string;
        category: string;
        version: number;
        definition: import(".prisma/client").Prisma.JsonValue;
        isActive: boolean;
        companyId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
