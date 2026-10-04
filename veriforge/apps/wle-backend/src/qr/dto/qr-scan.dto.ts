import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Raw QR text from camera or manual paste (supervisor/safety station). */
export class QrScanDto {
  @IsString()
  @MinLength(1, { message: 'qr must be a non-empty string' })
  @MaxLength(8000)
  qr!: string;

  /**
   * When the payload is only digits, the API cannot know worker vs equipment.
   * Omit for URL/JSON payloads; required for ambiguous numeric scans.
   */
  @IsOptional()
  @IsIn(['worker', 'equipment'])
  assumedTarget?: 'worker' | 'equipment';
}
