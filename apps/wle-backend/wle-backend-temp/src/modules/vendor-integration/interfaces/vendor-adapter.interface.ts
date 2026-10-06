import {
  VendorAvailability,
  VendorDeliveryMode,
} from './vendor-availability.interface';

export type VendorAdapterType =
  | 'calendly'
  | 'thinkific'
  | 'absorb'
  | 'rest'
  | 'manual';

/** Vendor connection + behavior configuration injected into each adapter. */
export interface VendorConfig {
  vendorId: string;
  name?: string;
  type: VendorAdapterType;
  certTypes?: string[];
  baseUrl?: string;
  apiKey?: string;
  apiToken?: string;
  subdomain?: string;
  organizationUri?: string;
  defaultRating?: number;
  defaultDeliveryMode?: VendorDeliveryMode;
  defaultPrice?: number;
  defaultSeats?: number;
  distanceKm?: number;
  /** Operator-curated slots for the manual adapter. */
  manualAvailability?: VendorAvailability[];
}

export interface ConfirmBookingPayload {
  workerId: string | number;
  certificationId: string;
  date: string;
  time: string;
}

export interface ConfirmBookingResult {
  confirmationCode: string;
}

/** Contract every vendor adapter must satisfy. */
export interface VendorAdapter {
  readonly vendorId: string;
  fetchAvailability(certType: string): Promise<VendorAvailability[]>;
  confirmBooking(payload: ConfirmBookingPayload): Promise<ConfirmBookingResult>;
}
