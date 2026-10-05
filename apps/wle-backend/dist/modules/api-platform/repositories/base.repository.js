"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    paginate(page = 1, pageSize = 25) {
        const p = Math.max(1, page);
        const size = Math.min(100, Math.max(1, pageSize));
        return { skip: (p - 1) * size, take: size };
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map