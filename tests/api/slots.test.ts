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

describe('GET /api/v1/services/:serviceId/slots', () => {
  it('returns available slots for a service on a given date', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    seedSlot(db, service.id, { starts_at: '2026-06-01T09:00:00Z', ends_at: '2026-06-01T10:00:00Z' });
    seedSlot(db, service.id, { starts_at: '2026-06-01T11:00:00Z', ends_at: '2026-06-01T12:00:00Z' });

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(2);
    expect(res.body.timezone).toBe('America/New_York');
  });

  it('excludes booked slots', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    seedSlot(db, service.id, { starts_at: '2026-06-01T09:00:00Z', ends_at: '2026-06-01T10:00:00Z', status: 'booked' });
    seedSlot(db, service.id, { starts_at: '2026-06-01T11:00:00Z', ends_at: '2026-06-01T12:00:00Z', status: 'available' });

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.body.slots).toHaveLength(1);
    expect(res.body.slots[0].starts_at).toBe('2026-06-01T11:00:00Z');
  });

  it('excludes actively held slots (held_until in future)', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    const futureDate = new Date(Date.now() + 600_000).toISOString();
    seedSlot(db, service.id, {
      starts_at: '2026-06-01T09:00:00Z',
      ends_at: '2026-06-01T10:00:00Z',
      status: 'held',
      held_until: futureDate,
    });

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.body.slots).toHaveLength(0);
  });

  it('includes held slots with expired held_until', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    seedSlot(db, service.id, {
      starts_at: '2026-06-01T09:00:00Z',
      ends_at: '2026-06-01T10:00:00Z',
      status: 'held',
      held_until: '2020-01-01T00:00:00Z',
    });

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.body.slots).toHaveLength(1);
  });

  it('returns empty array when no slots available on date', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);
    seedSlot(db, service.id, { starts_at: '2026-06-02T09:00:00Z', ends_at: '2026-06-02T10:00:00Z' });

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.body.slots).toEqual([]);
  });

  it('returns 400 for missing date parameter', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);

    const res = await request(app).get(`/api/v1/services/${service.id}/slots`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_date');
  });

  it('returns 400 for invalid date format', async () => {
    const merchant = seedMerchant(db);
    const service = seedService(db, merchant.id);

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=not-a-date`);
    expect(res.status).toBe(400);
  });

  it('defaults to UTC when merchant has no timezone set', async () => {
    const merchant = seedMerchant(db, { timezone: 'UTC' });
    const service = seedService(db, merchant.id);
    seedSlot(db, service.id);

    const res = await request(app).get(`/api/v1/services/${service.id}/slots?date=2026-06-01`);
    expect(res.body.timezone).toBe('UTC');
  });
});
