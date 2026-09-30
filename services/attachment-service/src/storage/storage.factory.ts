import { env } from '../config/env';
import type { StorageAdapter } from '../types';
import { LocalStorageAdapter } from './local.adapter';
import { S3StorageAdapter } from './s3.adapter';

let adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter =
      env.storageDriver === 's3'
        ? new S3StorageAdapter()
        : new LocalStorageAdapter(env.localStoragePath);
  }
  return adapter;
}
