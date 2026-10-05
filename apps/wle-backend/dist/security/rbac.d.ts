import { UserRole } from '@prisma/client';
export declare const RBAC: {
    readonly viewProjectCompliance: import(".prisma/client").$Enums.UserRole[];
    readonly manageProjectCompliance: import(".prisma/client").$Enums.UserRole[];
    readonly submitSafetyForms: UserRole[];
    readonly approveSafetyForms: import(".prisma/client").$Enums.UserRole[];
    readonly issueCredentials: import(".prisma/client").$Enums.UserRole[];
    readonly manageProviderApis: import(".prisma/client").$Enums.UserRole[];
    readonly viewCredentialChain: UserRole[];
    readonly credentialLedgerBackfill: import(".prisma/client").$Enums.UserRole[];
};
export type RbacCapability = keyof typeof RBAC;
export declare function rolesFor(capability: RbacCapability): UserRole[];
