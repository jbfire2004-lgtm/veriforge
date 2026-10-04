import { Injectable } from '@nestjs/common';
import { TenantRegistryService } from './tenant-registry.service';
import type { TenantStorageObject } from './tenant.types';

@Injectable()
export class TenantStorageService {
  constructor(private readonly registry: TenantRegistryService) {}

  upload(input: {
    tenantId: string;
    category: TenantStorageObject['category'];
    fileName: string;
    sizeBytes?: number;
    uploadedBy?: number | null;
  }) {
    const tenant = this.registry.assertActive(input.tenantId);
    const object = this.registry.putObject({
      tenantId: tenant.tenantId,
      category: input.category,
      fileName: input.fileName,
      sizeBytes: input.sizeBytes ?? 0,
      uploadedBy: input.uploadedBy ?? null,
    });
    this.registry.appendAudit({
      tenantId: tenant.tenantId,
      userId: input.uploadedBy ?? null,
      action: 'storage.upload',
      resource: object.key,
      details: {
        bucket: object.bucket,
        category: object.category,
        fileName: object.fileName,
      },
    });
    return {
      ...object,
      isolation: 'tenant-bucket',
      encryptionKeyId: tenant.encryptionKeyId,
    };
  }

  list(tenantId: string, category?: TenantStorageObject['category']) {
    return this.registry.listObjects(tenantId, category);
  }

  get(tenantId: string, key: string) {
    return this.registry.getObject(tenantId, key);
  }

  describeBuckets() {
    return this.registry.listTenants().map((tenant) => ({
      tenantId: tenant.tenantId,
      bucket: tenant.storageBucket,
      encryptionKeyId: tenant.encryptionKeyId,
    }));
  }
}
