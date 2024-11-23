import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "../controllers/coupon.js";

const router = express.Router();

router.get("/get-all-coupons", verifyToken, isAdmin, getAllCoupons);
router.post("/create-coupon", verifyToken, isAdmin, createCoupon);
router.patch("/update-coupon/:couponId", verifyToken, isAdmin, updateCoupon);
router.delete("/delete-coupon/:couponId", verifyToken, isAdmin, deleteCoupon);

export const couponRoutes = router;
