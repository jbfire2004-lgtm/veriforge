"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageAdapter = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_1 = require("../config/env");
class S3StorageAdapter {
    client;
    bucket;
    constructor() {
        if (!env_1.env.s3AccessKeyId || !env_1.env.s3SecretAccessKey) {
            throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY required for S3 storage');
        }
        this.bucket = env_1.env.s3Bucket;
        this.client = new client_s3_1.S3Client({
            region: env_1.env.s3Region,
            endpoint: env_1.env.s3Endpoint || undefined,
            forcePathStyle: env_1.env.s3ForcePathStyle,
            credentials: {
                accessKeyId: env_1.env.s3AccessKeyId,
                secretAccessKey: env_1.env.s3SecretAccessKey,
            },
        });
    }
    async putObject(key, body, contentType) {
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));
        return { key, size: body.length };
    }
    async getObject(key) {
        const res = await this.client.send(new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key }));
        const bytes = await res.Body?.transformToByteArray();
        if (!bytes)
            throw new Error('Empty S3 object body');
        return {
            body: Buffer.from(bytes),
            contentType: res.ContentType,
        };
    }
    async exists(key) {
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return true;
        }
        catch {
            return false;
        }
    }
    async getPresignedUrl(key, ttlSec) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: ttlSec });
        return {
            url,
            expiresAt: new Date(Date.now() + ttlSec * 1000).toISOString(),
        };
    }
}
exports.S3StorageAdapter = S3StorageAdapter;
//# sourceMappingURL=s3.adapter.js.map