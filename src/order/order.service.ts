import { findCartByUserId, saveCart } from "../cart/cart.repository";
import { findProductById, saveProduct } from "../product/product.repository";
import { EmailService } from "../email/email.service";
import { ApiError } from "../utils/apiError";
import { OrderDocument } from "./schemas/order.schema";

export const processOrderConfirmation = async (
  order: OrderDocument,
  paymentStatus: string,
  paymentMethod: string,
) => {
  const productsById = new Map<string, any>();

  for (const item of order.cartItems) {
    const product = await findProductById(item.productId.toString());
    if (!product) {
      throw new ApiError(`Product with id ${item.productId} not found`, 404);
    }

    product.quantity -= item.quantity;
    if (product.quantity < 0) product.quantity = 0; // Ensure it doesn't go below 0

    await saveProduct(product);
    productsById.set(
      item.productId.toString(),
      product.toObject ? product.toObject() : product,
    );
  }

  if (order.userId) {
    const userIdStr =
      typeof order.userId === "string"
        ? order.userId
        : order.userId._id?.toString() || order.userId.toString();
    const cart = await findCartByUserId(userIdStr);
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

  const orderObj = order.toObject ? order.toObject() : order;

  const orderForEmail = {
    ...orderObj,
    paymentMethod,
    isPaid: paymentStatus === "paid",
    cartItems: (orderObj.cartItems ?? []).map((item: any) => {
      const product = productsById.get(item.productId.toString());
      return {
        ...item,
        product,
      };
    }),
  };

  await new EmailService().sendNewOrderEmailForAdmin(
    "ahmedalshirbini33@gmail.com",
    orderForEmail as any,
    order.userId ? userInfo : undefined,
  );
};
