import { Router } from 'express';
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Beneficiary from '../models/Beneficiary.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { recipientAccount, recipientName, amount, description, idempotencyKey } = req.body;
    const value = Number(amount);
    if (!recipientAccount || !recipientName || !Number.isFinite(value) || value <= 0) return res.status(400).json({ message: 'Valid recipient and amount are required' });
    if (!idempotencyKey) return res.status(400).json({ message: 'Idempotency key is required' });
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) return res.json({ transaction: existing, replayed: true });

    let created;
    await session.withTransaction(async () => {
      const sender = await Account.findOne({ userId: req.user._id }).session(session);
      if (!sender || sender.status !== 'active') throw Object.assign(new Error('Account unavailable'), { status: 403 });
      if (sender.availableBalance < value) throw Object.assign(new Error('Insufficient funds'), { status: 400 });
      if (sender.accountNumber === recipientAccount) throw Object.assign(new Error('Cannot transfer to the same account'), { status: 400 });
      sender.availableBalance -= value;
      sender.ledgerBalance -= value;
      await sender.save({ session });
      const reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      [created] = await Transaction.create([{ reference, accountId: sender._id, type: 'transfer', direction: 'debit', amount: value, status: 'processing', counterpartyName: recipientName, counterpartyAccount: recipientAccount, description, idempotencyKey }], { session });
    });
    await Transaction.findByIdAndUpdate(created._id, { status: 'successful' });
    res.status(201).json({ transaction: await Transaction.findById(created._id) });
  } catch (e) { res.status(e.status || 500).json({ message: e.message || 'Transfer failed' }); }
  finally { await session.endSession(); }
});

router.get('/beneficiaries', async (req, res, next) => {
  try { res.json({ beneficiaries: await Beneficiary.find({ userId: req.user._id }).sort({ name: 1 }) }); }
  catch (e) { next(e); }
});

router.post('/beneficiaries', async (req, res, next) => {
  try {
    const { name, bankName, accountNumber } = req.body;
    const beneficiary = await Beneficiary.create({ userId: req.user._id, name, bankName, accountNumber });
    res.status(201).json({ beneficiary });
  } catch (e) { next(e); }
});

export default router;
