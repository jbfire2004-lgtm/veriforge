import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SafetyFormStatus, SafetyFormType, UserRole } from '@prisma/client';
import { SafetyFormAttachmentsService } from '../attachments/attachments.service';
import { DefinitionsLoader } from '../definitions/definitions.loader';
import {
  defaultFormData,
  FORM_TYPE_TO_DEFINITION_ID,
  resolveFormType,
} from '../engine/form-type.registry';
import { validateFormTypeData } from '../schemas/type-schemas';
import { SafetyFormSubmissionsService } from '../submissions/submissions.service';
import { SafetyFormWorkflowsService } from '../workflows/workflows.service';

const WORKER_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.COMPANY_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.COMPANY_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

const ADMIN_OVERRIDE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
];

export type SafetyActor = {
  id: number;
  role: UserRole;
};

@Injectable()
export class SafetyWorkflowEngineService {
  constructor(
    private readonly submissions: SafetyFormSubmissionsService,
    private readonly workflows: SafetyFormWorkflowsService,
    private readonly attachments: SafetyFormAttachmentsService,
    private readonly loader: DefinitionsLoader,
  ) {}

  listForms(filters: {
    companyId?: number;
    projectId?: number;
    workerId?: number;
    formType?: SafetyFormType;
    status?: SafetyFormStatus;
    awaitingReview?: boolean;
  }) {
    const definitionId = filters.formType
      ? FORM_TYPE_TO_DEFINITION_ID[filters.formType]
      : undefined;
    const status = filters.awaitingReview
      ? SafetyFormStatus.SUBMITTED
      : filters.status;

    return this.submissions.list({
      companyId: filters.companyId,
      projectId: filters.projectId,
      workerId: filters.workerId,
      definitionId,
      formType: filters.formType,
      status,
    });
  }

  getForm(id: string) {
    return this.submissions.getById(id);
  }

  async createForm(
    input: {
      formType: SafetyFormType;
      projectId?: number;
      workerId?: number;
      companyId?: number;
      siteId?: number;
      equipmentId?: number;
      title?: string;
      formData?: Record<string, unknown>;
      supervisorId?: number;
    },
    actor: SafetyActor,
  ) {
    this.assertRole(actor.role, WORKER_ROLES, 'create safety forms');

    const definitionId = FORM_TYPE_TO_DEFINITION_ID[input.formType];
    const def = this.loader.get(definitionId);
    if (!def)
      throw new NotFoundException(`No definition for ${input.formType}`);

    const formData = {
      ...defaultFormData(input.formType),
      ...(input.formData ?? {}),
      ...(input.projectId ? { projectId: input.projectId } : {}),
      ...(input.workerId ? { workerId: input.workerId } : {}),
    };

    const form = await this.submissions.create({
      definitionId,
      title: input.title ?? def.name,
      formData,
      companyId: input.companyId,
      projectId: input.projectId,
      siteId: input.siteId,
      workerId: input.workerId,
      equipmentId: input.equipmentId,
      createdById: actor.id,
    });

    if (input.supervisorId) {
      return this.submissions.patchMeta(form.id, {
        supervisorId: input.supervisorId,
        formType: input.formType,
      });
    }

    return this.submissions.patchMeta(form.id, { formType: input.formType });
  }

  async saveDraft(
    id: string,
    formData: Record<string, unknown>,
    actor: SafetyActor,
  ) {
    const form = await this.getForm(id);
    this.assertCanEdit(form.status, actor);
    const typeErrors = validateFormTypeData(
      form.formType ?? resolveFormType(form.definitionId),
      formData,
      true,
    );
    if (typeErrors.length) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: typeErrors,
      });
    }
    return this.submissions.saveDraft(id, formData, actor.id);
  }

  async submit(
    id: string,
    formData: Record<string, unknown>,
    actor: SafetyActor,
    signatures?: Array<{
      fieldId?: string;
      signatureData: string;
      signerName?: string;
    }>,
  ) {
    const form = await this.getForm(id);
    this.assertRole(actor.role, WORKER_ROLES, 'submit safety forms');
    this.assertCanEdit(form.status, actor);

    const formType = form.formType ?? resolveFormType(form.definitionId);
    const typeErrors = validateFormTypeData(formType, formData, false);
    if (typeErrors.length) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: typeErrors,
      });
    }

    return this.submissions.submit(id, formData, actor.id, signatures);
  }

  async transition(
    id: string,
    to: SafetyFormStatus,
    actor: SafetyActor,
    note?: string,
  ) {
    const form = await this.getForm(id);
    this.assertTransitionAllowed(form.status, to, actor);

    const updated = await this.workflows.transition(id, to, actor.id, note);

    if (to === SafetyFormStatus.APPROVED || to === SafetyFormStatus.REJECTED) {
      return this.submissions.patchMeta(id, { supervisorId: actor.id });
    }
    return updated;
  }

  addAttachment(
    formId: string,
    input: {
      fieldId?: string;
      fileName: string;
      mimeType?: string;
      dataUrl?: string;
      storageKey?: string;
      sizeBytes?: number;
    },
    actor: SafetyActor,
  ) {
    this.assertRole(actor.role, WORKER_ROLES, 'attach files');
    return this.attachments.add(formId, input);
  }

  listAttachments(formId: string) {
    return this.attachments.list(formId);
  }

  async removeAttachment(
    formId: string,
    attachmentId: string,
    actor: SafetyActor,
  ) {
    const form = await this.getForm(formId);
    if (
      form.status !== SafetyFormStatus.DRAFT &&
      form.status !== SafetyFormStatus.REJECTED
    ) {
      if (!ADMIN_OVERRIDE_ROLES.includes(actor.role)) {
        throw new BadRequestException(
          'Attachments can only be removed on draft forms',
        );
      }
    }
    return this.attachments.remove(formId, attachmentId);
  }

  private assertCanEdit(status: SafetyFormStatus, actor: SafetyActor) {
    if (
      status === SafetyFormStatus.DRAFT ||
      status === SafetyFormStatus.REJECTED
    ) {
      return;
    }
    if (ADMIN_OVERRIDE_ROLES.includes(actor.role)) return;
    throw new BadRequestException('Form is not editable in current status');
  }

  private assertTransitionAllowed(
    from: SafetyFormStatus,
    to: SafetyFormStatus,
    actor: SafetyActor,
  ) {
    if (from === SafetyFormStatus.DRAFT && to === SafetyFormStatus.SUBMITTED) {
      this.assertRole(actor.role, WORKER_ROLES, 'submit forms');
      return;
    }

    if (to === SafetyFormStatus.APPROVED || to === SafetyFormStatus.REJECTED) {
      if (ADMIN_OVERRIDE_ROLES.includes(actor.role)) return;
      this.assertRole(actor.role, SUPERVISOR_ROLES, 'review forms');
      return;
    }

    if (to === SafetyFormStatus.CLOSED) {
      if (ADMIN_OVERRIDE_ROLES.includes(actor.role)) return;
      this.assertRole(actor.role, SUPERVISOR_ROLES, 'close forms');
      return;
    }

    if (to === SafetyFormStatus.DRAFT && from === SafetyFormStatus.REJECTED) {
      this.assertRole(actor.role, WORKER_ROLES, 'revise forms');
      return;
    }

    if (ADMIN_OVERRIDE_ROLES.includes(actor.role)) return;

    throw new ForbiddenException(
      `Role ${actor.role} cannot transition ${from} → ${to}`,
    );
  }

  private assertRole(role: UserRole, allowed: UserRole[], action: string) {
    if (!allowed.includes(role)) {
      throw new ForbiddenException(`Your role cannot ${action}`);
    }
  }
}
