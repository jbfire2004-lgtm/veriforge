export type VendorDeliveryMode = 'online' | 'in_person' | 'blended';

/** Unified availability slot produced by every vendor adapter. */
export interface VendorAvailability {
  vendorId: string;
  certType: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  seatsAvailable: number;
  deliveryMode: VendorDeliveryMode;
  rating?: number;
  distanceKm?: number;
}

const DELIVERY_MODES: VendorDeliveryMode[] = ['online', 'in_person', 'blended'];

/** Coerce an arbitrary vendor-native delivery descriptor into the unified union. */
export function normalizeDeliveryMode(value: unknown): VendorDeliveryMode {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if ((DELIVERY_MODES as string[]).includes(raw)) {
    return raw as VendorDeliveryMode;
  }
  if (
    raw === 'virtual' ||
    raw === 'remote' ||
    raw === 'self_paced' ||
    raw === 'elearning'
  ) {
    return 'online';
  }
  if (
    raw === 'classroom' ||
    raw === 'onsite' ||
    raw === 'in_class' ||
    raw === 'physical'
  ) {
    return 'in_person';
  }
  if (raw === 'hybrid' || raw === 'mixed') {
    return 'blended';
  }
  return 'in_person';
}
