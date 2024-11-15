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
      required: true,
    },
  },
  { timestamps: true }
);

export const Coupon = model("coupons", coupon);
