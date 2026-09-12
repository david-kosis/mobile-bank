import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['transfer', 'deposit', 'withdrawal', 'bill', 'airtime', 'card_payment', 'refund'], required: true },
  direction: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  fee: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'NGN' },
  status: { type: String, enum: ['pending', 'processing', 'successful', 'failed', 'reversed', 'disputed'], default: 'pending' },
  counterpartyName: String,
  counterpartyAccount: String,
  description: String,
  idempotencyKey: { type: String, unique: true, sparse: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

transactionSchema.index({ accountId: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });

export default mongoose.model('Transaction', transactionSchema);
