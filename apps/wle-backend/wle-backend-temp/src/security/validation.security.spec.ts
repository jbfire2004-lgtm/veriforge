import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateComplianceRuleDto } from '../modules/project-compliance/dto/create-compliance-rule.dto';
import { CredentialLedgerBackfillDto } from '../modules/credential-ledger/dto/credential-ledger-backfill.dto';
import { SafetyFormTransitionDto } from '../forms/dto/safety-form-transition.dto';
import { AdminLoginDto } from '../admin/dto/admin-login.dto';
import { UpsertProviderSyncConfigDto } from '../modules/provider-sync-engine/dto/provider-sync-config.dto';
import {
  CreateSafetyWorkflowFormDto,
  SubmitSafetyWorkflowFormDto,
} from '../forms/dto/safety-workflow.dto';
import { SafetyFormStatus } from '@prisma/client';
import { ProjectComplianceRuleType } from '@prisma/client';
import { SafetyFormType } from '@prisma/client';

describe('Security DTO validation', () => {
  it('rejects invalid compliance rule payloads', async () => {
    const dto = plainToInstance(CreateComplianceRuleDto, {
      ruleType: 'NOT_A_RULE',
      requiredCredentialTypeId: -1,
      metadata: { extra: true },
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts valid compliance rule payloads', async () => {
    const dto = plainToInstance(CreateComplianceRuleDto, {
      ruleType: ProjectComplianceRuleType.ALL_WORKERS,
      requiredCredentialTypeId: 12,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects credential backfill limit above max', async () => {
    const dto = plainToInstance(CredentialLedgerBackfillDto, {
      limit: 99999,
      dryRun: true,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid safety form transition status', async () => {
    const dto = plainToInstance(SafetyFormTransitionDto, {
      status: 'HACKED',
      note: 'x'.repeat(3000),
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts valid safety form transition', async () => {
    const dto = plainToInstance(SafetyFormTransitionDto, {
      status: SafetyFormStatus.APPROVED,
      note: 'Looks good',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid admin login payloads', async () => {
    const dto = plainToInstance(AdminLoginDto, {
      email: 'not-an-email',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid provider sync config payloads', async () => {
    const dto = plainToInstance(UpsertProviderSyncConfigDto, {
      syncMode: 'smtp',
      pollIntervalMinutes: 0,
      webhookSecret: 'short',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts valid safety workflow create payloads', async () => {
    const dto = plainToInstance(CreateSafetyWorkflowFormDto, {
      formType: SafetyFormType.JHA,
      projectId: 1,
      formData: { hazard: 'line-of-fire' },
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid safety workflow submit signatures', async () => {
    const dto = plainToInstance(SubmitSafetyWorkflowFormDto, {
      formData: {},
      signatures: [{ signatureData: '' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
