import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export function seedMerchant(db: Database.Database, overrides: Partial<{
  id: string;
  name: string;
  timezone: string;
  branding: string | null;
}> = {}) {
  const id = overrides.id ?? uuidv4();
  const name = overrides.name ?? 'Test Merchant';
  const timezone = overrides.timezone ?? 'America/New_York';
  const branding = overrides.branding ?? null;
  db.prepare('INSERT INTO merchant_configs (id, name, timezone, branding) VALUES (?, ?, ?, ?)').run(id, name, timezone, branding);
  return { id, name, timezone, branding };
}

export function seedService(db: Database.Database, merchantId: string, overrides: Partial<{
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
  active: number;
}> = {}) {
  const id = overrides.id ?? uuidv4();
  const name = overrides.name ?? '60-min Training';
  const duration = overrides.duration_minutes ?? 60;
  const price = overrides.price_cents ?? null;
  const active = overrides.active ?? 1;
  db.prepare('INSERT INTO services (id, merchant_id, name, duration_minutes, price_cents, active) VALUES (?, ?, ?, ?, ?, ?)').run(id, merchantId, name, duration, price, active);
  return { id, merchant_id: merchantId, name, duration_minutes: duration, price_cents: price, active };
}

export function seedSlot(db: Database.Database, serviceId: string, overrides: Partial<{
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  held_until: string | null;
}> = {}) {
  const id = overrides.id ?? uuidv4();
  const starts_at = overrides.starts_at ?? '2026-06-01T10:00:00Z';
  const ends_at = overrides.ends_at ?? '2026-06-01T11:00:00Z';
  const status = overrides.status ?? 'available';
  const held_until = overrides.held_until ?? null;
  db.prepare('INSERT INTO time_slots (id, service_id, starts_at, ends_at, status, held_until) VALUES (?, ?, ?, ?, ?, ?)').run(id, serviceId, starts_at, ends_at, status, held_until);
  return { id, service_id: serviceId, starts_at, ends_at, status, held_until };
}
