import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/category.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/get-all-categories", verifyToken, getAllCategories);

router.post(
  "/create-category",
  verifyToken,
  isAdmin,
  upload.single("image"),
  createCategory
);

router.delete(
  "/delete-category/:categoryId",
  verifyToken,
  isAdmin,
  deleteCategory
);

export const categoryRoutes = router;
