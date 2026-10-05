"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventOutboxDelegate = eventOutboxDelegate;
exports.eventDeadLetterDelegate = eventDeadLetterDelegate;
function eventOutboxDelegate(prisma) {
    return prisma.eventOutbox;
}
function eventDeadLetterDelegate(prisma) {
    return prisma
        .eventDeadLetter;
}
//# sourceMappingURL=event-outbox.prisma.js.map