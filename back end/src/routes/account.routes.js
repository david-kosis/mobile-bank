import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(auth);

router.get("/me", async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    res.json({
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        currency: account.currency,
        availableBalance: account.availableBalance,
        ledgerBalance: account.ledgerBalance,
        pendingBalance: account.pendingBalance,
        status: account.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const transactions = await Transaction.find({ accountId: account._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

export default router;
