import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addToCart, getUserCart } from "../controllers/cart.js";

const router = express.Router();

router.post("/add-to-cart", verifyToken, addToCart);

router.get("/getUserCart", verifyToken, getUserCart);

export const cartRoutes = router;
