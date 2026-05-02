import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/api/app.js';
import { initializeDatabase } from '../../src/db/schema.js';
import { seedMerchant, seedService } from './helpers.js';
import type Database from 'better-sqlite3';

let db: Database.Database;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = initializeDatabase(':memory:');
  app = createApp(db);
});

describe('GET /api/v1/merchants/:merchantId/services', () => {
  it('returns active services for a merchant', async () => {
    const merchant = seedMerchant(db);
    seedService(db, merchant.id, { name: 'Yoga Class' });
    seedService(db, merchant.id, { name: 'Pilates' });

    const res = await request(app).get(`/api/v1/merchants/${merchant.id}/services`);
    expect(res.status).toBe(200);
    expect(res.body.services).toHaveLength(2);
    expect(res.body.services.map((s: { name: string }) => s.name).sort()).toEqual(['Pilates', 'Yoga Class']);
  });

  it('returns empty array when merchant has no services', async () => {
    const merchant = seedMerchant(db);

    const res = await request(app).get(`/api/v1/merchants/${merchant.id}/services`);
    expect(res.status).toBe(200);
    expect(res.body.services).toEqual([]);
  });

  it('excludes inactive services', async () => {
    const merchant = seedMerchant(db);
    seedService(db, merchant.id, { name: 'Active', active: 1 });
    seedService(db, merchant.id, { name: 'Inactive', active: 0 });

    const res = await request(app).get(`/api/v1/merchants/${merchant.id}/services`);
    expect(res.body.services).toHaveLength(1);
    expect(res.body.services[0].name).toBe('Active');
  });

  it('returns 404 for non-existent merchant', async () => {
    const res = await request(app).get('/api/v1/merchants/nonexistent-id/services');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('merchant_not_found');
  });
});
