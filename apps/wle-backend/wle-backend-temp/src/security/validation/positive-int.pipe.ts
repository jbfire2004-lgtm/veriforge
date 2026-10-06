import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/** Rejects non-positive integer path/query parameters on public endpoints. */
@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0 || n > 2_147_483_647) {
      throw new BadRequestException('Invalid id');
    }
    return n;
  }
}
