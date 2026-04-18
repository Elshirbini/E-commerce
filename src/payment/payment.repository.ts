import { Types } from "mongoose";
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from "./schemas/payment.schema";

export const createPayment = async (data: Partial<PaymentDocument>) => {
  return Payment.create(data);
};

export const findLatestPaymentByOrderId = async (orderId: string) => {
  return Payment.findOne({ orderId: new Types.ObjectId(orderId) }).sort({
    createdAt: -1,
  });
};

export const findPaymentById = async (id: string) => {
  return Payment.findById(id);
};

export const findPaymentByStripePaymentIntentId = async (
  paymentIntentId: string,
) => {
  return Payment.findOne({ stripePaymentIntentId: paymentIntentId });
};

export const findPaymentByStripeCheckoutSessionId = async (
  checkoutSessionId: string,
) => {
  return Payment.findOne({ stripeCheckoutSessionId: checkoutSessionId });
};

export const updatePaymentStatus = async (
  id: string,
  status: PaymentStatus,
  patch: Partial<PaymentDocument> = {},
) => {
  return Payment.findByIdAndUpdate(
    id,
    { status, ...patch },
    { new: true, runValidators: true },
  );
};
