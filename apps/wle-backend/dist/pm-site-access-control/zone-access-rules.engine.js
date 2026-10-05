"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneAccessRulesEngine = void 0;
class ZoneAccessRulesEngine {
    isWithinTimeWindow(start, end, now = new Date()) {
        if (!start && !end)
            return true;
        const mins = now.getHours() * 60 + now.getMinutes();
        const parse = (s) => {
            const [h, m] = s.split(':').map(Number);
            return h * 60 + (m !== null && m !== void 0 ? m : 0);
        };
        if (start && end) {
            const a = parse(start);
            const b = parse(end);
            if (a <= b)
                return mins >= a && mins <= b;
            return mins >= a || mins <= b;
        }
        if (start)
            return mins >= parse(start);
        if (end)
            return mins <= parse(end);
        return true;
    }
    evaluateTimeWindow(rule) {
        if (!this.isWithinTimeWindow(rule.timeWindowStart, rule.timeWindowEnd)) {
            return 'Outside permitted zone access time window';
        }
        return null;
    }
}
exports.ZoneAccessRulesEngine = ZoneAccessRulesEngine;
//# sourceMappingURL=zone-access-rules.engine.js.map