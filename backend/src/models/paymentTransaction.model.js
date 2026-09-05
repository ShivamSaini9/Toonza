import mongoose, { Schema } from "mongoose";

const paymentTransactionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    credits: { type: Number, required: true, min: 1 },
    plan: { type: String, required: true },
    status: { type: String, enum: ["completed"], default: "completed" },
  },
  { timestamps: true },
);

export const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);
