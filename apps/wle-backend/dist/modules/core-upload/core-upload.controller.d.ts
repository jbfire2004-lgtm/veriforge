import { CoreUploadService } from './core-upload.service';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { MultipartFieldsDto } from './dto/multipart-fields.dto';
import { PresignDto } from './dto/presign.dto';
type UploadActor = {
    id: number;
    companyId?: number | null;
};
export declare class CoreUploadController {
    private readonly coreUpload;
    constructor(coreUpload: CoreUploadService);
    private ownershipFrom;
    config(): {
        mode: import("./core-upload.config").CoreUploadMode;
        maxBytes: number;
        allowedMimeTypes: string[];
    };
    purposes(): {
        value: "document_storage" | "training_ingestion" | "safety_program_ingestion" | "completed_document" | "inspection_signature" | "orientation_media" | "generic";
        label: string;
    }[];
    presign(dto: PresignDto, req: {
        user?: UploadActor;
    }): Promise<{
        id: number;
        uploadUrl: string;
        method: "PUT";
        headers: {
            'Content-Type': string;
        };
        objectKey: string;
        expiresInSeconds: number;
    }>;
    complete(dto: CompleteUploadDto): Promise<import("./core-upload.service").CoreFileResponse>;
    abandon(id: number): Promise<{
        id: number;
        status: string;
    }>;
    upload(file: Express.Multer.File, body: MultipartFieldsDto, req: {
        user?: UploadActor;
    }): Promise<import("./core-upload.service").CoreFileResponse>;
    getOne(id: number): Promise<import("./core-upload.service").CoreFileResponse>;
}
export {};
