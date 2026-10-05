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
exports.PmDocumentControlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_workflow_engine_1 = require("./document-workflow.engine");
const chemical_compatibility_engine_1 = require("./chemical-compatibility.engine");
const chemical_hazard_engine_1 = require("./chemical-hazard.engine");
const pm_document_cail_intelligence_service_1 = require("./pm-document-cail-intelligence.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
let PmDocumentControlService = class PmDocumentControlService {
    constructor(prisma, cail, capaAuto) {
        this.prisma = prisma;
        this.cail = cail;
        this.capaAuto = capaAuto;
        this.workflow = new document_workflow_engine_1.DocumentWorkflowEngine();
        this.compatibility = new chemical_compatibility_engine_1.ChemicalCompatibilityEngine();
        this.hazardEngine = new chemical_hazard_engine_1.ChemicalHazardEngine();
    }
    async audit(entityType, entityId, eventType, actorId, payload) {
        await this.prisma.pmDocumentAuditLog.create({
            data: {
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    listSds(filters) {
        return this.prisma.sdsDocument.findMany({
            where: Object.assign(Object.assign(Object.assign({ companyId: filters.companyId, deletedAt: null }, (filters.projectId !== undefined
                ? {
                    OR: [{ projectId: filters.projectId }, { projectId: null }],
                }
                : {})), { category: filters.category, status: filters.includeArchived ? undefined : { not: 'archived' } }), (filters.search
                ? {
                    OR: [
                        {
                            productName: {
                                contains: filters.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            manufacturer: {
                                contains: filters.search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }
                : {})),
            orderBy: [{ status: 'asc' }, { productName: 'asc' }],
            take: 300,
            include: { attachments: { take: 5 } },
        });
    }
    async createSds(data, actorId) {
        var _a, _b, _c, _d, _e;
        const doc = await this.prisma.sdsDocument.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                productName: data.productName,
                manufacturer: data.manufacturer,
                category: (_a = data.category) !== null && _a !== void 0 ? _a : 'CHEMICAL',
                status: 'draft',
                casNumbers: ((_b = data.casNumbers) !== null && _b !== void 0 ? _b : []),
                hazardClasses: ((_c = data.hazardClasses) !== null && _c !== void 0 ? _c : []),
                whmisJson: ((_d = data.whmisJson) !== null && _d !== void 0 ? _d : {}),
                metadataJson: ((_e = data.metadataJson) !== null && _e !== void 0 ? _e : {}),
                storageKey: data.storageKey,
                revisionDate: data.revisionDate,
                expiresAt: data.expiresAt,
                reviewDueAt: data.reviewDueAt,
                clientSyncId: data.clientSyncId,
            },
        });
        await this.audit('sds', doc.id, 'created', actorId);
        return doc;
    }
    deriveSdsLifecycleStatus(doc) {
        if (doc.status === 'superseded')
            return 'superseded';
        if (doc.expiresAt && doc.expiresAt < new Date())
            return 'expired';
        if (doc.status === 'published')
            return 'active';
        return 'active';
    }
    async getSds(id) {
        const doc = await this.prisma.sdsDocument.findFirst({
            where: { id, deletedAt: null },
            include: {
                versions: { orderBy: { version: 'desc' }, take: 20 },
                attachments: true,
                inventory: { include: { site: { select: { id: true, name: true } } } },
                acknowledgments: { take: 50, orderBy: { acknowledgedAt: 'desc' } },
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('SDS not found');
        const extracted = this.hazardEngine.extract(doc);
        return Object.assign(Object.assign({}, doc), { lifecycleStatus: this.deriveSdsLifecycleStatus(doc), extractedHazards: extracted.hazards, extractedControls: extracted.controls, ppeRequirements: extracted.ppeRequirements });
    }
    async extractSdsHazards(id) {
        const doc = await this.getSds(id);
        const extracted = this.hazardEngine.extract(doc);
        return Object.assign(Object.assign({ sdsId: id }, extracted), { suggestedControls: this.hazardEngine.suggestedControls(extracted.hazards) });
    }
    async scoreSds(id) {
        const doc = await this.prisma.sdsDocument.findFirst({
            where: { id, deletedAt: null },
        });
        if (!doc)
            throw new common_1.NotFoundException('SDS not found');
        const extracted = this.hazardEngine.extract(doc);
        const lifecycleStatus = this.deriveSdsLifecycleStatus(doc);
        return {
            sdsId: id,
            lifecycleStatus,
            chemicalRiskScore: extracted.chemicalRiskScore,
            hazardCount: extracted.hazards.length,
            requiresAck: doc.requiresAck,
            expiresAt: doc.expiresAt,
        };
    }
    async getWorkerSds(workerId, projectId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            throw new common_1.NotFoundException('Worker not found');
        const requiredSds = await this.prisma.sdsDocument.findMany({
            where: Object.assign({ companyId: worker.companyId, status: 'published', deletedAt: null }, (projectId !== undefined
                ? { OR: [{ projectId }, { projectId: null }] }
                : {})),
            orderBy: { productName: 'asc' },
            take: 200,
        });
        const acks = await this.prisma.pmDocumentAcknowledgment.findMany({
            where: { workerId, sdsDocumentId: { not: null } },
            orderBy: { acknowledgedAt: 'desc' },
        });
        const ackBySds = new Map(acks.map((a) => [a.sdsDocumentId, a]));
        const documents = requiredSds.map((sds) => {
            var _a;
            const ack = ackBySds.get(sds.id);
            const lifecycleStatus = this.deriveSdsLifecycleStatus(sds);
            return {
                id: sds.id,
                productName: sds.productName,
                manufacturer: sds.manufacturer,
                lifecycleStatus,
                requiresAck: sds.requiresAck,
                acknowledged: !!ack,
                acknowledgedAt: (_a = ack === null || ack === void 0 ? void 0 : ack.acknowledgedAt) !== null && _a !== void 0 ? _a : null,
                expiresAt: sds.expiresAt,
                accessBlocked: sds.requiresAck && !ack && lifecycleStatus === 'active',
            };
        });
        const access = projectId
            ? await this.workerAccessCheck(workerId, projectId)
            : null;
        return {
            workerId,
            projectId: projectId !== null && projectId !== void 0 ? projectId : null,
            documents,
            acknowledgments: acks,
            sdsComplianceScore: this.workerSdsComplianceScore(documents),
            access,
        };
    }
    workerSdsComplianceScore(documents) {
        const required = documents.filter((d) => d.requiresAck);
        if (required.length === 0)
            return 100;
        const done = required.filter((d) => d.acknowledged).length;
        return Math.round((done / required.length) * 100);
    }
    async transitionSds(id, to, actorId, extra) {
        const doc = await this.getSds(id);
        this.workflow.assertTransition(doc.status, to);
        const update = { status: to };
        if (to === 'published') {
            Object.assign(update, this.workflow.publishFields());
            await this.prisma.sdsDocumentVersion.create({
                data: {
                    sdsDocumentId: id,
                    version: doc.version,
                    snapshot: doc,
                    authorId: actorId,
                },
            });
        }
        if (to === 'archived') {
            update.deletedAt = new Date();
        }
        const updated = await this.prisma.sdsDocument.update({
            where: { id },
            data: update,
        });
        await this.audit('sds', id, `status_${to}`, actorId, extra);
        return updated;
    }
    async replaceSds(parentId, data, actorId) {
        var _a, _b, _c;
        const parent = await this.getSds(parentId);
        await this.transitionSds(parentId, 'superseded', actorId);
        const child = await this.prisma.sdsDocument.create({
            data: {
                companyId: parent.companyId,
                projectId: parent.projectId,
                productName: parent.productName,
                manufacturer: parent.manufacturer,
                category: parent.category,
                parentDocumentId: parentId,
                version: parent.version + 1,
                status: 'draft',
                casNumbers: parent.casNumbers,
                hazardClasses: parent.hazardClasses,
                whmisJson: parent.whmisJson,
                metadataJson: ((_a = data.metadataJson) !== null && _a !== void 0 ? _a : parent.metadataJson),
                storageKey: (_b = data.storageKey) !== null && _b !== void 0 ? _b : parent.storageKey,
                revisionDate: (_c = data.revisionDate) !== null && _c !== void 0 ? _c : new Date(),
                expiresAt: data.expiresAt,
            },
        });
        await this.audit('sds', child.id, 'replacement_created', actorId, {
            parentId,
        });
        return child;
    }
    async addSdsAttachment(sdsDocumentId, data) {
        await this.getSds(sdsDocumentId);
        return this.prisma.sdsDocumentAttachment.create({
            data: Object.assign({ sdsDocumentId }, data),
        });
    }
    listChemicalInventory(filters) {
        return this.prisma.chemicalInventoryItem.findMany({
            where: {
                companyId: filters.companyId,
                projectId: filters.projectId,
                siteId: filters.siteId,
            },
            include: {
                sdsDocument: {
                    select: {
                        id: true,
                        productName: true,
                        status: true,
                        expiresAt: true,
                    },
                },
                site: { select: { id: true, name: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 500,
        });
    }
    async upsertChemicalItem(data, actorId) {
        var _a;
        let missingSdsFlag = !data.sdsDocumentId;
        if (data.sdsDocumentId) {
            const sds = await this.prisma.sdsDocument.findUnique({
                where: { id: data.sdsDocumentId },
            });
            if (!sds || sds.status !== 'published') {
                missingSdsFlag = true;
            }
        }
        const payload = {
            companyId: data.companyId,
            siteId: data.siteId,
            projectId: data.projectId,
            sdsDocumentId: data.sdsDocumentId,
            productName: data.productName,
            quantity: data.quantity,
            unit: data.unit,
            containerSize: data.containerSize,
            locationNote: data.locationNote,
            storageClass: data.storageClass,
            incompatibleWith: ((_a = data.incompatibleWith) !== null && _a !== void 0 ? _a : []),
            chemicalExpiry: data.chemicalExpiry,
            missingSdsFlag,
        };
        const row = data.id
            ? await this.prisma.chemicalInventoryItem.update({
                where: { id: data.id },
                data: payload,
            })
            : await this.prisma.chemicalInventoryItem.create({ data: payload });
        await this.audit('chemical_inventory', row.id, data.id ? 'updated' : 'created', actorId);
        return row;
    }
    async scanChemicalDeficiencies(projectId, actorId) {
        var _a, _b, _c, _d, _e;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const now = new Date();
        const items = await this.prisma.chemicalInventoryItem.findMany({
            where: { OR: [{ projectId }, { siteId: (_a = project.siteId) !== null && _a !== void 0 ? _a : -1 }] },
        });
        const storageIssues = this.compatibility.evaluateSiteInventory(items);
        const capas = [];
        for (const item of items) {
            if (item.chemicalExpiry && item.chemicalExpiry < now && this.capaAuto) {
                const capa = await this.capaAuto.fromDocumentDeficiency({
                    companyId: project.companyId,
                    projectId,
                    siteId: item.siteId,
                    sourceModule: 'sds_document',
                    sourceId: (_b = item.sdsDocumentId) !== null && _b !== void 0 ? _b : item.id,
                    sourceItemId: item.id,
                    title: `Expired chemical: ${(_c = item.productName) !== null && _c !== void 0 ? _c : 'Unknown'}`,
                    description: `Chemical expired on ${item.chemicalExpiry.toISOString()}`,
                    severity: 'high',
                    actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
                });
                if (capa)
                    capas.push(capa);
            }
            if (item.missingSdsFlag && this.capaAuto) {
                const capa = await this.capaAuto.fromDocumentDeficiency({
                    companyId: project.companyId,
                    projectId,
                    siteId: item.siteId,
                    sourceModule: 'sds_document',
                    sourceId: item.id,
                    sourceItemId: item.id,
                    title: `Missing SDS: ${(_d = item.productName) !== null && _d !== void 0 ? _d : 'Inventory item'}`,
                    description: 'Chemical inventory item lacks a published SDS link',
                    severity: 'high',
                    actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
                });
                if (capa)
                    capas.push(capa);
            }
        }
        for (const issue of storageIssues) {
            if (this.capaAuto) {
                const capa = await this.capaAuto.fromDocumentDeficiency({
                    companyId: project.companyId,
                    projectId,
                    sourceModule: 'sds_document',
                    sourceId: issue.itemId,
                    sourceItemId: issue.otherItemId,
                    title: 'Incompatible chemical storage',
                    description: issue.reason,
                    severity: 'critical',
                    actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
                });
                if (capa)
                    capas.push(capa);
            }
        }
        const expiredSds = await this.prisma.sdsDocument.findMany({
            where: {
                companyId: project.companyId,
                expiresAt: { lt: now },
                status: 'published',
                deletedAt: null,
            },
        });
        for (const sds of expiredSds) {
            if (this.capaAuto) {
                const capa = await this.capaAuto.fromDocumentDeficiency({
                    companyId: project.companyId,
                    projectId,
                    sourceModule: 'sds_document',
                    sourceId: sds.id,
                    title: `Expired SDS: ${sds.productName}`,
                    description: `SDS expired ${(_e = sds.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()}`,
                    severity: 'medium',
                    actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
                });
                if (capa)
                    capas.push(capa);
            }
        }
        return { storageIssues, capasCreated: capas.length, capas };
    }
    listControlledDocuments(filters) {
        return this.prisma.pmControlledDocument.findMany({
            where: {
                companyId: filters.companyId,
                projectId: filters.projectId,
                documentType: filters.documentType,
                status: filters.status,
                deletedAt: null,
            },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
    }
    async createControlledDocument(data, actorId) {
        var _a;
        const doc = await this.prisma.pmControlledDocument.create({
            data: Object.assign(Object.assign({}, data), { metadataJson: ((_a = data.metadataJson) !== null && _a !== void 0 ? _a : {}), status: 'draft' }),
        });
        await this.audit('controlled_document', doc.id, 'created', actorId);
        return doc;
    }
    async transitionControlledDocument(id, to, actorId) {
        const doc = await this.prisma.pmControlledDocument.findFirst({
            where: { id, deletedAt: null },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        this.workflow.assertTransition(doc.status, to);
        const update = { status: to };
        if (to === 'published') {
            Object.assign(update, this.workflow.publishFields());
            await this.prisma.pmDocumentVersion.create({
                data: {
                    documentId: id,
                    version: doc.versionNum,
                    snapshot: doc,
                    authorId: actorId,
                },
            });
        }
        if (to === 'archived')
            update.deletedAt = new Date();
        const updated = await this.prisma.pmControlledDocument.update({
            where: { id },
            data: update,
        });
        await this.audit('controlled_document', id, `status_${to}`, actorId);
        return updated;
    }
    listPolicies(companyId, projectId) {
        return this.prisma.policyDocument.findMany({
            where: Object.assign({ companyId, deletedAt: null }, (projectId !== undefined
                ? { OR: [{ projectId }, { projectId: null }] }
                : {})),
            orderBy: { publishedAt: 'desc' },
            take: 200,
        });
    }
    async publishPolicy(id, actorId) {
        const policy = await this.prisma.policyDocument.findUnique({
            where: { id },
        });
        if (!policy)
            throw new common_1.NotFoundException('Policy not found');
        if (policy.status !== 'published') {
            if (policy.status === 'draft') {
                this.workflow.assertTransition('draft', 'review');
                this.workflow.assertTransition('review', 'approved');
                this.workflow.assertTransition('approved', 'published');
            }
            else {
                this.workflow.assertTransition(policy.status, 'published');
            }
        }
        const updated = await this.prisma.policyDocument.update({
            where: { id },
            data: {
                status: 'published',
                publishedAt: new Date(),
                requiresAck: true,
            },
        });
        await this.audit('policy', id, 'published', actorId);
        return updated;
    }
    async acknowledgeDocument(data) {
        if (!data.sdsDocumentId &&
            !data.controlledDocumentId &&
            !data.policyDocumentId) {
            throw new common_1.BadRequestException('No document target for acknowledgment');
        }
        if (data.policyDocumentId) {
            await this.prisma.policyAcknowledgment.upsert({
                where: {
                    policyDocumentId_workerId: {
                        policyDocumentId: data.policyDocumentId,
                        workerId: data.workerId,
                    },
                },
                create: {
                    policyDocumentId: data.policyDocumentId,
                    workerId: data.workerId,
                    signatureData: data.signatureData,
                },
                update: {
                    acknowledgedAt: new Date(),
                    signatureData: data.signatureData,
                },
            });
        }
        const ack = await this.prisma.pmDocumentAcknowledgment.create({
            data: {
                workerId: data.workerId,
                sdsDocumentId: data.sdsDocumentId,
                controlledDocumentId: data.controlledDocumentId,
                policyDocumentId: data.policyDocumentId,
                signatureData: data.signatureData,
                clientSyncId: data.clientSyncId,
            },
        });
        if (data.sdsDocumentId) {
            await this.audit('sds', data.sdsDocumentId, 'acknowledged', undefined, {
                workerId: data.workerId,
                deviceId: data.deviceId,
                acknowledgmentId: ack.id,
            });
        }
        return ack;
    }
    listManufacturerInstructions(companyId, equipmentId) {
        return this.prisma.pmManufacturerInstruction.findMany({
            where: { companyId, equipmentId, active: true },
            include: { equipment: { select: { id: true, name: true } } },
            orderBy: { title: 'asc' },
        });
    }
    async createManufacturerInstruction(data, actorId) {
        var _a, _b;
        const doc = await this.prisma.pmControlledDocument.create({
            data: {
                companyId: data.companyId,
                documentType: 'manufacturer_instruction',
                title: data.title,
                equipmentId: data.equipmentId,
                status: 'published',
                publishedAt: new Date(),
                storageKey: data.storageKey,
            },
        });
        const mi = await this.prisma.pmManufacturerInstruction.create({
            data: {
                companyId: data.companyId,
                equipmentId: data.equipmentId,
                controlledDocId: doc.id,
                title: data.title,
                manufacturer: data.manufacturer,
                modelNumber: data.modelNumber,
                revisionDate: data.revisionDate,
                storageKey: data.storageKey,
                hazardHints: ((_a = data.hazardHints) !== null && _a !== void 0 ? _a : []),
                controlHints: ((_b = data.controlHints) !== null && _b !== void 0 ? _b : []),
            },
        });
        await this.audit('manufacturer_instruction', mi.id, 'created', actorId);
        return mi;
    }
    suggestControlsFromManufacturer(equipmentId) {
        return this.prisma.pmManufacturerInstruction.findMany({
            where: { equipmentId, active: true },
            select: { controlHints: true, hazardHints: true, title: true },
        });
    }
    async workerAccessCheck(workerId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return { allowed: true, missingPolicyAcks: 0, missingSdsAcks: 0 };
        }
        const requiredPolicies = await this.prisma.policyDocument.findMany({
            where: {
                companyId: project.companyId,
                status: 'published',
                requiresAckForAccess: true,
                deletedAt: null,
                OR: [{ projectId }, { projectId: null }],
            },
            select: { id: true, title: true },
        });
        let missingPolicyAcks = 0;
        for (const p of requiredPolicies) {
            const ack = await this.prisma.policyAcknowledgment.findUnique({
                where: {
                    policyDocumentId_workerId: {
                        policyDocumentId: p.id,
                        workerId,
                    },
                },
            });
            if (!ack)
                missingPolicyAcks++;
        }
        const requiredSds = await this.prisma.sdsDocument.findMany({
            where: {
                companyId: project.companyId,
                status: 'published',
                requiresAck: true,
                deletedAt: null,
                OR: [{ projectId }, { projectId: null }],
            },
            select: { id: true },
        });
        let missingSdsAcks = 0;
        for (const sds of requiredSds) {
            const ack = await this.prisma.pmDocumentAcknowledgment.findFirst({
                where: { workerId, sdsDocumentId: sds.id },
            });
            if (!ack)
                missingSdsAcks++;
        }
        const allowed = missingPolicyAcks === 0 && missingSdsAcks === 0;
        return { allowed, missingPolicyAcks, missingSdsAcks };
    }
    async analytics(projectId) {
        var _a, _b, _c;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 86400000);
        const [sdsTotal, sdsExpiringSoon, sdsExpired, inventoryCount, missingSds, expiredChemicals, policiesPublished, acks, controlledDocs, insights,] = await Promise.all([
            this.prisma.sdsDocument.count({
                where: {
                    companyId: project.companyId,
                    deletedAt: null,
                    OR: [{ projectId }, { projectId: null }],
                },
            }),
            this.prisma.sdsDocument.count({
                where: {
                    companyId: project.companyId,
                    expiresAt: { gte: now, lte: in30 },
                    status: 'published',
                },
            }),
            this.prisma.sdsDocument.count({
                where: {
                    companyId: project.companyId,
                    expiresAt: { lt: now },
                    status: 'published',
                },
            }),
            this.prisma.chemicalInventoryItem.count({
                where: { OR: [{ projectId }, { siteId: (_a = project.siteId) !== null && _a !== void 0 ? _a : -1 }] },
            }),
            this.prisma.chemicalInventoryItem.count({
                where: {
                    OR: [{ projectId }, { siteId: (_b = project.siteId) !== null && _b !== void 0 ? _b : -1 }],
                    missingSdsFlag: true,
                },
            }),
            this.prisma.chemicalInventoryItem.count({
                where: {
                    OR: [{ projectId }, { siteId: (_c = project.siteId) !== null && _c !== void 0 ? _c : -1 }],
                    chemicalExpiry: { lt: now },
                },
            }),
            this.prisma.policyDocument.count({
                where: { companyId: project.companyId, status: 'published' },
            }),
            this.prisma.pmDocumentAcknowledgment.count(),
            this.prisma.pmControlledDocument.count({
                where: { companyId: project.companyId, deletedAt: null },
            }),
            this.cail.projectInsights(projectId),
        ]);
        const policyCompliance = policiesPublished > 0
            ? Math.round((acks / Math.max(1, policiesPublished * 10)) * 100)
            : 100;
        const hazardTrend = await this.prisma.sdsDocument.groupBy({
            by: ['category'],
            where: {
                companyId: project.companyId,
                deletedAt: null,
                status: 'published',
            },
            _count: true,
        });
        const sdsCompliancePct = sdsTotal > 0
            ? Math.round(((sdsTotal - sdsExpired) / sdsTotal) * 100)
            : 100;
        return {
            sdsTotal,
            sdsExpiringSoon,
            sdsExpired,
            inventoryCount,
            missingSds,
            expiredChemicals,
            policiesPublished,
            policyAckCompliancePct: Math.min(100, policyCompliance),
            sdsCompliancePct,
            controlledDocs,
            chemicalHazardTrend: hazardTrend,
            expiryTrends: {
                expiringSoon: sdsExpiringSoon,
                expired: sdsExpired,
            },
            leadingIndicators: {
                missingSdsRate: inventoryCount > 0 ? missingSds / inventoryCount : 0,
                expiredChemicalRate: inventoryCount > 0 ? expiredChemicals / inventoryCount : 0,
                sdsCompliancePct,
            },
            cailInsights: insights,
        };
    }
    async syncBundle(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const [sds, inventory, policies, controlled, manufacturer] = await Promise.all([
            this.listSds({ companyId: project.companyId, projectId }),
            this.listChemicalInventory({ projectId }),
            this.listPolicies(project.companyId, projectId),
            this.listControlledDocuments({
                companyId: project.companyId,
                projectId,
                status: 'published',
            }),
            this.listManufacturerInstructions(project.companyId),
        ]);
        return {
            syncedAt: new Date().toISOString(),
            projectId,
            sds,
            inventory,
            policies,
            controlled,
            manufacturer,
        };
    }
    async applyOfflineSync(projectId, payload, actorId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const results = { acks: 0, sds: 0 };
        for (const ack of (_a = payload.acknowledgments) !== null && _a !== void 0 ? _a : []) {
            const existing = ack.clientSyncId
                ? await this.prisma.pmDocumentAcknowledgment.findUnique({
                    where: { clientSyncId: ack.clientSyncId },
                })
                : null;
            if (!existing) {
                await this.acknowledgeDocument(ack);
                results.acks++;
            }
        }
        for (const s of (_b = payload.sdsCreates) !== null && _b !== void 0 ? _b : []) {
            const exists = await this.prisma.sdsDocument.findUnique({
                where: { clientSyncId: s.clientSyncId },
            });
            if (!exists) {
                await this.createSds({
                    companyId: project.companyId,
                    projectId,
                    productName: s.productName,
                    manufacturer: s.manufacturer,
                    category: s.category,
                    clientSyncId: s.clientSyncId,
                }, actorId);
                results.sds++;
            }
        }
        return results;
    }
    async stationSyncPayload(companyId, siteId) {
        const emergencyPlans = await this.prisma.pmControlledDocument.findMany({
            where: {
                companyId,
                documentType: 'emergency_plan',
                status: 'published',
                deletedAt: null,
            },
            take: 50,
        });
        const sds = await this.prisma.sdsDocument.findMany({
            where: {
                companyId,
                status: 'published',
                deletedAt: null,
            },
            include: { attachments: true },
            take: 500,
        });
        return {
            emergencyPlans,
            sds,
            siteId,
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.PmDocumentControlService = PmDocumentControlService;
exports.PmDocumentControlService = PmDocumentControlService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_document_cail_intelligence_service_1.PmDocumentCailIntelligenceService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService])
], PmDocumentControlService);
//# sourceMappingURL=pm-document-control.service.js.map