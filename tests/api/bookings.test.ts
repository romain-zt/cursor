import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api/app.js';
import { initializeDatabase } from '../../src/db/schema.js';
import { seedMerchant, seedService, seedSlot } from './helpers.js';
import type Database from 'better-sqlite3';

let db: Database.Database;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = initializeDatabase(':memory:');
  app = createApp(db);
});

describe('POST /api/v1/bookings', () => {
  it('creates a booking and returns 201 with booking details', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id);

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Jane Doe', customer_email: 'jane@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.customer_name).toBe('Jane Doe');
    expect(res.body.booking.customer_email).toBe('jane@example.com');
    expect(res.body.booking.status).toBe('confirmed');
    expect(res.body.booking.reference_code).toMatch(/^ZC-[A-Z0-9]{4}$/);
  });

  it('transitions slot status to booked after successful booking', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id);

    await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Jane', customer_email: 'jane@example.com' });

    const updatedSlot = db.prepare('SELECT status FROM time_slots WHERE id = ?').get(slot.id) as { status: string };
    expect(updatedSlot.status).toBe('booked');
  });

  it('returns 409 when slot is already booked (concurrent booking race)', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id, { status: 'booked' });

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Late User', customer_email: 'late@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('slot_unavailable');
  });

  it('returns 409 when slot is actively held by another customer', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const futureDate = new Date(Date.now() + 600_000).toISOString();
    const slot = seedSlot(db, service.id, { status: 'held', held_until: futureDate });

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Intruder', customer_email: 'intruder@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('slot_unavailable');
  });

  it('allows booking a slot whose hold has expired', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id, { status: 'held', held_until: '2020-01-01T00:00:00Z' });

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Swooper', customer_email: 'swoop@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe('confirmed');
  });

  it('returns 422 for invalid email format', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id);

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Bad Email', customer_email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('invalid_email');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: 'some-id' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missing_fields');
  });

  it('prevents double-booking: second request for same slot gets 409', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const slot = seedSlot(db, service.id);

    const first = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'First', customer_email: 'first@example.com' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: slot.id, customer_name: 'Second', customer_email: 'second@example.com' });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('slot_unavailable');
  });

  it('returns 409 for non-existent slot_id', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ slot_id: 'does-not-exist', customer_name: 'Ghost', customer_email: 'ghost@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('slot_unavailable');
  });
});
