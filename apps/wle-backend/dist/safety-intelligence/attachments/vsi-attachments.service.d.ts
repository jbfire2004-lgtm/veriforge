import { CoreUploadService } from '../../modules/core-upload/core-upload.service';
export type PhotoClassificationAsset = {
    coreFileId: number;
    storageKey?: string | null;
    publicUrl: string | null;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    imageBase64: string;
};
export declare class VsiAttachmentsService {
    private readonly coreUpload;
    constructor(coreUpload: CoreUploadService);
    resolvePhotoEvidence(coreFileId: number): Promise<{
        coreFileId: number;
        storageKey: string;
        publicUrl: string;
        fileName: string;
        mimeType: string;
    }>;
    resolvePhotoForClassification(coreFileId: number): Promise<PhotoClassificationAsset>;
}
