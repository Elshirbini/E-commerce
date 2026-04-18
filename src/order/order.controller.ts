import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { findCartByUserId, saveCart } from "../cart/cart.repository";
import { success } from "../utils/response";
import {
  findOrderById,
  findOrderByIdAndUpdate,
  getOrders,
} from "./order.repository";
import { findProductById, saveProduct } from "../product/product.repository";
import { EmailService } from "../email/email.service";
import { findLatestPaymentByOrderId } from "../payment/payment.repository";

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  let orderData = req.body;

  if (orderData.isDelivered) {
    orderData.deliveredAt = new Date(Date.now()).toLocaleString("en-KW");
  } else {
    orderData.deliveredAt = null;
  }

  const order = await findOrderByIdAndUpdate(id, orderData);
  if (!order) throw new ApiError(req.__("Order not found"), 404);

  return success(res, 200, "Order updated successfully");
};

export const confirmOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  let orderData = req.body;

  const order = await findOrderByIdAndUpdate(id, orderData);
  if (!order) throw new ApiError(req.__("Order not found"), 404);

  if (orderData.isConfirmed) {
    const productsById = new Map<string, any>();

    for (const item of order.cartItems) {
      const product = await findProductById(item.productId.toString());
      if (!product) {
        throw new ApiError(`Product with id ${item.productId} not found`, 404);
      }

      product.quantity -= item.quantity;

      await saveProduct(product);
      productsById.set(item.productId.toString(), product.toObject());
    }

    if (order.userId) {
      const cart = await findCartByUserId(order.userId._id.toString());
      if (cart) {
        cart.items = [];
        cart.subtotal = 0;
        await saveCart(cart);
      }
    }

    const userInfo = {
      fullName: order.userId ? (order.userId as any).fullName : "",
      email: order.userId ? (order.userId as any).email : "",
    };

    const orderObj = order.toObject();
    const payment = await findLatestPaymentByOrderId(order._id.toString());
    const orderForEmail = {
      ...orderObj,
      paymentMethod: payment?.method === "stripe" ? "card" : "cash",
      isPaid: payment?.status === "paid",
      cartItems: (orderObj.cartItems ?? []).map((item: any) => {
        const product = productsById.get(item.productId.toString());
        return {
          ...item,
          product,
        };
      }),
    };

    await new EmailService().sendNewOrderEmailForAdmin(
      process.env.ADMIN_EMAIL || "admin@store.com",
      orderForEmail as any,
      order.userId ? userInfo : undefined,
    );
    // await new EmailService().sendNewOrderEmailForUser(
    //   order.email ? order.email : (order.userId as any).email,
    //   order,
    //   order.userId ? userInfo : undefined
    // );
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
