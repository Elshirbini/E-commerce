import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { updateUser } from "./user.controller";
import { updateUserValidation } from "./user.validator";
import { validateInputs } from "../middlewares/validateInputs";

const router = express.Router();

router.patch(
  "/:id",
  verifyToken,
  updateUserValidation,
  validateInputs,
  updateUser,
);

export const userRoutes = router;
