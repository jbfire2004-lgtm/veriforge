"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageAdapter = getStorageAdapter;
const env_1 = require("../config/env");
const local_adapter_1 = require("./local.adapter");
const s3_adapter_1 = require("./s3.adapter");
let adapter = null;
function getStorageAdapter() {
    if (!adapter) {
        adapter =
            env_1.env.storageDriver === 's3'
                ? new s3_adapter_1.S3StorageAdapter()
                : new local_adapter_1.LocalStorageAdapter(env_1.env.localStoragePath);
    }
    return adapter;
}
//# sourceMappingURL=storage.factory.js.map