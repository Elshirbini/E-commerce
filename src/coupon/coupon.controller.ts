import { ApiError } from "../utils/apiError";
import { Request, Response } from "express";
import { success } from "../utils/response";
import {
  addCoupon,
  findCouponByIdAndDelete,
  findCouponByIdAndUpdate,
  getCoupons,
} from "./coupon.repository";

export const getAllCoupons = async (req: Request, res: Response) => {
  const { coupons, totalCount, page } = await getCoupons(req.query);

  return success(res, 200, null, coupons, { page, totalCount });
};

export const createCoupon = async (req: Request, res: Response) => {
  const { code, discount, expires } = req.body;

  const date = Date.now();

  if (new Date(expires).getTime() <= date) {
    throw new ApiError("expire date should be valid", 400);
  }

  await addCoupon({
    code,
    discount,
    expires,
  });

  return success(res, 201, "Coupon created successfully");
};

export const updateCoupon = async (req: Request, res: Response) => {
  const { couponId } = req.params;
  const { code, discount, expires } = req.body;

  const date = Date.now();

  if (new Date(expires).getTime() <= date) {
    throw new ApiError("expire date should be valid", 400);
  }

  const coupon = await findCouponByIdAndUpdate(couponId, {
    code,
    discount,
    expires,
  });

  if (!coupon) throw new ApiError("coupon not found", 404);

  return success(res, 200, "Coupon updated successfully");
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const { couponId } = req.params;

  const coupon = await findCouponByIdAndDelete(couponId);

  if (!coupon) throw new ApiError("coupon not found", 404);

  return success(res, 200, "coupon deleted successfully");
};
