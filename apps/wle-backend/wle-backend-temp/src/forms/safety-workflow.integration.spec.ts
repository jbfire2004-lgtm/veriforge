import { SafetyFormType } from '@prisma/client';
import { SafetyWorkflowEngineService } from './workflows/safety-workflow-engine.service';
import { UserRole } from '@prisma/client';

describe('Safety workflow integration scenarios', () => {
  const prismaForm = {
    id: 'form-abc',
    definitionId: 'flha',
    formType: SafetyFormType.FLHA,
    status: 'DRAFT',
    formData: {},
  };

  const submissions = {
    list: jest.fn(),
    getById: jest.fn().mockResolvedValue(prismaForm),
    create: jest.fn().mockResolvedValue(prismaForm),
    saveDraft: jest.fn(),
    submit: jest.fn().mockResolvedValue({ ...prismaForm, status: 'SUBMITTED' }),
    patchMeta: jest
      .fn()
      .mockImplementation((_id, data) =>
        Promise.resolve({ ...prismaForm, ...data }),
      ),
  };

  const workflows = {
    transition: jest
      .fn()
      .mockImplementation((_id, status) =>
        Promise.resolve({ ...prismaForm, status }),
      ),
    assertTransition: jest.fn(),
  };

  const attachments = {
    add: jest.fn().mockResolvedValue({ id: 'att-1', fileName: 'site.jpg' }),
    list: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue({ ok: true }),
  };

  const loader = {
    get: jest.fn().mockReturnValue({
      id: 'flha',
      name: 'FLHA',
      version: 1,
      fields: [
        {
          id: 'taskDescription',
          type: 'textarea',
          label: 'Task',
          required: true,
        },
        { id: 'hazards', type: 'hazard', label: 'Hazards', required: true },
        {
          id: 'controlsAdequate',
          type: 'select',
          label: 'Controls',
          required: true,
        },
      ],
      workflow: { requiresSupervisor: true },
    }),
  };

  const engine = new SafetyWorkflowEngineService(
    submissions as never,
    workflows as never,
    attachments as never,
    loader as never,
  );

  const worker = { id: 1, role: UserRole.WORKER };
  const supervisor = { id: 2, role: UserRole.SUPERVISOR };

  it('worker creates and submits FLHA', async () => {
    const created = await engine.createForm(
      { formType: SafetyFormType.FLHA, projectId: 9, workerId: 3 },
      worker,
    );
    expect(created.id).toBe('form-abc');

    const payload = {
      taskDescription: 'Install conduit',
      hazards: [{ id: 'fall', label: 'Fall' }],
      controlsAdequate: 'yes' as const,
      workDate: '2026-06-15',
    };

    submissions.getById.mockResolvedValue({ ...prismaForm, formData: payload });
    const submitted = await engine.submit('form-abc', payload, worker);
    expect(submitted.status).toBe('SUBMITTED');
    expect(submissions.submit).toHaveBeenCalled();
  });

  it('supervisor approves submitted form', async () => {
    submissions.getById.mockResolvedValue({
      ...prismaForm,
      status: 'SUBMITTED',
    });

    const approved = await engine.transition(
      'form-abc',
      'APPROVED' as never,
      supervisor,
      'Looks good',
    );
    expect(workflows.transition).toHaveBeenCalledWith(
      'form-abc',
      'APPROVED',
      2,
      'Looks good',
    );
    expect(approved).toBeDefined();
  });

  it('attachments linked to safety form', async () => {
    submissions.getById.mockResolvedValue({ ...prismaForm, status: 'DRAFT' });
    const att = await engine.addAttachment(
      'form-abc',
      {
        fileName: 'hazard.jpg',
        mimeType: 'image/jpeg',
        dataUrl: 'data:image/jpeg;base64,x',
      },
      worker,
    );
    expect(att.id).toBe('att-1');

    const listed = await engine.listAttachments('form-abc');
    expect(attachments.list).toHaveBeenCalledWith('form-abc');
    expect(listed).toEqual([]);
  });
});
