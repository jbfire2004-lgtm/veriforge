import { ForbiddenException } from '@nestjs/common';
import { SafetyFormStatus, SafetyFormType, UserRole } from '@prisma/client';
import { SafetyWorkflowEngineService } from './safety-workflow-engine.service';

describe('SafetyWorkflowEngineService', () => {
  const submissions = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    saveDraft: jest.fn(),
    submit: jest.fn(),
    patchMeta: jest.fn(),
  };
  const workflows = {
    transition: jest.fn(),
    assertTransition: jest.fn(),
  };
  const attachments = {
    add: jest.fn(),
    list: jest.fn(),
    remove: jest.fn(),
  };
  const loader = {
    get: jest.fn().mockReturnValue({
      id: 'jha',
      name: 'JHA',
      version: 1,
      fields: [],
    }),
  };

  const engine = new SafetyWorkflowEngineService(
    submissions as never,
    workflows as never,
    attachments as never,
    loader as never,
  );

  const worker = { id: 10, role: UserRole.WORKER };
  const supervisor = { id: 20, role: UserRole.SUPERVISOR };

  beforeEach(() => jest.clearAllMocks());

  it('creates a form with default structure for JHA', async () => {
    submissions.create.mockResolvedValue({ id: 'form-1' });
    submissions.patchMeta.mockResolvedValue({
      id: 'form-1',
      formType: SafetyFormType.JHA,
    });

    await engine.createForm(
      { formType: SafetyFormType.JHA, projectId: 1, workerId: 5 },
      worker,
    );

    expect(submissions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        definitionId: 'jha',
        projectId: 1,
        workerId: 5,
        formData: expect.objectContaining({ workDate: expect.any(String) }),
      }),
    );
  });

  it('blocks workers from approving forms', async () => {
    submissions.getById.mockResolvedValue({
      id: 'form-1',
      status: SafetyFormStatus.SUBMITTED,
      definitionId: 'jha',
      formType: SafetyFormType.JHA,
    });

    await expect(
      engine.transition('form-1', SafetyFormStatus.APPROVED, worker),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows supervisor to approve submitted forms', async () => {
    submissions.getById.mockResolvedValue({
      id: 'form-1',
      status: SafetyFormStatus.SUBMITTED,
      definitionId: 'jha',
      formType: SafetyFormType.JHA,
    });
    workflows.transition.mockResolvedValue({
      id: 'form-1',
      status: 'APPROVED',
    });
    submissions.patchMeta.mockResolvedValue({ id: 'form-1', supervisorId: 20 });

    await engine.transition('form-1', SafetyFormStatus.APPROVED, supervisor);

    expect(workflows.transition).toHaveBeenCalledWith(
      'form-1',
      SafetyFormStatus.APPROVED,
      20,
      undefined,
    );
  });

  it('adds and removes attachments', async () => {
    submissions.getById.mockResolvedValue({
      id: 'form-1',
      status: SafetyFormStatus.DRAFT,
    });
    attachments.add.mockResolvedValue({ id: 'att-1' });
    attachments.remove.mockResolvedValue({ ok: true });

    await engine.addAttachment(
      'form-1',
      { fileName: 'photo.jpg', dataUrl: 'data:image/jpeg;base64,abc' },
      worker,
    );
    await engine.removeAttachment('form-1', 'att-1', worker);

    expect(attachments.add).toHaveBeenCalled();
    expect(attachments.remove).toHaveBeenCalledWith('form-1', 'att-1');
  });
});
