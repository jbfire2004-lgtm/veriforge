import { CreateWorkerDto } from './create-worker.dto';
declare const UpdateWorkerDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateWorkerDto>>;
export declare class UpdateWorkerDto extends UpdateWorkerDto_base {
    companyId?: number | null;
}
export {};
