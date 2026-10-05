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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingIngestionController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const training_ingestion_service_1 = require("./training-ingestion.service");
const ingest_training_csv_dto_1 = require("./dto/ingest-training-csv.dto");
const ingest_training_rows_dto_1 = require("./dto/ingest-training-rows.dto");
let TrainingIngestionController = class TrainingIngestionController {
    constructor(ingestion) {
        this.ingestion = ingestion;
    }
    ingestCsv(dto) {
        return this.ingestion.ingestCsv(dto.companyId, dto.csv);
    }
    ingestRows(dto) {
        return this.ingestion.ingestRows(dto.companyId, dto.rows);
    }
};
exports.TrainingIngestionController = TrainingIngestionController;
__decorate([
    (0, common_1.Post)('csv'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingest_training_csv_dto_1.IngestTrainingCsvDto]),
    __metadata("design:returntype", void 0)
], TrainingIngestionController.prototype, "ingestCsv", null);
__decorate([
    (0, common_1.Post)('rows'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingest_training_rows_dto_1.IngestTrainingRowsDto]),
    __metadata("design:returntype", void 0)
], TrainingIngestionController.prototype, "ingestRows", null);
exports.TrainingIngestionController = TrainingIngestionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Controller)('training-ingestion'),
    __metadata("design:paramtypes", [training_ingestion_service_1.TrainingIngestionService])
], TrainingIngestionController);
//# sourceMappingURL=training-ingestion.controller.js.map