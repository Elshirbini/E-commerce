import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import { addAdminValidation, updateRoleValidation } from "./admin.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { addAdmin, getAllUsers, updateUserRole } from "./admin.controller";

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  isAdmin,
  addAdminValidation,
  validateInputs,
  addAdmin,
);

router.get("/users", verifyToken, isAdmin, getAllUsers);

router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  updateRoleValidation,
  validateInputs,
  updateUserRole,
);

export const adminRoutes = router;
