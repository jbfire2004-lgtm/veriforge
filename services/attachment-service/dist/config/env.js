"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required environment variable: ${name}`);
    return v;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3004),
    databaseUrl: required('DATABASE_URL'),
    jwtAccessSecret: required('JWT_ACCESS_SECRET'),
    authValidateUrl: process.env.AUTH_VALIDATE_URL,
    storageDriver: (process.env.STORAGE_DRIVER ?? 'local'),
    localStoragePath: process.env.LOCAL_STORAGE_PATH ?? './data/uploads',
    s3Endpoint: process.env.S3_ENDPOINT,
    s3Region: process.env.S3_REGION ?? 'us-east-1',
    s3Bucket: process.env.S3_BUCKET ?? 'vera-attachments',
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES ?? 25 * 1024 * 1024),
    presignedUrlTtlSec: Number(process.env.PRESIGNED_URL_TTL_SEC ?? 900),
    thumbnailMaxWidth: Number(process.env.THUMBNAIL_MAX_WIDTH ?? 320),
    thumbnailMaxHeight: Number(process.env.THUMBNAIL_MAX_HEIGHT ?? 320),
    virusScanUrl: process.env.VIRUS_SCAN_URL,
    virusScanTimeoutMs: Number(process.env.VIRUS_SCAN_TIMEOUT_MS ?? 5000),
    attachmentServiceKey: process.env.ATTACHMENT_SERVICE_KEY,
    logLevel: process.env.LOG_LEVEL ?? 'info',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
//# sourceMappingURL=env.js.map