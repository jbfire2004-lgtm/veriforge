import { HttpException, HttpStatus } from '@nestjs/common';
import type { CreateCoreActionItemDto } from './dto/create-core-action-item.dto';
import type { UpdateCoreActionItemDto } from './dto/update-core-action-item.dto';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Domain rules for Core Action Items (VERA Core).
 */
export class CoreActionItemVerification {
  static assertDueAtNotAncient(iso: string | undefined): void {
    if (!iso) return;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) {
      throw new HttpException(
        'dueAt must be a valid ISO-8601 date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tenYearsAgo = Date.now() - 10 * 365 * MS_PER_DAY;
    if (t < tenYearsAgo) {
      throw new HttpException(
        'dueAt is too far in the past; check the date',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  static isOverdueOpen(
    status: string | undefined,
    dueAtIso: string | undefined,
    now: Date = new Date(),
  ): boolean {
    if (status !== 'OPEN' || !dueAtIso) return false;
    const due = new Date(dueAtIso).getTime();
    return !Number.isNaN(due) && due < now.getTime();
  }

  static validateCreatePayload(dto: CreateCoreActionItemDto): void {
    const title = dto.title?.trim();
    if (!title) {
      throw new HttpException('title is required', HttpStatus.BAD_REQUEST);
    }
    CoreActionItemVerification.assertDueAtNotAncient(dto.dueAt);
  }

  static validateUpdatePayload(dto: UpdateCoreActionItemDto): void {
    if (dto.title !== undefined && dto.title.trim() === '') {
      throw new HttpException('title cannot be empty', HttpStatus.BAD_REQUEST);
    }
    CoreActionItemVerification.assertDueAtNotAncient(dto.dueAt);
  }
}
