import { Injectable } from '@nestjs/common';
import { TenantRegistryService } from './tenant-registry.service';

export type ApiNode = {
  id: string;
  region: string;
  capacity: number;
  currentLoad: number;
  healthy: boolean;
  tenantsPinned: string[];
};

@Injectable()
export class TenantScalingService {
  private nodes: ApiNode[] = [
    {
      id: 'api-node-a',
      region: 'us-west',
      capacity: 100,
      currentLoad: 34,
      healthy: true,
      tenantsPinned: ['tenant-alloy'],
    },
    {
      id: 'api-node-b',
      region: 'us-west',
      capacity: 100,
      currentLoad: 61,
      healthy: true,
      tenantsPinned: ['tenant-forgeco'],
    },
    {
      id: 'api-node-c',
      region: 'us-east',
      capacity: 100,
      currentLoad: 18,
      healthy: true,
      tenantsPinned: [],
    },
  ];

  constructor(private readonly registry: TenantRegistryService) {}

  topology() {
    return {
      strategy: 'horizontal-api-nodes',
      loadBalancer: 'tenant-aware-least-connections',
      autoScale: {
        scaleOutThreshold: 75,
        scaleInThreshold: 25,
        metric: 'tenant.loadScore',
      },
      nodes: this.nodes,
      tenants: this.registry.listTenants().map((tenant) => ({
        tenantId: tenant.tenantId,
        loadScore: tenant.loadScore,
        route: this.routeTenant(tenant.tenantId),
      })),
    };
  }

  routeTenant(tenantId: string) {
    const tenant = this.registry.assertActive(tenantId);
    const pinned = this.nodes.find(
      (node) => node.healthy && node.tenantsPinned.includes(tenantId),
    );
    if (pinned) {
      return {
        tenantId,
        nodeId: pinned.id,
        reason: 'pinned-affinity',
        loadScore: tenant.loadScore,
      };
    }

    const candidates = this.nodes
      .filter((node) => node.healthy)
      .sort(
        (a, b) =>
          a.currentLoad / a.capacity - b.currentLoad / b.capacity,
      );
    const selected = candidates[0];
    return {
      tenantId,
      nodeId: selected?.id ?? 'api-node-a',
      reason: 'least-connections',
      loadScore: tenant.loadScore,
    };
  }

  evaluateAutoScale() {
    const hot = this.registry
      .listTenants()
      .filter((tenant) => tenant.loadScore >= 75);
    const cold = this.registry
      .listTenants()
      .filter((tenant) => tenant.loadScore <= 25);

    const actions: Array<{ action: string; tenantId: string; detail: string }> =
      [];
    for (const tenant of hot) {
      actions.push({
        action: 'scale-out',
        tenantId: tenant.tenantId,
        detail: `Load ${tenant.loadScore} exceeded threshold; provision additional API capacity`,
      });
      this.registry.bumpLoad(tenant.tenantId, -5);
    }
    for (const tenant of cold) {
      actions.push({
        action: 'scale-in-candidate',
        tenantId: tenant.tenantId,
        detail: `Load ${tenant.loadScore} below threshold; eligible for consolidation`,
      });
    }
    return { evaluatedAt: new Date().toISOString(), actions };
  }
}
