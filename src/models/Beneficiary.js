import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  isTrusted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Beneficiary', beneficiarySchema);
