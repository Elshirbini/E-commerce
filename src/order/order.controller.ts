import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import {
  findOrderById,
  findOrderByIdAndUpdate,
  getOrders,
} from "./order.repository";
import { findLatestPaymentByOrderId } from "../payment/payment.repository";
import { processOrderConfirmation } from "./order.service";

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  let orderData = req.body;

  if (orderData.isDelivered) {
    orderData.deliveredAt = new Date(Date.now()).toLocaleString("en-KW");
  } else {
    orderData.deliveredAt = null;
  }
  if (orderData.isPaid) {
    orderData.paidAt = new Date(Date.now()).toLocaleString("en-KW");
  } else {
    orderData.paidAt = null;
  }

  const order = await findOrderByIdAndUpdate(id, orderData);
  if (!order) throw new ApiError(req.__("Order not found"), 404);

  return success(res, 200, "Order updated successfully");
};

export const confirmCashOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  let orderData = req.body;

  const order = await findOrderByIdAndUpdate(id, orderData);
  if (!order) throw new ApiError(req.__("Order not found"), 404);

  const payment = await findLatestPaymentByOrderId(order._id.toString());
  if (!payment) throw new ApiError(req.__("Payment not found"), 404);

  if (payment.method === "stripe" && order.paymentMethod === "stripe") {
    throw new ApiError("Cannot confirm card order", 403);
  }

  if (orderData.isConfirmed) {
    await processOrderConfirmation(order, payment?.status || "pending", "cash");
  }

  return success(res, 200, "Order updated successfully");
};

export const getAllOrders = async (req: Request, res: Response) => {
  const { orders, totalCount, page } = await getOrders(req.query);
  return success(res, 200, null, orders, { page, totalCount });
};

export const getOrderDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await findOrderById(id);
  if (!order) throw new ApiError(req.__("Order not found"), 404);

  return success(res, 200, null, order);
};
