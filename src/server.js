import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transferRoutes from './routes/transfer.routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',').map(v => v.trim()) || '*', credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'mobile-bank-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transfers', transferRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

connectDB().then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`))).catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
