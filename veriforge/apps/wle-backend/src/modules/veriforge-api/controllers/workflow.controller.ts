import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { resolveUserId } from '../veriforge-request.util';
import {
  WorkflowBuilderService,
  type WorkflowActionType,
  type WorkflowConnector,
  type WorkflowNode,
  type WorkflowNodeKind,
  type WorkflowTrigger,
  type WorkflowType,
} from '../services/workflow-builder.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/workflows')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeWorkflowController {
  constructor(private readonly workflows: WorkflowBuilderService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  list(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.workflows.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('runs')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  runs(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.workflows.listRuns(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  getById(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.workflows.getById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  create(
    @Body()
    body: {
      name: string;
      type: WorkflowType;
      description?: string;
      nodes?: WorkflowNode[];
      connectors?: WorkflowConnector[];
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.workflows.create(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Put(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      connectors?: WorkflowConnector[];
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.workflows.update(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/nodes')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  addNode(
    @Param('id') id: string,
    @Body()
    body: {
      type: WorkflowNodeKind;
      label: string;
      x: number;
      y: number;
      shape?: 'rectangle' | 'diamond' | 'hex';
      actionType?: WorkflowActionType;
      trigger?: WorkflowTrigger;
      condition?: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.workflows.addNode(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/connect')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  connect(
    @Param('id') id: string,
    @Body()
    body: {
      fromNodeId: string;
      toNodeId: string;
      label?: string;
      branch?: 'yes' | 'no' | 'default';
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.workflows.connect(id, body), {
      userId: resolveUserId(req, body),
      forgeStatus: 'forged',
    });
  }

  @Post(':id/execute')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  execute(
    @Param('id') id: string,
    @Body() body: { decisionPass?: boolean; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.workflows.execute(
      id,
      userId,
      body.decisionPass ?? true,
    );
    return buildSuccess(result, {
      userId,
      forgeStatus: result.run.status === 'completed' ? 'verified' : 'failed',
    });
  }
}
