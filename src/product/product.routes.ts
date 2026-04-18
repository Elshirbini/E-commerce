import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import { addProductValidator, updateImageValidator } from "./product.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { upload } from "../config/multerMemory";
import { validateFiles } from "../middlewares/validateFiles";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductDetails,
  getProductsSales,
  updateImage,
  updateProduct,
} from "./product.controller";

const router = express.Router();

router.get("/sales", getProductsSales);

router
  .route("/:categoryId")
  .get(getAllProducts)
  .post(
    verifyToken,
    isAdmin,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    validateFiles,
    addProductValidator,
    validateInputs,
    addProduct,
  );

router.get("/details/:productId", getProductDetails);

router.patch(
  "/update-product/:productId",
  verifyToken,
  isAdmin,
  addProductValidator,
  validateInputs,
  updateProduct,
);

router.patch(
  "/update-image/:productId",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateFiles,
  updateImageValidator,
  validateInputs,
  updateImage,
);

router.delete("/:productId", verifyToken, isAdmin, deleteProduct);

export const productRoutes = router;
