import { EquipmentAttachmentType } from '@prisma/client';
export declare class CreateAttachmentDto {
    type: EquipmentAttachmentType;
    name: string;
    url: string;
    notes?: string;
}
