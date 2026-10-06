import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class VsiAttachmentsService {
  constructor(private readonly coreUpload: CoreUploadService) {}

  async resolvePhotoEvidence(coreFileId: number) {
    const file = await this.coreUpload.findOne(coreFileId);
    if (!file.publicUrl && !file.objectKey) {
      throw new NotFoundException('Upload not complete or missing URL');
    }
    return {
      coreFileId: file.id,
      storageKey: file.objectKey,
      publicUrl: file.publicUrl,
      fileName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  /** Metadata + raw bytes for server-side OCR / multimodal LLM. */
  async resolvePhotoForClassification(
    coreFileId: number,
  ): Promise<PhotoClassificationAsset> {
    const meta = await this.resolvePhotoEvidence(coreFileId);
    const { buffer, mimeType, originalName } = await this.coreUpload.readBuffer(
      coreFileId,
    );
    return {
      coreFileId,
      storageKey: meta.storageKey,
      publicUrl: meta.publicUrl,
      fileName: originalName ?? meta.fileName,
      mimeType,
      buffer,
      imageBase64: buffer.toString('base64'),
    };
  }
}
