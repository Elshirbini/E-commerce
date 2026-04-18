import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  addToCart,
  clearCart,
  deleteProductInCart,
  getCart,
  syncCartAfterLogin,
  updateCart,
} from "./cart.controller";
import { addToCartValidation } from "./cart.validator";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();

router.use(verifyToken);

router.post("/add/:productId", addToCartValidation, validateInputs, addToCart);

router.post("/sync", syncCartAfterLogin);

router.get("/", getCart);

router
  .route("/:cartId/product/:productId")
  .patch(addToCartValidation, validateInputs, updateCart)
  .delete(deleteProductInCart);

router.delete("/clear/:cartId", clearCart);

export const cartRoutes = router;
