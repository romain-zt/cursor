import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type Database from 'better-sqlite3';
import {
  ServiceRepository,
  TimeSlotRepository,
  BookingRepository,
  MerchantConfigRepository,
} from '../db/repositories.js';
import { isValidEmail, isValidDateString } from './validation.js';

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ZC-${code}`;
}

export function createRouter(db: Database.Database): Router {
  const router = Router();
  const services = new ServiceRepository(db);
  const slots = new TimeSlotRepository(db);
  const bookings = new BookingRepository(db);
  const merchants = new MerchantConfigRepository(db);

  router.get('/api/v1/merchants/:merchantId/services', (req: Request, res: Response) => {
    const merchantId = req.params.merchantId as string;
    const merchant = merchants.findById(merchantId);
    if (!merchant) {
      res.status(404).json({ error: 'merchant_not_found' });
      return;
    }
    const result = services.findActiveByMerchant(merchantId);
    res.json({ services: result });
  });

  router.get('/api/v1/services/:serviceId/slots', (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    const date = req.query.date as string | undefined;
    if (!date || !isValidDateString(date)) {
      res.status(400).json({ error: 'invalid_date', message: 'Provide date as YYYY-MM-DD' });
      return;
    }

    const now = new Date().toISOString();
    const result = slots.findAvailableByServiceAndDate(serviceId, date, now);

    const service = db
      .prepare('SELECT merchant_id FROM services WHERE id = ?')
      .get(serviceId) as { merchant_id: string } | undefined;
    let timezone = 'UTC';
    if (service) {
      const merchant = merchants.findById(service.merchant_id);
      if (merchant) {
        timezone = merchant.timezone;
      }
    }

    res.json({ slots: result, timezone });
  });

  router.post('/api/v1/bookings', (req: Request, res: Response) => {
    const { slot_id, customer_name, customer_email } = req.body ?? {};

    if (!slot_id || !customer_name || !customer_email) {
      res.status(400).json({ error: 'missing_fields', message: 'slot_id, customer_name, customer_email required' });
      return;
    }

    if (!isValidEmail(customer_email)) {
      res.status(422).json({ error: 'invalid_email', message: 'Invalid email format' });
      return;
    }

    const now = new Date().toISOString();
    const booked = slots.bookSlot(slot_id, now);

    if (!booked) {
      res.status(409).json({ error: 'slot_unavailable' });
      return;
    }

    const booking = bookings.create({
      id: uuidv4(),
      reference_code: generateReferenceCode(),
      slot_id,
      customer_name,
      customer_email,
      status: 'confirmed',
      created_at: now,
    });

    res.status(201).json({ booking });
  });

  return router;
}
