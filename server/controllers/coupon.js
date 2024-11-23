import { Coupon } from "../models/coupon.js";
import { ApiError } from "../utils/apiError.js";
import couponCode from "coupon-code";

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();

    if (!coupons) return next(new ApiError("coupons not found", 404));

    res.status(200).json({ coupons });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { discount, expires } = req.body;

    const date = Date.now();

    if (discount > 100 || new Date(expires).getTime() <= date) {
      return next(
        new ApiError("discount and expire date should be valid", 400)
      );
    }
    const code = couponCode.generate({ parts: 2, partLen: 4 });

    const coupon = await Coupon.create({
      code,
      discount,
      expires,
    });

    res.status(200).json({ coupon });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const { discount, expires } = req.body;

    const date = Date.now();

    if (discount > 100 || new Date(expires).getTime() <= date) {
      return next(
        new ApiError("discount and expire date should be valid", 400)
      );
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

    if (!coupon) return next(new ApiError("coupon not found", 404));

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) return next(new ApiError("coupon not found", 404));

    res.status(200).json({ message: "coupon deleted successfully" });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
