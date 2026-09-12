import { Router } from 'express';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/me', async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ account });
  } catch (e) { next(e); }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const transactions = await Transaction.find({ accountId: account._id }).sort({ createdAt: -1 }).limit(limit);
    res.json({ transactions });
  } catch (e) { next(e); }
});

export default router;
