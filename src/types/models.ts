export interface Service {
  id: string;
  merchant_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
  active: boolean;
}

export type SlotStatus = 'available' | 'held' | 'booked';

export interface TimeSlot {
  id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: SlotStatus;
  held_until: string | null;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  reference_code: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  status: BookingStatus;
  created_at: string;
}

export interface MerchantConfig {
  id: string;
  name: string;
  timezone: string;
  branding: {
    primary_color?: string;
    logo_url?: string;
  } | null;
}
