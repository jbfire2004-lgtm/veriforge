import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { resolveJwtSecret } from './jwt-secret.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: resolveJwtSecret(),
      issuer: process.env.JWT_ISSUER || 'vera-api',
      audience: process.env.JWT_AUDIENCE || 'vera-clients',
      algorithms: ['HS256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    role: string;
    trainingProviderId?: number;
    instructorId?: number;
    companyId?: number;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        companyId: true,
        trainingProviderId: true,
        company: { select: { name: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    let instructorId = payload.instructorId ?? null;
    if (user.role === UserRole.TRAINING_INSTRUCTOR && !instructorId) {
      const instructor = await this.prisma.trainingInstructor.findFirst({
        where: { userId: user.id, active: true },
        select: { id: true },
      });
      instructorId = instructor?.id ?? null;
    }

    // Tenant from DB / worker linkage only — never trust JWT companyId claim.
    let companyId = user.companyId ?? null;
    let companyName = user.company?.name ?? null;
    if (!companyId && user.role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId: user.id },
        select: { companyId: true, company: { select: { name: true } } },
      });
      companyId = worker?.companyId ?? null;
      companyName = worker?.company?.name ?? null;
    }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId,
      companyName,
      trainingProviderId:
        user.trainingProviderId ?? payload.trainingProviderId ?? null,
      instructorId,
    };
  }
}
