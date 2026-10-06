import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { WalletsService } from '../modules/vera-core/wallets.service';
import { CoreReadinessService } from '../modules/vera-core/core-readiness.service';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import {
  BLOCKCHAIN_CREDENTIAL_PROVIDER,
  type BlockchainCredentialProvider,
} from '../modules/training-credential-nft/blockchain-provider.interface';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import {
  publicBaseUrl,
  workerStaffWalletPath,
  workerVerifyUrl,
} from '../common/wallet-routes';
import { resolvePublicBaseUrl } from '../config/public-base-url';

@Injectable()
export class WorkerWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qr: QrService,
    @Optional()
    @Inject(forwardRef(() => WalletsService))
    private readonly coreWallets?: WalletsService,
    @Optional()
    @Inject(forwardRef(() => CoreReadinessService))
    private readonly readiness?: CoreReadinessService,
    @Optional()
    @Inject(BLOCKCHAIN_CREDENTIAL_PROVIDER)
    private readonly blockchain?: BlockchainCredentialProvider,
    @Optional()
    private readonly events?: EventBusService,
  ) {}

  getDownloadInfo() {
    const base = resolvePublicBaseUrl();
    return {
      title: 'Vera Worker Wallet',
      description:
        'Mobile credentials, training status, and site QR check-in for field workers.',
      webWalletUrl: `${base}/wallet`,
      pwaUrl: `${base}/wallet`,
      iosUrl: process.env.VERA_WALLET_IOS_URL ?? null,
      androidUrl: process.env.VERA_WALLET_ANDROID_URL ?? null,
      qrFormat: `${publicBaseUrl()}/verify/{workerId}`,
    };
  }

  async generateWorkerQr(workerId: number, requesterId: number) {
    await this.assertCanAccessWorker(workerId, requesterId);
    const qr = await this.qr.generateWorkerQr(workerId);
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return {
      ...qr,
      worker: {
        id: worker.id,
        name: `${worker.firstName} ${worker.lastName}`,
      },
      walletUrl: workerStaffWalletPath(workerId),
      verifyUrl: workerVerifyUrl(workerId),
    };
  }

  async syncWorkerProfile(workerId: number, requesterId: number) {
    await this.assertCanAccessWorker(workerId, requesterId);
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        company: { select: { id: true, name: true } },
        trainingRecords: {
          take: 50,
          orderBy: { expiresAt: 'asc' },
          include: { certification: { select: { name: true } } },
        },
        user: { select: { id: true, email: true, active: true } },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();
    const training = worker.trainingRecords.map((t) => ({
      id: t.id,
      certification: t.certification.name,
      expiresAt: t.expiresAt?.toISOString() ?? null,
      expired: t.expiresAt ? t.expiresAt <= now : false,
    }));

    const base = {
      syncedAt: new Date().toISOString(),
      worker: {
        id: worker.id,
        firstName: worker.firstName,
        lastName: worker.lastName,
        companyId: worker.companyId,
        companyName: worker.company?.name ?? null,
      },
      user: worker.user,
      training,
      qr: this.qr.generateWorkerQr(workerId),
      walletUrl: workerStaffWalletPath(workerId),
      verifyUrl: workerVerifyUrl(workerId),
    };

    if (this.coreWallets) {
      try {
        const coreWallet = await this.coreWallets.getWorkerWallet(workerId);
        return { ...base, coreWallet };
      } catch {
        return base;
      }
    }

    return base;
  }

  async getOfflineBundle(workerId: number, requesterId: number) {
    await this.assertCanAccessWorker(workerId, requesterId);
    const syncedAt = new Date().toISOString();
    const qr = await this.generateWorkerQr(workerId, requesterId);
    const profile = await this.syncWorkerProfile(workerId, requesterId);

    const training =
      this.coreWallets != null
        ? (await this.coreWallets.getWorkerWallet(workerId)).training
        : (profile as { training?: unknown[] }).training ?? [];

    const readiness = this.readiness
      ? await this.readiness.workerScore(workerId).catch(() => null)
      : null;

    const projects = await this.prisma.projectAssignment.findMany({
      where: { workerId, status: 'ACTIVE', endedAt: null },
      include: {
        project: {
          select: { id: true, name: true, code: true, companyId: true },
        },
      },
      take: 20,
    });

    this.events?.emit({
      name: DomainEvent.WALLET_UPDATED,
      occurredAt: syncedAt,
      entityType: 'worker',
      entityId: workerId,
      data: { workerId, source: 'offline_bundle' },
    });

    this.events?.emit({
      name: DomainEvent.WALLET_BUNDLE_SYNCED,
      occurredAt: syncedAt,
      entityType: 'worker',
      entityId: workerId,
      data: { trainingCount: Array.isArray(training) ? training.length : 0 },
    });

    return {
      syncedAt,
      workerId,
      qr,
      profile,
      training,
      readiness,
      projects: projects.map((a) => ({
        projectId: a.project.id,
        projectName: a.project.name,
        projectCode: a.project.code,
        companyId: a.project.companyId,
        assignedAt: a.assignedAt?.toISOString() ?? null,
      })),
      offlineCapable: true,
    };
  }

  async validateBlockchainCredential(
    tokenId: string,
    trainingRecordId?: number,
  ) {
    if (!this.blockchain) {
      return {
        valid: false,
        tokenId,
        message: 'Blockchain provider not configured',
      };
    }

    const nft = await this.prisma.trainingCredentialNft.findFirst({
      where: trainingRecordId
        ? { trainingRecordId, nftTokenId: tokenId }
        : { nftTokenId: tokenId },
      select: {
        trainingRecordId: true,
        mintStatus: true,
        mintedAt: true,
        chain: true,
      },
    });

    const chainResult = await this.blockchain.verifyCredential({
      tokenId,
      chain: nft?.chain ?? undefined,
      trainingRecordId: trainingRecordId ?? nft?.trainingRecordId,
    });

    return {
      ...chainResult,
      mintStatus: nft?.mintStatus ?? null,
      veraRecordMatch: Boolean(nft),
    };
  }

  async resolveWorkerIdForUser(userId: number): Promise<number | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { worker: { select: { id: true } } },
    });
    return user?.worker?.id ?? null;
  }

  private async assertCanAccessWorker(workerId: number, requesterId: number) {
    const [requester, worker] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: requesterId },
        select: {
          role: true,
          companyId: true,
          worker: { select: { id: true } },
        },
      }),
      this.prisma.worker.findUnique({
        where: { id: workerId },
        select: { companyId: true },
      }),
    ]);
    if (!requester || !worker) throw new NotFoundException('Not found');

    if (
      requester.role === UserRole.SUPER_ADMIN ||
      requester.role === UserRole.ADMIN
    ) {
      return;
    }

    if (requester.worker?.id === workerId) return;

    if (
      requester.companyId &&
      worker.companyId &&
      requester.companyId === worker.companyId
    ) {
      return;
    }

    throw new ForbiddenException('Cannot access this worker wallet');
  }
}
