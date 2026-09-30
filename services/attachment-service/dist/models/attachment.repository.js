"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentRepository = void 0;
const prisma_1 = require("../db/prisma");
function toDto(row) {
    return {
        id: row.id,
        companyId: row.companyId,
        projectId: row.projectId,
        moduleType: row.moduleType,
        moduleRecordId: row.moduleRecordId,
        fileType: row.fileType,
        fileSize: row.fileSize,
        uploadedBy: row.uploadedBy,
        uploadedAt: row.uploadedAt.toISOString(),
    };
}
exports.attachmentRepository = {
    create(input) {
        const { id, ...data } = input;
        return prisma_1.prisma.attachment.create({
            data: id ? { id, ...data } : data,
        });
    },
    async findById(id, companyId) {
        const row = await prisma_1.prisma.attachment.findFirst({ where: { id, companyId } });
        return row;
    },
    toDto,
};
//# sourceMappingURL=attachment.repository.js.map