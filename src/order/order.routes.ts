import express from "express";
import {
  confirmCashOrder,
  getAllOrders,
  getOrderDetails,
  updateOrder,
} from "./order.controller";
import {
  confirmOrderValidation,
  updateOrderValidation,
} from "./order.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();

router
  .route("/cash/confirm/:id")
  .patch(confirmOrderValidation, validateInputs, confirmCashOrder);

router.use(verifyToken, isAdmin);

router
  .route("/:id")
  .get(getOrderDetails)
  .patch(updateOrderValidation, validateInputs, updateOrder);

router.get("/", getAllOrders);

export const orderRoutes = router;
