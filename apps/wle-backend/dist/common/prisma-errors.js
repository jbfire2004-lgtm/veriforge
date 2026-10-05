"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrismaUniqueViolation = isPrismaUniqueViolation;
exports.replayOrConflict = replayOrConflict;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function isPrismaUniqueViolation(err) {
    return (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002');
}
async function replayOrConflict(err, replay, message = 'Duplicate clientSyncId') {
    if (!isPrismaUniqueViolation(err))
        throw err;
    const existing = await replay();
    if (existing != null)
        return existing;
    throw new common_1.ConflictException(message);
}
//# sourceMappingURL=prisma-errors.js.map