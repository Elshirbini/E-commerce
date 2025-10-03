import { model, Schema } from "mongoose";

const coupon = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      min: [1, "Discount must be at least 1"],
      max: [100, "Discount cannot exceed 100"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Coupon = model("coupons", coupon);
