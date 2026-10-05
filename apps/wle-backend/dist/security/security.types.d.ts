import type { UserRole } from '@prisma/client';
export type SecurityActor = {
    id: number;
    userId?: number;
    email?: string;
    role: UserRole;
    companyId: number | null;
    companyName?: string | null;
    trainingProviderId?: number | null;
    instructorId?: number | null;
};
export declare const Permission: {
    readonly WORKER_VIEW: "worker.view";
    readonly WORKER_EDIT: "worker.edit";
    readonly INSPECTION_VIEW: "inspection.view";
    readonly INSPECTION_EDIT: "inspection.edit";
    readonly INSPECTION_SUBMIT: "inspection.submit";
    readonly TEMPLATE_MANAGE: "template.manage";
    readonly COMPANY_READINESS_VIEW: "company.readiness.view";
    readonly PM_ACCESS: "pm.access";
    readonly CORE_ACCESS: "core.access";
    readonly ADMIN_ACCESS: "admin.access";
    readonly CONTRACTOR_PORTAL_ACCESS: "contractor.portal.access";
};
export type PermissionKey = (typeof Permission)[keyof typeof Permission];
export type TenantResource = {
    kind: 'company';
    companyId: number;
} | {
    kind: 'worker';
    workerId: number;
} | {
    kind: 'inspection';
    inspectionId: string;
} | {
    kind: 'equipment';
    equipmentId: number;
};
