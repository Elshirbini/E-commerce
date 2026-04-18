import { Types } from "mongoose";
import { ApiError } from "../utils/apiError";
import { findUserById } from "../user/user.repository";
import { findCartByUserId } from "../cart/cart.repository";
import { findCouponByCode } from "../coupon/coupon.repository";
import { findShippingTaxByCountry } from "../shippingTax/shippingTax.repository";
import { findProductsByIds } from "../product/product.repository";
import { OrderDocument } from "./schemas/order.schema";
import { Request, Response } from "express";

type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

type ShippingAddressInput = {
  country: string;
  governorate?: string;
  area?: string;
  piece: string;
  gaddah?: string;
  street: string;
  buildingNumber: string;
  notes?: string;
};

export type CheckoutInput = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  items?: CheckoutItemInput[];
  shippingAddress: ShippingAddressInput;
  coupon?: string;
};

type Invoice = {
  items: Array<{
    productId: any;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  priceProducts: number;
  shippingAddress?: string;
  shippingTax?: number;
  coupon?: string;
  couponDiscount?: number;
  totalPrice: number;
};

export const buildOrderForCheckout = async (
  reqT: Request,
  input: CheckoutInput,
): Promise<{
  orderData: Partial<OrderDocument>;
  invoice: Invoice;
  amountMinor: number;
  currency: "usd";
}> => {
  const { userId, firstName, lastName, phone, items, shippingAddress, coupon } =
    input;

  let productsToCheck: any[] = [];
  let totalPrice = 0;
  const invoice: Invoice = { items: [], priceProducts: 0, totalPrice: 0 };

  if (userId) {
    const user = await findUserById(userId);
    if (!user) throw new ApiError(reqT.__("User not found"), 404);

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

  const productIds = productsToCheck.map((i: any) =>
    typeof i.productId === "string" ? i.productId : i.productId?._id,
  );
  const products = await findProductsByIds(productIds);

  const invalidProducts: string[] = [];
  const validItems: any[] = [];

  for (const item of productsToCheck) {
    const itemProductId = userId
      ? item.productId?._id?.toString()
      : item.productId;
    const product = products.find(
      (p: any) => p._id.toString() === itemProductId,
    );

    if (!product) {
      invalidProducts.push(`Product ${itemProductId} not found`);
      continue;
    }

    if (product.quantity < item.quantity) {
      invalidProducts.push(`${product.name?.en} is out of stock`);
      continue;
    }

    const currentPrice = product.finalPrice?.kwd;
    if (typeof currentPrice !== "number") {
      invalidProducts.push(
        `${product.name?.en ?? "Product"} has invalid price`,
      );
      continue;
    }

    const lineTotal = currentPrice * item.quantity;

    validItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: currentPrice,
      totalPrice: lineTotal,
    });

    invoice.items.push({
      productId: product.name,
      quantity: item.quantity,
      price: +currentPrice.toFixed(2),
      totalPrice: +lineTotal.toFixed(2),
    });
  }

  if (invalidProducts.length > 0) {
    throw new ApiError(
      `Some products are invalid or unavailable: ${invalidProducts.join(", ")}`,
      400,
    );
  }

  totalPrice = validItems.reduce(
    (acc: number, i: any) => acc + i.totalPrice,
    0,
  );
  invoice.priceProducts = +totalPrice.toFixed(2);

  if (shippingAddress?.country) {
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

  invoice.totalPrice = +totalPrice.toFixed(2);

  return {
    orderData,
    invoice,
    amountMinor: Math.round(totalPrice * 100),
    currency: "usd",
  };
};
