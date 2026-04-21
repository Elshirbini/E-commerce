import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

export type PaymentMethod = "cash" | "stripe";
export type PaymentStatus =
  | "pending"
  | "requires_action"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "orders",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
      index: true,
    },
    method: {
      type: String,
      enum: ["cash", "stripe"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "requires_action",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      required: true,
      lowercase: true,
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: false,
      index: true,
      sparse: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      required: false,
      index: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    paidAt: {
      type: Date,
      required: false,
    },
    failureReason: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

paymentSchema.index({ orderId: 1, createdAt: -1 });

type Payment = InferSchemaType<typeof paymentSchema>;
export type PaymentDocument = HydratedDocument<Payment>;

export const Payment = model<PaymentDocument>("payments", paymentSchema);
