import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createCashOrder } from "../controllers/order.js";
const router = express.Router();

router.post("/create-cash-order", verifyToken, createCashOrder);

export const orderRoutes = router;
