import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true, index: true },
    currency: { type: String, default: "NGN" },
    availableBalance: { type: Number, default: 0, min: 0 },
    ledgerBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "frozen", "closed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
