export declare class CreateUnionHallDto {
    name: string;
    localNumber?: string;
    region?: string;
}
export declare class AddUnionMemberDto {
    firstName: string;
    lastName: string;
    memberNumber?: string;
    email?: string;
    phone?: string;
}
export declare class DispatchWorkerDto {
    workerId: number;
    companyId: number;
    notes?: string;
}
