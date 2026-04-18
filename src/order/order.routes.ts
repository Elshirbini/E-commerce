import express from "express";
import {
  confirmOrder,
  createCashOrder,
  getAllOrders,
  getOrderDetails,
  updateOrder,
} from "./order.controller";
import {
  confirmOrderValidation,
  createCashOrderValidation,
  updateOrderValidation,
} from "./order.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();

router.post(
  "/cash",
  createCashOrderValidation,
  validateInputs,
  createCashOrder,
);

router
  .route("/confirm/:id")
  .patch(confirmOrderValidation, validateInputs, confirmOrder);

router.use(verifyToken, isAdmin);

router
  .route("/:id")
  .get(getOrderDetails)
  .patch(updateOrderValidation, validateInputs, updateOrder);

router.get("/", getAllOrders);

export const orderRoutes = router;
