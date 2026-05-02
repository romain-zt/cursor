import { createApp } from './app.js';
import { initializeDatabase } from '../db/schema.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const DB_PATH = process.env.DB_PATH ?? ':memory:';

const db = initializeDatabase(DB_PATH);
const app = createApp(db);

app.listen(PORT, () => {
  process.stdout.write(`ZedCheckout API listening on port ${PORT}\n`);
});
