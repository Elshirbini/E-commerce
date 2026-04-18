import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { findUserById } from "../user/user.repository";
import { findCartByUserId, saveCart } from "../cart/cart.repository";
import { success } from "../utils/response";
import {
  createOrder,
  findOrderById,
  findOrderByIdAndUpdate,
  getOrders,
} from "./order.repository";
import { Types } from "mongoose";
import { OrderDocument } from "./schemas/order.schema";
import {
  findProductById,
  findProductsByIds,
  saveProduct,
} from "../product/product.repository";
import { findCouponByCode } from "../coupon/coupon.repository";
import { findShippingTaxByCountry } from "../shippingTax/shippingTax.repository";
import { EmailService } from "../email/email.service";

export const createCashOrder = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, items, shippingAddress, coupon } =
    req.body;
  const userId = req.query.userId as string;
  let productsToCheck: any[] = [];
  let totalPrice: number = 0;
  let invoice: any = {
    items: [],
  };

  if (userId) {
    const user = await findUserById(userId);
    if (!user) throw new ApiError(req.__("User not found"), 404);

    const cart = await findCartByUserId(user._id.toString());
    if (!cart || cart.items.length === 0) {
      throw new ApiError("Cart is empty", 400);
    }

    productsToCheck = cart.items;
  } else {
    if (!items || items.length === 0) {
      throw new ApiError("No items provided", 400);
    }

    productsToCheck = items;
  }

  const productIds = productsToCheck.map((i) => i.productId);
  const products = await findProductsByIds(productIds);

  const invalidProducts: string[] = [];
  const validItems: any[] = [];

  for (const item of productsToCheck) {
    const product = products.find(
      (p) =>
        p._id.toString() ===
        (userId ? item.productId._id.toString() : item.productId.toString()),
    );

    if (!product) {
      invalidProducts.push(`Product ${item.productId} not found`);
      continue;
    }

    if (product.quantity < item.quantity) {
      invalidProducts.push(`${product.name?.en} is out of stock`);
      continue;
    }

    const currentPrice = product.finalPrice?.kwd!;
    totalPrice = currentPrice * item.quantity;

    validItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: currentPrice,
      totalPrice,
    });

    invoice.items.push({
      productId: product.name,
      quantity: item.quantity,
      price: +currentPrice.toFixed(2),
      totalPrice: +totalPrice.toFixed(2),
    });
  }

  if (invalidProducts.length > 0) {
    throw new ApiError(
      `Some products are invalid or unavailable: ${invalidProducts.join(", ")}`,
      400,
    );
  }

  totalPrice = validItems.reduce((acc, i) => acc + i.totalPrice, 0);
  invoice.priceProducts = +totalPrice.toFixed(2);

  if (shippingAddress.country) {
    const shippingTax = await findShippingTaxByCountry(shippingAddress.country);
    if (shippingTax) {
      totalPrice = totalPrice + shippingTax.tax;
      invoice.shippingAddress = shippingAddress.country;
      invoice.shippingTax = shippingTax.tax;
    }
  }

  if (coupon) {
    const couponDoc = await findCouponByCode(coupon);
    if (couponDoc) {
      totalPrice = totalPrice - (totalPrice * couponDoc.discount) / 100;
      invoice.coupon = couponDoc.code;
      invoice.couponDiscount = couponDoc.discount;
    }
  }

  const orderData: Partial<OrderDocument> = {
    shippingAddress,
    cartItems: validItems as any,
    phone,
    totalPrice,
  };

  if (userId) {
    orderData.userId = new Types.ObjectId(userId);
  } else {
    orderData.firstName = firstName;
    orderData.lastName = lastName;
  }

  const order = await createOrder(orderData);

  invoice.totalPrice = +totalPrice.toFixed(2);
  invoice.orderId = order._id;

  return success(res, 201, "Order created successfully", invoice);
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  let orderData = req.body;

  if (orderData.isPaid) {
    orderData.paidAt = new Date(Date.now()).toLocaleString("en-KW");
  } else {
    orderData.paidAt = null;
  }

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
    const orderForEmail = {
      ...orderObj,
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
