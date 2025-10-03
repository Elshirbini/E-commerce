import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  checkoutSession,
  createCashOrder,
  getAllOrders,
  getOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
} from "../order/order.controller.js";
const router = express.Router();

router.get("/get-order", verifyToken, getOrder);
router.get("/get-all-orders", verifyToken, isAdmin, getAllOrders);
router.post("/create-cash-order", verifyToken, createCashOrder);
router.patch(
  "/update-order-to-paid/:orderId",
  verifyToken,
  isAdmin,
  updateOrderToPaid
);
router.patch(
  "/update-order-to-delivered/:orderId",
  verifyToken,
  isAdmin,
  updateOrderToDelivered
);

router.post("/checkout-session", verifyToken, checkoutSession);

export const orderRoutes = router;
