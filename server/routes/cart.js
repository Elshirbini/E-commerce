import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addToCart, getUserCart, removeFromCart } from "../controllers/cart.js";

const router = express.Router();

router.get("/getUserCart", verifyToken, getUserCart);

router.post("/add-to-cart", verifyToken, addToCart);

router.delete(
  "/remove-from-cart/:cartId/:productId",
  verifyToken,
  removeFromCart
);

export const cartRoutes = router;
