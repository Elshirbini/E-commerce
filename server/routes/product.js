import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createProduct, searchingProducts } from "../controllers/product.js";

const router = express.Router();

router.get("/search-product", verifyToken, searchingProducts);
router.post("/create-product", verifyToken, createProduct);

export const productRoutes = router;
