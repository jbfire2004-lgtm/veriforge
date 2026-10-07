import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { UserService } from '../services/user.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/users')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeUsersController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_READ)
  list(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.userService.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_READ)
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.userService.getById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_WRITE)
  create(
    @Body()
    body: { name: string; email: string; role: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.userService.create(body), {
      userId: resolveUserId(req, body),
      forgeStatus: 'forged',
    });
  }

  @Put(':id/update')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_WRITE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { name?: string; email?: string; role?: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.userService.update(id, body), {
      userId: resolveUserId(req, body),
      forgeStatus: 'forged',
    });
  }

  @Delete(':id/remove')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_DELETE)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.userService.remove(id), {
      userId: resolveUserId(req),
      forgeStatus: 'forged',
    });
  }
}
