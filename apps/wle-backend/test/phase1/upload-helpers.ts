import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const V1 = '/api/v1';

export function phase1Agent(app: INestApplication) {
  return request(app.getHttpServer());
}

function withBearer(req: request.Test, bearerToken?: string): request.Test {
  if (bearerToken) {
    return req.set('Authorization', `Bearer ${bearerToken}`);
  }
  return req;
}

/** GET /api/v1/core/uploads/config — contract: mode, maxBytes, allowedMimeTypes */
export async function getCoreUploadConfig(
  app: INestApplication,
  bearerToken?: string,
) {
  return withBearer(
    phase1Agent(app).get(`${V1}/core/uploads/config`),
    bearerToken,
  ).expect(200);
}

/** Multipart POST /api/v1/core/uploads */
export function postCoreUploadMultipart(
  app: INestApplication,
  file: Buffer,
  filename: string,
  contentType: string,
  purpose?: string,
  bearerToken?: string,
) {
  let agent = phase1Agent(app).post(`${V1}/core/uploads`);
  agent = withBearer(agent, bearerToken);
  if (purpose !== undefined) {
    agent.field('purpose', purpose);
  }
  return agent.attach('file', file, { filename, contentType });
}

/** POST /api/v1/core/uploads/presign */
export function postCoreUploadPresign(
  app: INestApplication,
  body: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    purpose?: string;
  },
  bearerToken?: string,
) {
  return withBearer(
    phase1Agent(app).post(`${V1}/core/uploads/presign`).send(body),
    bearerToken,
  );
}

/** POST /api/v1/core/uploads/complete */
export function postCoreUploadComplete(
  app: INestApplication,
  id: number,
  bearerToken?: string,
) {
  return withBearer(
    phase1Agent(app)
      .post(`${V1}/core/uploads/complete`)
      .send({ id })
      .set('Content-Type', 'application/json'),
    bearerToken,
  );
}

/** POST /api/v1/training-ingestion/upload */
export function postTrainingIngestionUpload(
  app: INestApplication,
  file: Buffer,
  filename: string,
  contentType: string,
  companyId: number,
  metadata?: string,
  bearerToken?: string,
) {
  let agent = phase1Agent(app)
    .post(`${V1}/training-ingestion/upload`)
    .field('companyId', String(companyId));
  agent = withBearer(agent, bearerToken);
  if (metadata !== undefined) {
    agent.field('metadata', metadata);
  }
  return agent.attach('file', file, { filename, contentType });
}

export function getTrainingIngestionRun(
  app: INestApplication,
  runId: number,
  bearerToken?: string,
) {
  return withBearer(
    phase1Agent(app).get(`${V1}/training-ingestion/runs/${runId}`),
    bearerToken,
  );
}

export function getCoreVerificationTraining(
  app: INestApplication,
  trainingRecordId: number,
  query?: Record<string, string>,
) {
  let path = `${V1}/core/verification/training/${trainingRecordId}`;
  if (query && Object.keys(query).length) {
    const q = new URLSearchParams(query).toString();
    path += `?${q}`;
  }
  return phase1Agent(app).get(path);
}

export function postCoreVerificationComplete(
  app: INestApplication,
  trainingRecordId: number,
  bearerToken?: string,
) {
  return withBearer(
    phase1Agent(app).post(
      `${V1}/core/verification/training/${trainingRecordId}/complete`,
    ),
    bearerToken,
  );
}
