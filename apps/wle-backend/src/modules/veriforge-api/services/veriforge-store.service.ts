import { Injectable } from '@nestjs/common';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  forgeStatus: 'active' | 'inactive' | 'review';
};

@Injectable()
export class VeriForgeStoreService {
  private nextUserId = 4;

  users: UserRecord[] = [
    {
      id: 1,
      name: 'Maya Ironwood',
      email: 'maya.ironwood@veriforge.io',
      role: 'Supervisor',
      forgeStatus: 'active',
    },
    {
      id: 2,
      name: 'Dylan Forge',
      email: 'dylan.forge@veriforge.io',
      role: 'Trainer',
      forgeStatus: 'active',
    },
    {
      id: 3,
      name: 'Rhea Calder',
      email: 'rhea.calder@veriforge.io',
      role: 'Auditor',
      forgeStatus: 'review',
    },
  ];

  trainingModules = [
    { id: 'm-101', title: 'Lockout-Tagout', forgeStatus: 'active' },
    { id: 'm-102', title: 'High-Heat Response', forgeStatus: 'active' },
    { id: 'm-103', title: 'Heavy Lift Safety', forgeStatus: 'active' },
  ];

  verificationRuns: Array<{
    id: string;
    targetId: string;
    workflowId: string;
    forgeStatus: 'pending' | 'verified' | 'failed';
    createdAt: string;
  }> = [];

  getNextUserId(): number {
    const id = this.nextUserId;
    this.nextUserId += 1;
    return id;
  }
}
