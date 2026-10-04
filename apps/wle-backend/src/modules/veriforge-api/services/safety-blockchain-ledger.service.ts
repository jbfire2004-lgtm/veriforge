import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export type BlockType =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incident'
  | 'equipment'
  | 'risk'
  | 'audit';

export type ContractTrigger =
  | 'verificationWorkflow'
  | 'complianceExpiry'
  | 'criticalIncident'
  | 'equipmentSchedule';

export type LedgerBlock = {
  id: string;
  index: number;
  type: BlockType;
  title: string;
  summary: string;
  payload: Record<string, string | number | boolean>;
  critical: boolean;
  tenantId: string;
  prevHash: string;
  hash: string;
  signature: string;
  timestamp: string;
  userId: number;
};

export type SmartContract = {
  id: string;
  name: string;
  trigger: ContractTrigger;
  description: string;
  active: boolean;
  lastFiredAt: string | null;
  fireCount: number;
};

export type LedgerAnalytics = {
  totalBlocks: number;
  criticalBlocks: number;
  typeCounts: Record<BlockType, number>;
  chainIntegrity: boolean;
  activeContracts: number;
  contractFires: number;
  ledgerHealthScore: number;
  latestHash: string;
  timestamp: string;
  userId: number | null;
};

const TYPES: BlockType[] = [
  'training',
  'verification',
  'compliance',
  'incident',
  'equipment',
  'risk',
  'audit',
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function forgeHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * HMAC-SHA256 integrity signature for off-chain safety ledger blocks.
 * Not a public blockchain; integrity is keyed with VERIFORGE_LEDGER_HMAC_KEY.
 */
function resolveLedgerHmacKey(): string {
  const key = process.env.VERIFORGE_LEDGER_HMAC_KEY;
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    if (!key || key.length < 32) {
      throw new Error(
        'VERIFORGE_LEDGER_HMAC_KEY (min 32 chars) required in production',
      );
    }
    return key;
  }
  return key && key.length >= 16
    ? key
    : 'veriforge-ledger-dev-hmac-key-min-32b!!';
}

function signHash(hash: string, tenantId: string): string {
  return createHmac('sha256', resolveLedgerHmacKey())
    .update(`${tenantId}:${hash}`)
    .digest('hex');
}

function sigOk(expected: string, actual: string): boolean {
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(actual, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(Uint8Array.from(a), Uint8Array.from(b));
  } catch {
    return false;
  }
}

@Injectable()
export class SafetyBlockchainLedgerService implements OnModuleInit {
  private blockSeq = 1;
  private blocks: LedgerBlock[] = [];
  private contracts: SmartContract[] = [];
  private readonly genesisHash =
    '000000000000000000000000000000000000000000000000000000000000forge';
  private readonly persistPath = (() => {
    const fromEnv = process.env.VERIFORGE_LEDGER_PATH;
    if (process.env.NODE_ENV === 'production') {
      if (!fromEnv) {
        throw new Error('VERIFORGE_LEDGER_PATH is required in production');
      }
      return fromEnv;
    }
    return fromEnv ?? join(process.cwd(), 'data', 'veriforge-ledger.json');
  })();

  constructor(private readonly notifications: NotificationService) {}

  onModuleInit() {
    if (this.loadPersisted()) return;
    this.seed();
    this.persist();
  }

  private loadPersisted(): boolean {
    try {
      if (!existsSync(this.persistPath)) return false;
      const raw = JSON.parse(readFileSync(this.persistPath, 'utf8')) as {
        blockSeq?: number;
        blocks?: LedgerBlock[];
        contracts?: SmartContract[];
      };
      if (!Array.isArray(raw.blocks) || raw.blocks.length === 0) return false;
      this.blocks = raw.blocks;
      this.contracts = raw.contracts ?? [];
      this.blockSeq =
        raw.blockSeq ??
        this.blocks.reduce((m, b) => {
          const n = Number(String(b.id).replace(/\D/g, '')) || 0;
          return Math.max(m, n + 1);
        }, 1);
      return true;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Failed to load ledger from ${this.persistPath}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      return false;
    }
  }

  private persist() {
    try {
      mkdirSync(dirname(this.persistPath), { recursive: true });
      writeFileSync(
        this.persistPath,
        JSON.stringify(
          {
            version: 1,
            integrity: 'hmac-sha256',
            note: 'Off-chain integrity ledger (not L1 blockchain). Anchors optional via hash export.',
            blockSeq: this.blockSeq,
            blocks: this.blocks,
            contracts: this.contracts,
          },
          null,
          2,
        ),
        'utf8',
      );
    } catch (err) {
      const message = `Failed to persist VeriForge ledger to ${this.persistPath}: ${
        err instanceof Error ? err.message : String(err)
      }`;
      throw new Error(message);
    }
  }

  private seed() {
    const tenantId = 'tenant-forge-global';
    const userId = 1;
    this.contracts = [
      {
        id: 'sc-verify',
        name: 'Auto Verification Workflow',
        trigger: 'verificationWorkflow',
        description: 'Auto-trigger forgeCheck workflows on training completion',
        active: true,
        lastFiredAt: null,
        fireCount: 2,
      },
      {
        id: 'sc-expiry',
        name: 'Compliance Auto-Expire',
        trigger: 'complianceExpiry',
        description: 'Auto-expire compliance documents past validity',
        active: true,
        lastFiredAt: null,
        fireCount: 1,
      },
      {
        id: 'sc-incident',
        name: 'Critical Incident Notify',
        trigger: 'criticalIncident',
        description: 'Auto-notify on critical incident block commit',
        active: true,
        lastFiredAt: null,
        fireCount: 3,
      },
      {
        id: 'sc-equip',
        name: 'Inspection Schedule Update',
        trigger: 'equipmentSchedule',
        description: 'Auto-update equipment inspection schedules',
        active: true,
        lastFiredAt: null,
        fireCount: 1,
      },
    ];

    const seeds: Array<{
      type: BlockType;
      title: string;
      summary: string;
      payload: Record<string, string | number | boolean>;
      critical: boolean;
    }> = [
      {
        type: 'training',
        title: 'Training · Hot Work Module',
        summary: 'Module completed with passing score',
        payload: { moduleId: 'mod-hotwork', score: 92, passed: true },
        critical: false,
      },
      {
        type: 'verification',
        title: 'forgeCheck · Cell B',
        summary: 'Workflow verified · all steps forged',
        payload: { forgeStatus: 'verified', steps: 5, pass: true },
        critical: false,
      },
      {
        type: 'compliance',
        title: 'Compliance · COR Pack',
        summary: 'Document hashed and validated',
        payload: { docHash: 'doc-cor-01', expiryDays: 120, valid: true },
        critical: false,
      },
      {
        type: 'incident',
        title: 'Incident · Atmosphere Excursion',
        summary: 'Critical incident chain-of-custody opened',
        payload: { severity: 'critical', evidenceHash: 'ev-atm-01', steps: 3 },
        critical: true,
      },
      {
        type: 'equipment',
        title: 'Equipment · Crane-04 Inspection',
        summary: 'Defect recorded · certification watch',
        payload: { assetId: 'crane-04', defects: 2, certValid: false },
        critical: true,
      },
      {
        type: 'risk',
        title: 'Risk · Crane Path Matrix',
        summary: 'Hazard density scored with controls',
        payload: { hazard: 'struck-by', controls: 2, riskScore: 78 },
        critical: true,
      },
      {
        type: 'audit',
        title: 'Audit · Q Shift Evidence',
        summary: 'Evidence pack hashed and scored',
        payload: { evidenceHash: 'aud-q1', score: 84, findings: 2 },
        critical: false,
      },
    ];

    let prev = this.genesisHash;
    for (const row of seeds) {
      const block = this.buildBlock(row, prev, tenantId, userId);
      this.blocks.push(block);
      prev = block.hash;
    }
  }

  private buildBlock(
    input: {
      type: BlockType;
      title: string;
      summary: string;
      payload: Record<string, string | number | boolean>;
      critical: boolean;
    },
    prevHash: string,
    tenantId: string,
    userId: number,
  ): LedgerBlock {
    const index = this.blocks.length;
    const timestamp = new Date().toISOString();
    const id = `blk-${this.blockSeq++}`;
    const body = JSON.stringify({
      id,
      index,
      type: input.type,
      title: input.title,
      summary: input.summary,
      payload: input.payload,
      critical: input.critical,
      tenantId,
      prevHash,
      timestamp,
      userId,
    });
    const hash = forgeHash(body);
    const signature = signHash(hash, tenantId);
    return {
      id,
      index,
      type: input.type,
      title: input.title,
      summary: input.summary,
      payload: input.payload,
      critical: input.critical,
      tenantId,
      prevHash,
      hash,
      signature,
      timestamp,
      userId,
    };
  }

  private verifyChain(tenantId?: string): boolean {
    const chain = tenantId
      ? this.blocks.filter((b) => b.tenantId === tenantId)
      : this.blocks;
    let prev = this.genesisHash;
    for (const block of chain) {
      if (block.prevHash !== prev) return false;
      const body = JSON.stringify({
        id: block.id,
        index: block.index,
        type: block.type,
        title: block.title,
        summary: block.summary,
        payload: block.payload,
        critical: block.critical,
        tenantId: block.tenantId,
        prevHash: block.prevHash,
        timestamp: block.timestamp,
        userId: block.userId,
      });
      if (forgeHash(body) !== block.hash) return false;
      if (!sigOk(signHash(block.hash, block.tenantId), block.signature))
        return false;
      prev = block.hash;
    }
    return true;
  }

  overview(tenantId = 'tenant-forge-global') {
    return {
      purpose: [
        'HMAC-integrity safety records (off-chain keyed ledger)',
        'Verification proofs (hash + HMAC signature)',
        'Compliance document hashing',
        'Incident chain-of-custody',
        'Equipment inspection ledger',
        'Workforce certification ledger',
        'Risk & audit ledgers (not public L1 blockchain)',
      ],
      integrityModel: 'hmac-sha256',
      durablePath: this.persistPath,
      genesisHash: this.genesisHash,
      blocks: this.blocks.filter((b) => b.tenantId === tenantId),
      contracts: this.contracts,
      analytics: this.analytics(null, tenantId),
    };
  }

  listByType(type: BlockType, tenantId = 'tenant-forge-global') {
    return this.blocks.filter((b) => b.tenantId === tenantId && b.type === type);
  }

  get(id: string) {
    const block = this.blocks.find((b) => b.id === id);
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  commit(
    input: {
      type: BlockType;
      title: string;
      summary: string;
      payload?: Record<string, string | number | boolean>;
      critical?: boolean;
      tenantId?: string;
    },
    userId: number,
  ) {
    const tenantId = input.tenantId ?? 'tenant-forge-global';
    const tenantBlocks = this.blocks.filter((b) => b.tenantId === tenantId);
    const prevHash =
      tenantBlocks.length === 0
        ? this.genesisHash
        : tenantBlocks[tenantBlocks.length - 1].hash;

    const critical =
      input.critical ??
      (input.type === 'incident' ||
        (typeof input.payload?.passed === 'boolean' &&
          input.payload.passed === false) ||
        (typeof input.payload?.pass === 'boolean' &&
          input.payload.pass === false) ||
        (typeof input.payload?.valid === 'boolean' &&
          input.payload.valid === false) ||
        (typeof input.payload?.riskScore === 'number' &&
          Number(input.payload.riskScore) >= 70));

    const block = this.buildBlock(
      {
        type: input.type,
        title: input.title,
        summary: input.summary,
        payload: input.payload ?? {},
        critical,
      },
      prevHash,
      tenantId,
      userId,
    );
    this.blocks.push(block);
    this.persist();

    if (critical) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL LEDGER BLOCK',
        message: `${block.title} · ${block.hash.slice(0, 12)}… · tenant ${tenantId}`,
        forgeStatus: 'failed',
      });
    }

    this.maybeFireContracts(block, userId);

    return {
      block,
      proof: {
        hash: block.hash,
        signature: block.signature,
        prevHash: block.prevHash,
        chainIntegrity: this.verifyChain(tenantId),
      },
      analytics: this.analytics(userId, tenantId),
    };
  }

  private maybeFireContracts(block: LedgerBlock, _userId: number) {
    const now = new Date().toISOString();
    const fire = (trigger: ContractTrigger) => {
      this.contracts = this.contracts.map((c) => {
        if (!c.active || c.trigger !== trigger) return c;
        return {
          ...c,
          lastFiredAt: now,
          fireCount: c.fireCount + 1,
        };
      });
    };

    if (block.type === 'training' || block.type === 'verification') {
      fire('verificationWorkflow');
    }
    if (block.type === 'compliance' && block.critical) {
      fire('complianceExpiry');
    }
    if (block.type === 'incident' && block.critical) {
      fire('criticalIncident');
    }
    if (block.type === 'equipment') {
      fire('equipmentSchedule');
    }
    this.persist();
  }

  fireContract(id: string, userId: number, tenantId = 'tenant-forge-global') {
    const contract = this.contracts.find((c) => c.id === id);
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    if (!contract.active) {
      return { contract, analytics: this.analytics(userId, tenantId) };
    }

    const updated = {
      ...contract,
      lastFiredAt: new Date().toISOString(),
      fireCount: contract.fireCount + 1,
    };
    this.contracts = this.contracts.map((c) => (c.id === id ? updated : c));
    this.persist();

    const typeMap: Record<ContractTrigger, BlockType> = {
      verificationWorkflow: 'verification',
      complianceExpiry: 'compliance',
      criticalIncident: 'incident',
      equipmentSchedule: 'equipment',
    };

    const result = this.commit(
      {
        type: typeMap[contract.trigger],
        title: `Smart Contract · ${contract.name}`,
        summary: `Auto-fired ${contract.trigger}`,
        payload: { contractId: contract.id, auto: true },
        critical:
          contract.trigger === 'criticalIncident' ||
          contract.trigger === 'complianceExpiry',
        tenantId,
      },
      userId,
    );

    return { contract: updated, ...result };
  }

  verify(id: string) {
    const block = this.get(id);
    const body = JSON.stringify({
      id: block.id,
      index: block.index,
      type: block.type,
      title: block.title,
      summary: block.summary,
      payload: block.payload,
      critical: block.critical,
      tenantId: block.tenantId,
      prevHash: block.prevHash,
      timestamp: block.timestamp,
      userId: block.userId,
    });
    const hashOk = forgeHash(body) === block.hash;
    const expectedSig = signHash(block.hash, block.tenantId);
    const signatureOk = sigOk(expectedSig, block.signature);
    const chainOk = this.verifyChain(block.tenantId);
    return {
      block,
      hashOk,
      sigOk: signatureOk,
      chainOk,
      verified: hashOk && signatureOk && chainOk,
      integrityModel: 'hmac-sha256',
    };
  }

  analytics(
    userId: number | null,
    tenantId = 'tenant-forge-global',
  ): LedgerAnalytics {
    const blocks = this.blocks.filter((b) => b.tenantId === tenantId);
    const typeCounts = TYPES.reduce(
      (acc, t) => {
        acc[t] = 0;
        return acc;
      },
      {} as Record<BlockType, number>,
    );
    for (const b of blocks) typeCounts[b.type] += 1;
    const criticalBlocks = blocks.filter((b) => b.critical).length;
    const chainIntegrity = this.verifyChain(tenantId);
    const activeContracts = this.contracts.filter((c) => c.active).length;
    const contractFires = this.contracts.reduce((s, c) => s + c.fireCount, 0);
    const ledgerHealthScore = clamp(
      (chainIntegrity ? 70 : 20) +
        Math.min(blocks.length, 20) -
        criticalBlocks * 4 +
        activeContracts * 2,
    );
    const latestHash =
      blocks.length === 0 ? this.genesisHash : blocks[blocks.length - 1].hash;

    return {
      totalBlocks: blocks.length,
      criticalBlocks,
      typeCounts,
      chainIntegrity,
      activeContracts,
      contractFires,
      ledgerHealthScore,
      latestHash,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
