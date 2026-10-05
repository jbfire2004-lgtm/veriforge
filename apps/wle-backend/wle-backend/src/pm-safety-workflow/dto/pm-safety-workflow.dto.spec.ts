import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePmSafetyWorkflowDto } from './create-pm-safety-workflow.dto';
import { TransitionPmSafetyWorkflowDto } from './transition-pm-safety-workflow.dto';

describe('PmSafetyWorkflow DTOs (validation)', () => {
  describe('CreatePmSafetyWorkflowDto', () => {
    it('accepts minimal valid payload', async () => {
      const dto = plainToInstance(CreatePmSafetyWorkflowDto, {
        title: 'Permit A',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects title longer than 300 chars', async () => {
      const dto = plainToInstance(CreatePmSafetyWorkflowDto, {
        title: 'x'.repeat(301),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('rejects invalid ISO date for validFrom', async () => {
      const dto = plainToInstance(CreatePmSafetyWorkflowDto, {
        title: 'T',
        validFrom: 'not-a-date',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'validFrom')).toBe(true);
    });

    it('rejects non-integer companyId after transform', async () => {
      const dto = plainToInstance(CreatePmSafetyWorkflowDto, {
        title: 'T',
        companyId: 1.5,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'companyId')).toBe(true);
    });
  });

  describe('TransitionPmSafetyWorkflowDto', () => {
    it('accepts allowed action', async () => {
      const dto = plainToInstance(TransitionPmSafetyWorkflowDto, {
        action: 'submit',
        note: 'optional',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects unknown action', async () => {
      const dto = plainToInstance(TransitionPmSafetyWorkflowDto, {
        action: 'hack',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('action');
    });

    it('rejects note over max length', async () => {
      const dto = plainToInstance(TransitionPmSafetyWorkflowDto, {
        action: 'cancel',
        note: 'n'.repeat(2001),
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'note')).toBe(true);
    });
  });
});
