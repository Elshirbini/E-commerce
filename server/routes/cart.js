import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addToCart, getUserCart, removeFromCart, updateQuantity } from "../controllers/cart.js";

const router = express.Router();

router.get("/getUserCart", verifyToken, getUserCart);

router.post("/add-to-cart", verifyToken, addToCart);

router.delete(
  "/remove-from-cart/:cartId/:productId",
  verifyToken,
  removeFromCart
);

router.patch("/update-qty/:cartId/:productId", verifyToken , updateQuantity);

export const cartRoutes = router;
