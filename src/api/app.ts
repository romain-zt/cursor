import express from 'express';
import type Database from 'better-sqlite3';
import { createRouter } from './routes.js';

export function createApp(db: Database.Database): express.Application {
  const app = express();
  app.use(express.json());
  app.use(createRouter(db));
  return app;
}
