import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createProduct,
  searchingProducts,
  updateProduct,
} from "../controllers/product.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/search-product", verifyToken, searchingProducts);
router.post("/create-product", verifyToken, isAdmin, createProduct);
router.put("/update-product/:productId", verifyToken, isAdmin, updateProduct);

export const productRoutes = router;
