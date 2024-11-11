import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  addImages,
  createProduct,
  deleteImages,
  searchingProducts,
  updateProduct,
} from "../controllers/product.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/search-product", verifyToken, searchingProducts);
router.post("/create-product", verifyToken, isAdmin, createProduct);
router.put("/update-product/:productId", verifyToken, isAdmin, updateProduct);
router.post(
  "/add-images/:productId",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addImages
);
router.delete("/delete-images/:productId", verifyToken, isAdmin, deleteImages);

export const productRoutes = router;
