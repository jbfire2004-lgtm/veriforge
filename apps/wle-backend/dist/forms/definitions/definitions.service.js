"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const definitions_loader_1 = require("./definitions.loader");
let DefinitionsService = class DefinitionsService {
    constructor(prisma, loader) {
        this.prisma = prisma;
        this.loader = loader;
    }
    async onModuleInit() {
        await this.seedDefinitions();
    }
    async seedDefinitions() {
        for (const def of this.loader.all()) {
            await this.prisma.safetyFormDefinition.upsert({
                where: { id: def.id },
                create: {
                    id: def.id,
                    name: def.name,
                    category: def.category,
                    version: def.version,
                    definition: def,
                },
                update: {
                    name: def.name,
                    category: def.category,
                    version: def.version,
                    definition: def,
                },
            });
        }
    }
    listDefinitions(category) {
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
    getDefinition(id) {
        return this.loader.get(id);
    }
    async getDefinitionFromDb(id) {
        return this.prisma.safetyFormDefinition.findUnique({ where: { id } });
    }
};
exports.DefinitionsService = DefinitionsService;
exports.DefinitionsService = DefinitionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        definitions_loader_1.DefinitionsLoader])
], DefinitionsService);
//# sourceMappingURL=definitions.service.js.map