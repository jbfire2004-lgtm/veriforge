import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventBusService } from '../../../common/events/event-bus.service';

export interface IssuedCertificateNft {
  nftId: string;
  txHash: string;
}

export interface ReissueResult {
  bookingId: string;
  workerId: string;
  certificationId: string;
  expiredNftId: string | null;
  newNftId: string;
  blockchainRef: string;
}

/** Wallet persistence stub — swap for the production WalletService binding. */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  async updateWorkerWallet(workerId: string): Promise<void> {
    this.logger.log(JSON.stringify({ type: 'wallet.update', workerId }));
  }
}

/** NFT minting/expiry + ledger stub — swap for the production NFTService binding. */
@Injectable()
export class NFTService {
  private readonly logger = new Logger(NFTService.name);

  async expireCertificateNFT(oldNftId: string | null): Promise<void> {
    if (!oldNftId) return;
    this.logger.log(JSON.stringify({ type: 'nft.expire', oldNftId }));
  }

  async issueCertificateNFT(
    workerId: string,
    certificationId: string,
  ): Promise<IssuedCertificateNft> {
    const issued: IssuedCertificateNft = {
      nftId: `nft_${randomUUID()}`,
      txHash: `0x${randomUUID().replace(/-/g, '')}`,
    };
    this.logger.log(
      JSON.stringify({
        type: 'nft.issue',
        workerId,
        certificationId,
        ...issued,
      }),
    );
    return issued;
  }

  async writeBlockchainLog(entry: Record<string, unknown>): Promise<string> {
    const blockRef = `blk_${randomUUID()}`;
    this.logger.log(
      JSON.stringify({ type: 'blockchain.append', blockRef, entry }),
    );
    return blockRef;
  }
}

@Injectable()
export class NftReissueService {
  private readonly logger = new Logger(NftReissueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nft: NFTService,
    private readonly wallet: WalletService,
    private readonly events: EventBusService,
  ) {}

  /** Reissue a worker's credential NFT after verified training completion. */
  async handleTrainingCompletion(bookingId: string): Promise<ReissueResult> {
    const booking = await this.prisma.bookingRecord.findUnique({
      where: { id: bookingId },
    });
    if (!booking)
      throw new NotFoundException(`Booking not found: ${bookingId}`);

    const workerId = String(booking.workerId);
    const certificationId = booking.certificationId ?? booking.certType;

    await this.nft.expireCertificateNFT(null);
    const issued = await this.nft.issueCertificateNFT(
      workerId,
      certificationId,
    );
    await this.wallet.updateWorkerWallet(workerId);

    const blockchainRef = await this.nft.writeBlockchainLog({
      action: 'CERTIFICATE_NFT_REISSUE',
      bookingId,
      workerId,
      certificationId,
      newNftId: issued.nftId,
      txHash: issued.txHash,
      completedAt: new Date().toISOString(),
    });

    this.events.emit('nft.issued', { workerId, certificationId });

    return {
      bookingId,
      workerId,
      certificationId,
      expiredNftId: null,
      newNftId: issued.nftId,
      blockchainRef,
    };
  }
}
