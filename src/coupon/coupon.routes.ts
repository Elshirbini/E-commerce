import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "../coupon/coupon.controller";
import { createCouponValidation } from "./coupon.validator";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();

router.get("/get-all-coupons", verifyToken, isAdmin, getAllCoupons);
router.post(
  "/create-coupon",
  verifyToken,
  isAdmin,
  createCouponValidation,
  validateInputs,
  createCoupon,
);
router.patch(
  "/update-coupon/:couponId",
  verifyToken,
  isAdmin,
  createCouponValidation,
  validateInputs,
  updateCoupon,
);
router.delete("/delete-coupon/:couponId", verifyToken, isAdmin, deleteCoupon);

export const couponRoutes = router;
