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
    port: Number(process.env.PORT ?? 3014),
    databaseUrl: required('DATABASE_URL'),
    jwtAccessSecret: required('JWT_ACCESS_SECRET'),
    authValidateUrl: process.env.AUTH_VALIDATE_URL,
    workerSafetyServiceUrl: process.env.WORKER_SAFETY_SERVICE_URL,
    equipmentSafetyServiceUrl: process.env.EQUIPMENT_SAFETY_SERVICE_URL,
    trainingServiceUrl: process.env.TRAINING_SERVICE_URL,
    projectSafetyServiceUrl: process.env.PROJECT_SAFETY_SERVICE_URL,
    logLevel: process.env.LOG_LEVEL ?? 'info',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
