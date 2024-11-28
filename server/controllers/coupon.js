import asyncHandler from "express-async-handler";
import { Coupon } from "../models/coupon.js";
import { ApiError } from "../utils/apiError.js";
import couponCode from "coupon-code";

export const getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find();

  if (!coupons) throw new ApiError("coupons not found", 404);

  res.status(200).json({ coupons });
});

export const createCoupon = asyncHandler(async (req, res, next) => {
  const { discount, expires } = req.body;

  const date = Date.now();

  if (discount > 100 || new Date(expires).getTime() <= date) {
    throw new ApiError("discount and expire date should be valid", 400);
  }
  const code = couponCode.generate({ parts: 2, partLen: 4 });

  const coupon = await Coupon.create({
    code,
    discount,
    expires,
  });

  res.status(200).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;
  const { discount, expires } = req.body;

  const date = Date.now();

  if (discount > 100 || new Date(expires).getTime() <= date) {
    throw new ApiError("discount and expire date should be valid", 400);
  }

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    {
      discount,
      expires,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!coupon) throw new ApiError("coupon not found", 404);

  res.status(200).json({
    message: "Coupon updated successfully",
    coupon,
  });
});

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);

  if (!coupon) throw new ApiError("coupon not found", 404);

  res.status(200).json({ message: "coupon deleted successfully" });
});
