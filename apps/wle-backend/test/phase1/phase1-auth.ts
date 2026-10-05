import type { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

const PHASE1_E2E_EMAIL = 'phase1_e2e@vera.test';
const PHASE1_E2E_PASSWORD = 'Phase1E2E_Pass_99!';

/**
 * Ensures a PROJECT_MANAGER user exists and returns a JWT for Phase 1 HTTP tests
 * (Core upload, training ingestion, verification complete require auth).
 */
export async function ensurePhase1JwtToken(
  app: INestApplication,
  prisma: PrismaService,
): Promise<{ token: string; userId: number }> {
  const hash = await bcrypt.hash(PHASE1_E2E_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: PHASE1_E2E_EMAIL },
    update: {
      password: hash,
      role: UserRole.PROJECT_MANAGER,
    },
    create: {
      username: 'phase1_e2e_user',
      email: PHASE1_E2E_EMAIL,
      password: hash,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const res = await request(app.getHttpServer()).post('/auth/login').send({
    email: PHASE1_E2E_EMAIL,
    password: PHASE1_E2E_PASSWORD,
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(
      `Phase 1 E2E login failed: HTTP ${res.status} ${JSON.stringify(
        res.body,
      )}`,
    );
  }
  const accessToken = (res.body as { accessToken?: string }).accessToken;
  if (!accessToken) {
    throw new Error('Phase 1 E2E login: response missing accessToken');
  }

  return { token: accessToken, userId: user.id };
}
