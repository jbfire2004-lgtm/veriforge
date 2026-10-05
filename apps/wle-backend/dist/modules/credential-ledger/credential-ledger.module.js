"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialLedgerModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const credential_ledger_service_1 = require("./credential-ledger.service");
const credential_ledger_chain_service_1 = require("./credential-ledger-chain.service");
const credential_ledger_backfill_service_1 = require("./credential-ledger-backfill.service");
const credential_ledger_controller_1 = require("./credential-ledger.controller");
let CredentialLedgerModule = class CredentialLedgerModule {
};
exports.CredentialLedgerModule = CredentialLedgerModule;
exports.CredentialLedgerModule = CredentialLedgerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [credential_ledger_controller_1.CredentialLedgerController],
        providers: [
            credential_ledger_service_1.CredentialLedgerService,
            credential_ledger_chain_service_1.CredentialLedgerChainService,
            credential_ledger_backfill_service_1.CredentialLedgerBackfillService,
        ],
        exports: [
            credential_ledger_service_1.CredentialLedgerService,
            credential_ledger_chain_service_1.CredentialLedgerChainService,
            credential_ledger_backfill_service_1.CredentialLedgerBackfillService,
        ],
    })
], CredentialLedgerModule);
//# sourceMappingURL=credential-ledger.module.js.map