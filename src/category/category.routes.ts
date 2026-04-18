import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import {
  addCategoryValidation,
  editCategoryValidation,
} from "./category.validator";
import { validateInputs } from "../middlewares/validateInputs";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
  getSpecialCategories,
} from "./category.controller";
import { upload } from "../config/multerMemory";
import { validateFiles } from "../middlewares/validateFiles";

const router = express.Router();

router.get("/", getCategories);
router.get("/special", getSpecialCategories);

router.use(verifyToken, isAdmin);

router
  .route("/")
  .post(
    upload.single("image"),
    validateFiles,
    addCategoryValidation,
    validateInputs,
    addCategory,
  );

router
  .route("/:id")
  .patch(
    upload.single("image"),
    validateFiles,
    editCategoryValidation,
    validateInputs,
    editCategory,
  )
  .delete(deleteCategory);

export const categoryRoutes = router;
