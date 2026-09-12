import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    isTrusted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

beneficiarySchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export default mongoose.model("Beneficiary", beneficiarySchema);
