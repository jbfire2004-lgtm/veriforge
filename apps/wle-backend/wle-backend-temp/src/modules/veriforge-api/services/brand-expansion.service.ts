import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type SubBrandId =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incidents'
  | 'fieldops'
  | 'risk'
  | 'audit'
  | 'contractor'
  | 'culture';

export type CampaignStatus = 'draft' | 'active' | 'archived';
export type GovernanceSeverity = 'required' | 'recommended' | 'forbidden';
export type AssetKind =
  | 'icon'
  | 'background'
  | 'accent'
  | 'template'
  | 'logo';

export type CoreBrandIdentity = {
  angularGeometry: boolean;
  metallicGradients: boolean;
  colors: {
    forgeRed: string;
    ironBlack: string;
    steelGrey: string;
    safetyWhite: string;
  };
  typography: string;
  tagline: string;
  emblem: string;
};

export type SubBrand = {
  id: SubBrandId;
  name: string;
  productLine: string;
  accentName: string;
  accentColor: string;
  emblem: string;
  messaging: string;
  active: boolean;
  timestamp: string;
  userId: number;
};

export type ProductLine = {
  id: string;
  subBrandId: SubBrandId;
  name: string;
  code: string;
  logoMark: string;
  gradient: string;
  timestamp: string;
  userId: number;
};

export type BrandCampaign = {
  id: string;
  title: string;
  subBrandId: SubBrandId | 'core';
  heroLine: string;
  cta: string;
  status: CampaignStatus;
  reachScore: number;
  timestamp: string;
  userId: number;
};

export type GovernanceRule = {
  id: string;
  domain: 'logo' | 'color' | 'typography' | 'motion';
  rule: string;
  severity: GovernanceSeverity;
  timestamp: string;
  userId: number;
};

export type BrandAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  subBrandId: SubBrandId | 'core';
  description: string;
  timestamp: string;
  userId: number;
};

export type BrandExpansionAnalytics = {
  subBrandCount: number;
  activeSubBrands: number;
  productLineCount: number;
  activeCampaigns: number;
  governanceRules: number;
  assetCount: number;
  brandConsistencyScore: number;
  expansionReadiness: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class BrandExpansionService {
  private productSeq = 10;
  private campaignSeq = 4;
  private assetSeq = 12;
  private ruleSeq = 13;

  private identity: CoreBrandIdentity = {
    angularGeometry: true,
    metallicGradients: true,
    colors: {
      forgeRed: '#C62828',
      ironBlack: '#1A1A1A',
      steelGrey: '#424242',
      safetyWhite: '#FAFAFA',
    },
    typography: 'Orbitron / Exo 2 · bold geometric uppercase',
    tagline: 'Forged for Absolute Safety',
    emblem: 'Forged V',
  };

  private subBrands: SubBrand[] = [];
  private products: ProductLine[] = [];
  private campaigns: BrandCampaign[] = [];
  private rules: GovernanceRule[] = [];
  private assets: BrandAsset[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;

    this.subBrands = [
      {
        id: 'training',
        name: 'VeriForge Training',
        productLine: 'ForgeTrain',
        accentName: 'steel-blue',
        accentColor: '#4A6FA5',
        emblem: 'Forged V + bolt',
        messaging: 'Train with industrial precision.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'verification',
        name: 'VeriForge Verification',
        productLine: 'ForgeCheck',
        accentName: 'ember-orange',
        accentColor: '#E65100',
        emblem: 'Forged V + check rail',
        messaging: 'Verify what was forged.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'compliance',
        name: 'VeriForge Compliance',
        productLine: 'ForgeSeal',
        accentName: 'slate-teal',
        accentColor: '#2F6F6A',
        emblem: 'Forged V + seal',
        messaging: 'Compliance engineered to hold.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'incidents',
        name: 'VeriForge Incidents',
        productLine: 'ForgeSignal',
        accentName: 'hazard-yellow',
        accentColor: '#F9A825',
        emblem: 'Forged V + alert edge',
        messaging: 'Capture. Investigate. Close.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'fieldops',
        name: 'VeriForge FieldOps',
        productLine: 'ForgeField',
        accentName: 'oxide-green',
        accentColor: '#558B2F',
        emblem: 'Forged V + map pin',
        messaging: 'Field command, forged in place.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'risk',
        name: 'VeriForge Risk',
        productLine: 'ForgeRisk',
        accentName: 'crimson-steel',
        accentColor: '#8E2430',
        emblem: 'Forged V + heat edge',
        messaging: 'Risk scored before it spreads.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'audit',
        name: 'VeriForge Audit',
        productLine: 'ForgeLedger',
        accentName: 'graphite-silver',
        accentColor: '#9E9E9E',
        emblem: 'Forged V + ledger',
        messaging: 'Audits with metallic clarity.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'contractor',
        name: 'VeriForge Contractor',
        productLine: 'ForgeGate',
        accentName: 'bronze',
        accentColor: '#A67C52',
        emblem: 'Forged V + gate',
        messaging: 'Contractors cleared to enter.',
        active: true,
        timestamp: now,
        userId,
      },
      {
        id: 'culture',
        name: 'VeriForge Culture',
        productLine: 'ForgePulse',
        accentName: 'violet-steel',
        accentColor: '#6A5ACD',
        emblem: 'Forged V + pulse',
        messaging: 'Culture measured in behavior.',
        active: true,
        timestamp: now,
        userId,
      },
    ];

    this.products = this.subBrands.map((sb, i) => ({
      id: `pl-${i + 1}`,
      subBrandId: sb.id,
      name: `${sb.productLine} Suite`,
      code: `VF-${sb.id.toUpperCase().slice(0, 3)}-01`,
      logoMark: `Angular ${sb.productLine} mark`,
      gradient: `linear-gradient(145deg, #1A1A1A 0%, #424242 55%, ${sb.accentColor}33 100%)`,
      timestamp: now,
      userId,
    }));

    this.campaigns = [
      {
        id: 'cmp-1',
        title: 'Absolute Safety Launch',
        subBrandId: 'core',
        heroLine: 'Forged for Absolute Safety',
        cta: 'Enter the Forge',
        status: 'active',
        reachScore: 92,
        timestamp: now,
        userId,
      },
      {
        id: 'cmp-2',
        title: 'ForgeCheck Precision Drive',
        subBrandId: 'verification',
        heroLine: 'Verification engineered with precision.',
        cta: 'Run forgeCheck',
        status: 'active',
        reachScore: 84,
        timestamp: now,
        userId,
      },
      {
        id: 'cmp-3',
        title: 'FieldOps Command Push',
        subBrandId: 'fieldops',
        heroLine: 'Field command, forged in place.',
        cta: 'Open Field Ops',
        status: 'draft',
        reachScore: 61,
        timestamp: now,
        userId,
      },
    ];

    this.rules = [
      {
        id: 'gr-1',
        domain: 'logo',
        rule: 'Always use the forged V emblem; never round or soft-edge the mark.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-2',
        domain: 'logo',
        rule: 'Do not place logo on busy photography without steel panel backing.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-3',
        domain: 'color',
        rule: 'Core palette locked: #C62828, #1A1A1A, #424242, #FAFAFA.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-4',
        domain: 'color',
        rule: 'Sub-brand accents are secondary only; forge red remains primary CTA.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-5',
        domain: 'color',
        rule: 'Forbidden: purple-on-white defaults, cream terracotta stacks, soft pastels.',
        severity: 'forbidden',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-6',
        domain: 'typography',
        rule: 'Headings: Orbitron/Exo 2, uppercase, bold geometric tracking.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-7',
        domain: 'typography',
        rule: 'Do not use Inter, Roboto, Arial, or system UI as brand display fonts.',
        severity: 'forbidden',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-8',
        domain: 'motion',
        rule: 'Motion must reinforce hierarchy: heat glow, edge wipe, metallic rise.',
        severity: 'recommended',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-9',
        domain: 'motion',
        rule: 'No bounce, confetti, or playful easing on industrial surfaces.',
        severity: 'forbidden',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-10',
        domain: 'logo',
        rule: 'Minimum clear space = height of the V stem on all sides.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-11',
        domain: 'color',
        rule: 'Critical alerts always use forge red glow; never accent-only.',
        severity: 'required',
        timestamp: now,
        userId,
      },
      {
        id: 'gr-12',
        domain: 'typography',
        rule: 'Body copy may use Exo 2 regular; keep industrial density.',
        severity: 'recommended',
        timestamp: now,
        userId,
      },
    ];

    this.assets = [
      {
        id: 'ba-1',
        kind: 'logo',
        name: 'Forged V Core Mark',
        subBrandId: 'core',
        description: 'Primary angular emblem with red metallic fill',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-2',
        kind: 'icon',
        name: 'Anvil Icon Set',
        subBrandId: 'core',
        description: 'Angular industrial icons',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-3',
        kind: 'icon',
        name: 'ForgeBolt Icon',
        subBrandId: 'verification',
        description: 'Verification bolt mark',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-4',
        kind: 'background',
        name: 'Iron Plate Gradient',
        subBrandId: 'core',
        description: 'linear-gradient(145deg, #1A1A1A, #424242)',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-5',
        kind: 'accent',
        name: 'Red Accent Line',
        subBrandId: 'core',
        description: '0.5–2px forge-red rule with glow',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-6',
        kind: 'template',
        name: 'Campaign Hero Template',
        subBrandId: 'core',
        description: 'Angular hero + red metallic CTA',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-7',
        kind: 'template',
        name: 'Sub-Brand Card Template',
        subBrandId: 'training',
        description: 'Accent stripe + forged V lockup',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-8',
        kind: 'background',
        name: 'Hazard Field Mesh',
        subBrandId: 'incidents',
        description: 'Steel grid with hazard-yellow edge',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-9',
        kind: 'logo',
        name: 'ForgeCheck Product Mark',
        subBrandId: 'verification',
        description: 'Angular product logo',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-10',
        kind: 'icon',
        name: 'Shield Grid Icon',
        subBrandId: 'compliance',
        description: 'Compliance shield grid',
        timestamp: now,
        userId,
      },
      {
        id: 'ba-11',
        kind: 'accent',
        name: 'Sub-Brand Accent Rails',
        subBrandId: 'fieldops',
        description: 'Secondary accent left rail',
        timestamp: now,
        userId,
      },
    ];
  }

  overview() {
    return {
      identity: this.identity,
      subBrands: this.subBrands,
      products: this.products,
      campaigns: this.campaigns,
      rules: this.rules,
      assets: this.assets,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): BrandExpansionAnalytics {
    const activeSubBrands = this.subBrands.filter((s) => s.active).length;
    const activeCampaigns = this.campaigns.filter((c) => c.status === 'active').length;
    const requiredRules = this.rules.filter((r) => r.severity === 'required').length;
    const brandConsistencyScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (activeSubBrands / Math.max(1, this.subBrands.length)) * 35 +
            (this.products.length / Math.max(1, this.subBrands.length)) * 20 +
            (activeCampaigns > 0 ? 15 : 5) +
            (requiredRules / Math.max(1, this.rules.length)) * 20 +
            (this.assets.length >= 8 ? 10 : 5),
        ),
      ),
    );
    return {
      subBrandCount: this.subBrands.length,
      activeSubBrands,
      productLineCount: this.products.length,
      activeCampaigns,
      governanceRules: this.rules.length,
      assetCount: this.assets.length,
      brandConsistencyScore,
      expansionReadiness: brandConsistencyScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private getSubBrand(id: SubBrandId) {
    const row = this.subBrands.find((s) => s.id === id);
    if (!row) throw new NotFoundException(`Sub-brand ${id} not found`);
    return row;
  }

  setSubBrandActive(id: SubBrandId, active: boolean, userId: number) {
    const row = this.getSubBrand(id);
    row.active = active;
    row.userId = userId;
    row.timestamp = new Date().toISOString();
    if (!active) {
      this.notifications.enqueue({
        title: 'SUB-BRAND DEACTIVATED',
        message: `${row.name} deactivated in brand expansion registry.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    return row;
  }

  createProduct(
    input: {
      subBrandId: SubBrandId;
      name: string;
      code?: string;
    },
    userId: number,
  ) {
    const sb = this.getSubBrand(input.subBrandId);
    const product: ProductLine = {
      id: `pl-${this.productSeq++}`,
      subBrandId: sb.id,
      name: input.name,
      code:
        input.code ??
        `VF-${sb.id.toUpperCase().slice(0, 3)}-${String(this.productSeq).padStart(2, '0')}`,
      logoMark: `Angular ${input.name} mark`,
      gradient: `linear-gradient(145deg, #1A1A1A 0%, #424242 55%, ${sb.accentColor}33 100%)`,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.products.unshift(product);
    return product;
  }

  createCampaign(
    input: {
      title: string;
      subBrandId?: SubBrandId | 'core';
      heroLine?: string;
      cta?: string;
    },
    userId: number,
  ) {
    const campaign: BrandCampaign = {
      id: `cmp-${this.campaignSeq++}`,
      title: input.title,
      subBrandId: input.subBrandId ?? 'core',
      heroLine: input.heroLine ?? this.identity.tagline,
      cta: input.cta ?? 'Enter the Forge',
      status: 'draft',
      reachScore: 50,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.campaigns.unshift(campaign);
    return campaign;
  }

  activateCampaign(id: string, userId: number) {
    const campaign = this.campaigns.find((c) => c.id === id);
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    campaign.status = 'active';
    campaign.reachScore = Math.min(100, campaign.reachScore + 15);
    campaign.userId = userId;
    campaign.timestamp = new Date().toISOString();
    return campaign;
  }

  addRule(
    input: {
      domain: 'logo' | 'color' | 'typography' | 'motion';
      rule: string;
      severity: GovernanceSeverity;
    },
    userId: number,
  ) {
    const rule: GovernanceRule = {
      id: `gr-${this.ruleSeq++}`,
      domain: input.domain,
      rule: input.rule,
      severity: input.severity,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.rules.unshift(rule);
    return rule;
  }

  addAsset(
    input: {
      kind: AssetKind;
      name: string;
      subBrandId?: SubBrandId | 'core';
      description: string;
    },
    userId: number,
  ) {
    const asset: BrandAsset = {
      id: `ba-${this.assetSeq++}`,
      kind: input.kind,
      name: input.name,
      subBrandId: input.subBrandId ?? 'core',
      description: input.description,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.assets.unshift(asset);
    return asset;
  }
}
