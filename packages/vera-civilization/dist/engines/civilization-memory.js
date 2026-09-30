"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CivilizationMemoryEngine = void 0;
let memId = 0;
class CivilizationMemoryEngine {
    recall(ctx) {
        const records = [];
        const eras = ["21st century", "22nd century", "23rd century", "Interstellar era"];
        for (const era of eras) {
            for (const domain of ["governance", "ethics", "science", "culture"]) {
                memId += 1;
                records.push({
                    id: `mem-${memId}`,
                    era,
                    domain,
                    summary: `${domain} archive ${era}: lessons improve ${domain} predictions`,
                });
            }
        }
        if ((ctx.scopes ?? []).length) {
            memId += 1;
            records.push({
                id: `mem-${memId}`,
                era: "Current",
                domain: "governance",
                summary: `Active scopes: ${ctx.scopes.length} — memory informs stability models`,
            });
        }
        return {
            records,
            centurySpan: 300,
        };
    }
}
exports.CivilizationMemoryEngine = CivilizationMemoryEngine;
//# sourceMappingURL=civilization-memory.js.map