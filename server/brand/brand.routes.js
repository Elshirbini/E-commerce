import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { upload } from "../config/multer.js";
import {
  createBrand,
  deleteBrand,
  getAllBrands,
} from "../brand/brand.controller.js";
const router = express.Router();

router.get("/get-all-brands", verifyToken, getAllBrands);
router.post(
  "/create-brand",
  verifyToken,
  isAdmin,
  upload.single("image"),
  createBrand
);
router.delete("/delete-brand/:brandId", verifyToken, isAdmin, deleteBrand);

export const brandRoutes = router;
