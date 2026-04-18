import { Request, Response } from "express";
import { findProductById } from "../product/product.repository";
import { ApiError } from "../utils/apiError";
import {
  createCart,
  findCartByUserId,
  pullItemFromCart,
  saveCart,
} from "./cart.repository";
import { success } from "../utils/response";
import { CartDocument } from "./cart.schema";

export const addToCart = async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  const userId = req.userId;
  let cartItem;
  let cartData;

  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }

  if (product.quantity < quantity) {
    throw new ApiError(req.__("Insufficient product stock"), 400);
  }

  const cart: CartDocument | null = await findCartByUserId(userId!);

  if (cart) {
    // add the product to the existing cart or the product already exists add the quantity and update the price only

    const index = cart.items.findIndex(
      (item) => (item.productId as any)._id.toString() === productId,
    );

    if (index !== -1) {
      const newQuantity = cart.items[index].quantity + quantity;
      if (product.quantity < newQuantity) {
        throw new ApiError(req.__("Insufficient product stock"), 400);
      }
      cart.items[index].quantity += newQuantity;
      cart.items[index].totalPrice =
        cart.items[index].quantity * cart.items[index].price;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.finalPrice?.kwd ?? 0,
        totalPrice: quantity * (product.finalPrice?.kwd ?? 0),
      });
    }

    await saveCart(cart);

    return success(
      res,
      200,
      index !== -1
        ? "Product quantity updated successfully"
        : "Product added to cart successfully",
    );
  } else {
    // create a new cart

    cartItem = {
      productId,
      quantity,
      price: product.finalPrice?.kwd!,
      totalPrice: quantity * product.finalPrice?.kwd!,
    };

    cartData = {
      userId,
      items: [cartItem],
      currency: "KWD",
    };

    await createCart(cartData);

    return success(
      res,
      201,
      "Cart created and product added to cart successfully",
    );
  }
};

export const syncCartAfterLogin = async (req: Request, res: Response) => {
  const { items } = req.body;
  const userId = req.userId;

  let cart = await findCartByUserId(userId!);

  if (!cart) {
    cart = await createCart({
      userId,
      items: [],
      currency: "USD",
    });
  }

  for (const { productId, quantity } of items) {
    const product = await findProductById(productId);

    if (!product) continue;

    const finalQuantity = Math.min(quantity, product.quantity);

    const index = cart.items.findIndex(
      (item) => (item.productId as any)._id.toString() === productId,
    );

    if (index !== -1) {
      cart.items[index].quantity += finalQuantity;
      cart.items[index].totalPrice =
        cart.items[index].quantity * cart.items[index].price;
    } else {
      cart.items.push({
        productId,
        quantity: finalQuantity,
        price: product.finalPrice?.kwd!,
        totalPrice: finalQuantity * product.finalPrice?.kwd!,
      });
    }
  }

  await saveCart(cart);

  return success(res, 200, "Cart synchronized successfully", cart);
};

export const getCart = async (req: Request, res: Response) => {
  const userId = req.userId;

  const cart = await findCartByUserId(userId!);

  if (!cart) {
    throw new ApiError(req.__("Cart not found"), 404);
  }

  return success(res, 200, null, cart);
};

export const updateCart = async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const { cartId, productId } = req.params;
  const userId = req.userId;

  const cart = await findCartByUserId(userId!);

  if (
    !cart ||
    cart._id.toString() !== cartId ||
    cart.userId.toString() !== userId
  ) {
    throw new ApiError(req.__("Cart not found"), 404);
  }

  const item = cart.items.find(
    (i) => (i.productId as any)._id.toString() === productId,
  );
  if (!item) {
    throw new ApiError(req.__("Product not found in cart"), 404);
  }

  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }

  if (product.quantity < quantity) {
    throw new ApiError(req.__("Insufficient product stock"), 400);
  }

  if (quantity <= 0) {
    await pullItemFromCart(cart._id.toString(), userId!, productId);
  } else {
    item.quantity = quantity;
    item.price = product.finalPrice?.kwd!;
    item.totalPrice = item.quantity * item.price;
  }

  await saveCart(cart);

  return success(res, 200, "Cart updated successfully");
};

export const deleteProductInCart = async (req: Request, res: Response) => {
  const { cartId, productId } = req.params;
  const userId = req.userId;

  const cart = await findCartByUserId(userId!);

  if (
    !cart ||
    cart._id.toString() !== cartId ||
    cart.userId.toString() !== userId
  ) {
    throw new ApiError(req.__("Cart not found"), 404);
  }

  const item = cart.items.find(
    (i) => (i.productId as any)._id.toString() === productId,
  );

  if (!item) {
    throw new ApiError(req.__("Product not found in cart"), 404);
  }

  await pullItemFromCart(cart._id.toString(), userId!, productId);

  return success(res, 200, "Product removed from cart successfully");
};

export const clearCart = async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const userId = req.userId;

  const cart = await findCartByUserId(userId!);

  if (
    !cart ||
    cart._id.toString() !== cartId ||
    cart.userId.toString() !== userId
  ) {
    throw new ApiError(req.__("Cart not found"), 404);
  }

  cart.items = [];

  await saveCart(cart);

  return success(res, 200, "Cart cleared successfully");
};
