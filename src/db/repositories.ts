import type Database from 'better-sqlite3';
import type { Service, TimeSlot, Booking, MerchantConfig } from '../types/models.js';

export class ServiceRepository {
  constructor(private db: Database.Database) {}

  findActiveByMerchant(merchantId: string): Service[] {
    return this.db
      .prepare('SELECT * FROM services WHERE merchant_id = ? AND active = 1')
      .all(merchantId) as Service[];
  }
}

export class TimeSlotRepository {
  constructor(private db: Database.Database) {}

  findAvailableByServiceAndDate(serviceId: string, date: string, now: string): TimeSlot[] {
    return this.db.prepare(`
      SELECT * FROM time_slots
      WHERE service_id = ?
        AND starts_at >= ?
        AND starts_at < ?
        AND (
          status = 'available'
          OR (status = 'held' AND held_until < ?)
        )
      ORDER BY starts_at ASC
    `).all(
      serviceId,
      `${date}T00:00:00Z`,
      `${date}T23:59:59Z`,
      now,
    ) as TimeSlot[];
  }

  /**
   * Atomically transitions a slot to 'booked'. Returns true if the
   * transition succeeded (slot was available or held-expired).
   */
  bookSlot(slotId: string, now: string): boolean {
    const result = this.db.prepare(`
      UPDATE time_slots
      SET status = 'booked'
      WHERE id = ?
        AND (
          status = 'available'
          OR (status = 'held' AND held_until < ?)
        )
    `).run(slotId, now);
    return result.changes > 0;
  }
}

export class BookingRepository {
  constructor(private db: Database.Database) {}

  create(booking: Booking): Booking {
    this.db.prepare(`
      INSERT INTO bookings (id, reference_code, slot_id, customer_name, customer_email, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      booking.id,
      booking.reference_code,
      booking.slot_id,
      booking.customer_name,
      booking.customer_email,
      booking.status,
      booking.created_at,
    );
    return booking;
  }
}

export class MerchantConfigRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): MerchantConfig | undefined {
    const row = this.db
      .prepare('SELECT * FROM merchant_configs WHERE id = ?')
      .get(id) as (Omit<MerchantConfig, 'branding'> & { branding: string | null }) | undefined;

    if (!row) return undefined;
    return {
      ...row,
      branding: row.branding ? JSON.parse(row.branding) : null,
    };
  }
}
