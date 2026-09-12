import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "../middleware/auth.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Beneficiary from "../models/Beneficiary.js";

const router = Router();
router.use(auth);

const transferSchema = z.object({
  recipientAccount: z.string().min(6).max(30),
  recipientName: z.string().min(2).max(100),
  amount: z.number().positive(),
  description: z.string().max(200).optional(),
  idempotencyKey: z.string().min(8).max(100),
});

const beneficiarySchema = z.object({
  name: z.string().min(2).max(100),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().min(6).max(30),
  isTrusted: z.boolean().optional(),
});

function reference() {
  return `TRX-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

router.post("/", async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const data = transferSchema.parse(req.body);
    const existing = await Transaction.findOne({ idempotencyKey: data.idempotencyKey });

    if (existing) {
      return res.status(200).json({
        message: "Transfer already processed",
        transaction: existing,
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      const sender = await Account.findOne({ userId: req.user._id }).session(session);
      if (!sender) throw Object.assign(new Error("Account not found"), { status: 404 });
      if (sender.status !== "active") throw Object.assign(new Error("Account is not active"), { status: 403 });
      if (sender.accountNumber === data.recipientAccount) {
        throw Object.assign(new Error("You cannot transfer money to your own account"), { status: 400 });
      }
      if (sender.availableBalance < data.amount) {
        throw Object.assign(new Error("Insufficient available balance"), { status: 400 });
      }

      sender.availableBalance -= data.amount;
      sender.ledgerBalance -= data.amount;
      await sender.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            reference: reference(),
            accountId: sender._id,
            type: "transfer",
            direction: "debit",
            amount: data.amount,
            fee: 0,
            currency: sender.currency,
            status: "successful",
            counterpartyName: data.recipientName,
            counterpartyAccount: data.recipientAccount,
            description: data.description || "Bank transfer",
            idempotencyKey: data.idempotencyKey,
            metadata: { initiatedBy: req.user._id.toString() },
          },
        ],
        { session }
      );

      createdTransaction = transaction;
    });

    res.status(201).json({
      message: "Transfer successful",
      transaction: createdTransaction,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Invalid transfer details", errors: error.issues });
    }
    next(error);
  } finally {
    await session.endSession();
  }
});

router.get("/beneficiaries", async (req, res, next) => {
  try {
    const beneficiaries = await Beneficiary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ beneficiaries });
  } catch (error) {
    next(error);
  }
});

router.post("/beneficiaries", async (req, res, next) => {
  try {
    const data = beneficiarySchema.parse(req.body);
    const beneficiary = await Beneficiary.create({
      ...data,
      userId: req.user._id,
    });

    res.status(201).json({ message: "Beneficiary saved", beneficiary });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Invalid beneficiary details", errors: error.issues });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "This beneficiary already exists" });
    }
    next(error);
  }
});

export default router;
