import express from "express";
import { validateInputs } from "../middlewares/validateInputs";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import {
  checkoutCash,
  checkoutStripe,
  markCashPaid,
  stripeWebhook,
} from "./payment.controller";
import {
  checkoutCashValidation,
  checkoutStripeValidation,
  markCashPaidValidation,
} from "./payment.validator";

const router = express.Router();

router.post("/stripe/webhook", stripeWebhook);

router.post(
  "/cash/checkout",
  checkoutCashValidation,
  validateInputs,
  checkoutCash,
);
router.post(
  "/stripe/checkout",
  checkoutStripeValidation,
  validateInputs,
  checkoutStripe,
);

router.use(verifyToken, isAdmin);
router.patch("/:id/cash", markCashPaidValidation, validateInputs, markCashPaid);

export const paymentRoutes = router;
