import { apiFetchJson } from "@/lib/api-fetch";

export type VendorDeliveryMode = "online" | "in_person" | "blended";

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

export interface RenewalOptionItem {
  certificationId: string;
  certificationName: string;
  expiresOn: string;
  recommended: VendorAvailability | null;
  options: VendorAvailability[];
}

export interface RenewalOptionsResponse {
  workerId: string;
  items: RenewalOptionItem[];
}

export interface CertTypeAvailabilityResponse {
  certType: string;
  recommended: VendorAvailability | null;
  options: VendorAvailability[];
}

export interface BookRenewalDto {
  workerId: string;
  certificationId: string;
  vendorId: string;
  date: string;
  time: string;
}

export interface BookingSummary {
  bookingId: string;
  status: string;
  certType: string;
  vendorId: string;
  vendorConfirmationCode: string | null;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface ConfirmVendorBookingDto {
  bookingId: string;
  vendorConfirmationCode: string;
  status: "confirmed" | "rejected";
}

const BASE = "/api/v1";

export function getRenewalOptions(workerId: string): Promise<RenewalOptionsResponse> {
  return apiFetchJson<RenewalOptionsResponse>(`${BASE}/renewals/${encodeURIComponent(workerId)}`);
}

export function getVendorAvailability(
  certType: string,
  workerId?: string,
): Promise<CertTypeAvailabilityResponse> {
  const query = workerId ? `?workerId=${encodeURIComponent(workerId)}` : "";
  return apiFetchJson<CertTypeAvailabilityResponse>(
    `${BASE}/vendors/${encodeURIComponent(certType)}/availability${query}`,
  );
}

export function bookRenewal(dto: BookRenewalDto): Promise<BookingSummary> {
  return apiFetchJson<BookingSummary>(`${BASE}/renewals/book`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function confirmVendorBooking(
  dto: ConfirmVendorBookingDto,
): Promise<{ ok: boolean }> {
  return apiFetchJson<{ ok: boolean }>(`${BASE}/vendors/confirm-booking`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function formatDeliveryMode(mode: VendorDeliveryMode): string {
  if (mode === "online") return "Online";
  if (mode === "blended") return "Blended";
  return "In person";
}
