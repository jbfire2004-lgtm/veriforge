import { Prisma, IncidentSeverity, IncidentStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

const notDeleted = { deletedAt: null };

const incidentInclude = {
  witnesses: { where: notDeleted, orderBy: { createdAt: 'desc' as const } },
  investigations: { where: notDeleted, orderBy: { createdAt: 'desc' as const } },
  correctiveActionLinks: { orderBy: { createdAt: 'desc' as const } },
} as const;

export type IncidentWithRelations = Prisma.IncidentGetPayload<{ include: typeof incidentInclude }>;

export const incidentRepository = {
  async nextIncidentNumber(companyId: string): Promise<string> {
    const count = await prisma.incident.count({ where: { companyId, ...notDeleted } });
    const year = new Date().getFullYear();
    return `INC-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create(data: {
    companyId: string;
    projectId: string;
    incidentNumber: string;
    incidentType: string;
    title: string;
    description?: string;
    severity: IncidentSeverity;
    location?: string;
    occurredAt: Date;
    latitude?: number;
    longitude?: number;
    workerId?: string;
    equipmentId?: string;
    severityLevel: number;
    likelihoodLevel: number;
    riskScore?: number;
    sifScore?: number;
    sifPotential: boolean;
    hecaCategory?: string;
    safetyGatePassed?: boolean;
    safetyGateReason?: string;
    reportedBy: string;
    createdBy: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.incident.create({ data, include: incidentInclude });
  },

  findById(id: string, companyId: string): Promise<IncidentWithRelations | null> {
    return prisma.incident.findFirst({
      where: { id, companyId, ...notDeleted },
      include: incidentInclude,
    });
  },

  list(params: {
    companyId: string;
    projectId?: string;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.IncidentWhereInput = {
      companyId: params.companyId,
      ...notDeleted,
    };
    if (params.projectId) where.projectId = params.projectId;
    if (params.status) where.status = params.status;
    if (params.severity) where.severity = params.severity;

    return prisma.incident.findMany({
      where,
      include: incidentInclude,
      orderBy: { occurredAt: 'desc' },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
    });
  },

  update(
    id: string,
    companyId: string,
    data: Partial<{
      status: IncidentStatus;
      investigatedBy: string;
      investigatedAt: Date;
      closedBy: string;
      closedAt: Date;
      closeNotes: string;
      safetyGatePassed: boolean;
      safetyGateReason: string;
      updatedBy: string;
      metadata: Prisma.InputJsonValue;
    }>,
  ) {
    return prisma.incident.updateMany({ where: { id, companyId, ...notDeleted }, data });
  },

  softDelete(id: string, companyId: string) {
    return prisma.incident.updateMany({
      where: { id, companyId, ...notDeleted },
      data: { deletedAt: new Date() },
    });
  },

  addWitness(data: {
    incidentId: string;
    name?: string;
    contact?: string;
    workerId?: string;
    statement?: string;
    interviewedAt?: Date;
    interviewedBy?: string;
    createdBy: string;
  }) {
    return prisma.incidentWitness.create({ data });
  },

  addInvestigation(data: {
    incidentId: string;
    investigatedBy: string;
    findings: string;
    rootCause?: string;
    method?: string;
    recommendations?: string;
    metadata?: Prisma.InputJsonValue;
    createdBy: string;
  }) {
    return prisma.incidentInvestigation.create({ data });
  },

  addCorrectiveActionLink(data: {
    incidentId: string;
    correctiveActionId: string;
    linkedBy: string;
  }) {
    return prisma.incidentCorrectiveActionLink.create({ data });
  },

  findOfflineSync(deviceId: string, clientSyncId: string) {
    return prisma.incidentOfflineSync.findUnique({
      where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
    });
  },

  upsertOfflineSync(data: {
    companyId: string;
    deviceId: string;
    clientSyncId: string;
    action: string;
    payload: Prisma.InputJsonValue;
    status: string;
    result?: Prisma.InputJsonValue;
  }) {
    return prisma.incidentOfflineSync.upsert({
      where: {
        deviceId_clientSyncId: {
          deviceId: data.deviceId,
          clientSyncId: data.clientSyncId,
        },
      },
      create: {
        companyId: data.companyId,
        deviceId: data.deviceId,
        clientSyncId: data.clientSyncId,
        action: data.action,
        payload: data.payload,
        status: data.status,
        result: data.result,
        syncedAt: data.status === 'synced' ? new Date() : undefined,
      },
      update: {
        status: data.status,
        result: data.result,
        syncedAt: data.status === 'synced' ? new Date() : undefined,
      },
    });
  },

  reload(id: string, companyId: string): Promise<IncidentWithRelations | null> {
    return this.findById(id, companyId);
  },
};
