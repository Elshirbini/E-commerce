import express from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import { settingsValidation } from "./settings.validator";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();

router
  .route("/")
  .get(getSettings)
  .put(
    verifyToken,
    isAdmin,
    settingsValidation,
    validateInputs,
    updateSettings,
  );

export const settingsRoutes = router;
