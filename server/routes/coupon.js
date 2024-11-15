import express from "express"
import { verifyToken } from "../middlewares/verifyToken.js"
import { isAdmin } from "../middlewares/isAdmin.js"
import { createCoupon } from "../controllers/coupon.js"

const router = express.Router()

router.post("/create-coupon" , verifyToken , isAdmin , createCoupon)

export const couponRoutes = router