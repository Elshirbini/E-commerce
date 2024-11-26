import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createCashOrder, getOrder } from "../controllers/order.js";
const router = express.Router();


router.get("/get-order", verifyToken, getOrder);
router.post("/create-cash-order", verifyToken, createCashOrder);

export const orderRoutes = router;
