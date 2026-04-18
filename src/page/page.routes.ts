import express from "express";
import {
  addPage,
  addSection,
  deletePage,
  deleteSection,
  editSection,
  getPage,
  getPages,
  updateImage,
} from "./page.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import {
  addPageValidation,
  addSectionValidation,
  editSectionValidation,
} from "./page.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { upload } from "../config/multerMemory";
import { validateFiles } from "../middlewares/validateFiles";

const router = express.Router();

router.get("/", getPages);
router.get("/:page", getPage);

router.use(verifyToken, isAdmin);

// Page Routes

router.post("/", addPageValidation, validateInputs, addPage);
router.delete("/:page", deletePage);

// Section Routes

router.post(
  "/:page/section",
  upload.array("images", 5),
  validateFiles,
  addSectionValidation,
  validateInputs,
  addSection,
);

router.patch(
  "/:page/section/:type",
  editSectionValidation,
  validateInputs,
  editSection,
);
router.patch(
  "/:page/section/update-image/:type",
  upload.single("image"),
  validateFiles,
  editSectionValidation,
  validateInputs,
  updateImage,
);

router.delete("/:page/section/:type", deleteSection);

export const pageRoutes = router;
