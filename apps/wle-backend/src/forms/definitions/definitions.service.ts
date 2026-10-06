import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DefinitionsLoader } from './definitions.loader';

@Injectable()
export class DefinitionsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loader: DefinitionsLoader,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefinitions();
  }

  async seedDefinitions(): Promise<void> {
    for (const def of this.loader.all()) {
      await this.prisma.safetyFormDefinition.upsert({
        where: { id: def.id },
        create: {
          id: def.id,
          name: def.name,
          category: def.category,
          version: def.version,
          definition: def as object,
        },
        update: {
          name: def.name,
          category: def.category,
          version: def.version,
          definition: def as object,
        },
      });
    }
  }

  listDefinitions(category?: string) {
    const defs = category
      ? this.loader.byCategory(category)
      : this.loader.all();
    return defs.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      version: d.version,
      workflow: d.workflow,
    }));
  }

  getDefinition(id: string) {
    return this.loader.get(id);
  }

  async getDefinitionFromDb(id: string) {
    return this.prisma.safetyFormDefinition.findUnique({ where: { id } });
  }
}
