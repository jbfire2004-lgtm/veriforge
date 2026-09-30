"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configService = void 0;
const auth_middleware_1 = require("../middleware/auth.middleware");
const config_repository_1 = require("../models/config.repository");
const errors_1 = require("../utils/errors");
function toEntryDto(entry) {
    return {
        id: entry.id,
        namespace: entry.namespace.name,
        key: entry.key,
        value: entry.value,
        version: entry.version,
        companyId: entry.companyId,
        updatedBy: entry.updatedBy,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
    };
}
function toNamespaceDto(ns) {
    return {
        id: ns.id,
        name: ns.name,
        description: ns.description,
        createdAt: ns.createdAt.toISOString(),
        updatedAt: ns.updatedAt.toISOString(),
    };
}
function resolveCompanyScope(auth, requestedCompanyId) {
    if (requestedCompanyId === null || requestedCompanyId === undefined) {
        return null;
    }
    if (!(0, auth_middleware_1.hasAdminRole)(auth.roles) && requestedCompanyId !== auth.company_id) {
        throw new errors_1.ForbiddenError('Cannot access another company configuration');
    }
    return requestedCompanyId;
}
function assertCompanyListAccess(auth, requestedCompanyId) {
    if (requestedCompanyId &&
        !(0, auth_middleware_1.hasAdminRole)(auth.roles) &&
        requestedCompanyId !== auth.company_id) {
        throw new errors_1.ForbiddenError('Cannot list another company configuration');
    }
}
exports.configService = {
    async listNamespaces() {
        const rows = await config_repository_1.configRepository.listNamespaces();
        return rows.map(toNamespaceDto);
    },
    async getEntry(auth, namespaceName, key, requestedCompanyId) {
        const companyId = resolveCompanyScope(auth, requestedCompanyId ?? null);
        const ns = await config_repository_1.configRepository.findNamespaceByName(namespaceName);
        if (!ns)
            throw new errors_1.NotFoundError('Namespace not found');
        const entry = await config_repository_1.configRepository.findEntry(ns.id, key, companyId);
        if (!entry)
            throw new errors_1.NotFoundError('Config entry not found');
        return toEntryDto(entry);
    },
    async listNamespace(auth, namespaceName, requestedCompanyId) {
        const ns = await config_repository_1.configRepository.findNamespaceByName(namespaceName);
        if (!ns)
            throw new errors_1.NotFoundError('Namespace not found');
        assertCompanyListAccess(auth, requestedCompanyId);
        let entries;
        if ((0, auth_middleware_1.hasAdminRole)(auth.roles)) {
            if (requestedCompanyId === undefined) {
                entries = await config_repository_1.configRepository.listByNamespace(ns.id, 'all');
            }
            else if (!requestedCompanyId) {
                entries = await config_repository_1.configRepository.listByNamespace(ns.id, 'global_only');
            }
            else {
                entries = await config_repository_1.configRepository.listByNamespace(ns.id, 'global_and_company', requestedCompanyId);
            }
        }
        else {
            entries = await config_repository_1.configRepository.listByNamespace(ns.id, 'global_and_company', auth.company_id);
        }
        return entries.map(toEntryDto);
    },
    async upsert(auth, namespaceName, key, value, requestedCompanyId, namespaceDescription) {
        if (value === undefined) {
            throw new errors_1.BadRequestError('value is required');
        }
        const companyId = requestedCompanyId === undefined || requestedCompanyId === null
            ? null
            : resolveCompanyScope(auth, requestedCompanyId);
        const ns = await config_repository_1.configRepository.ensureNamespace(namespaceName, namespaceDescription);
        const entry = await config_repository_1.configRepository.upsertEntry({
            namespaceId: ns.id,
            key,
            value: value,
            companyId,
            updatedBy: auth.user_id,
            namespaceDescription,
        });
        return toEntryDto(entry);
    },
    async delete(auth, namespaceName, key, requestedCompanyId) {
        const companyId = requestedCompanyId === undefined || requestedCompanyId === null
            ? null
            : resolveCompanyScope(auth, requestedCompanyId);
        const ns = await config_repository_1.configRepository.findNamespaceByName(namespaceName);
        if (!ns)
            throw new errors_1.NotFoundError('Namespace not found');
        const result = await config_repository_1.configRepository.softDelete(ns.id, key, companyId);
        if (result.count === 0)
            throw new errors_1.NotFoundError('Config entry not found');
    },
};
