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
exports.WorkerRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_repository_1 = require("./base.repository");
let WorkerRepository = class WorkerRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    findById(id) {
        return this.prisma.worker.findUnique({
            where: { id },
            include: {
                company: true,
                trainingRecords: { include: { certification: true }, take: 50 },
            },
        });
    }
    async search(where, pagination) {
        var _a;
        const { skip, take } = this.paginate(pagination === null || pagination === void 0 ? void 0 : pagination.page, pagination === null || pagination === void 0 ? void 0 : pagination.pageSize);
        const [items, total] = await Promise.all([
            this.prisma.worker.findMany({
                where,
                skip,
                take,
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                include: { company: true },
            }),
            this.prisma.worker.count({ where }),
        ]);
        return {
            items,
            total,
            page: (_a = pagination === null || pagination === void 0 ? void 0 : pagination.page) !== null && _a !== void 0 ? _a : 1,
            pageSize: take,
        };
    }
};
exports.WorkerRepository = WorkerRepository;
exports.WorkerRepository = WorkerRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerRepository);
//# sourceMappingURL=worker.repository.js.map