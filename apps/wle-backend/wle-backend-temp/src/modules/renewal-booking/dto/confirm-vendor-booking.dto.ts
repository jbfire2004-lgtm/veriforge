import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export type VendorBookingStatus = 'confirmed' | 'rejected';

export class ConfirmVendorBookingDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsString()
  @IsNotEmpty()
  vendorConfirmationCode!: string;

  @IsIn(['confirmed', 'rejected'])
  status!: VendorBookingStatus;
}
