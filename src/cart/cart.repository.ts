import { Cart, CartDocument } from "./cart.schema";

export const findCartByUserId = async (userId: string) => {
  return Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "_id name thumbnail",
  });
};

export const createCart = async (cartData: Partial<CartDocument>) => {
  return Cart.create(cartData);
};

export const pullItemFromCart = async (
  cartId: string,
  userId: string,
  productId: string,
) => {
  return Cart.updateOne(
    { _id: cartId, userId },
    { $pull: { items: { productId } } },
  );
};

export const saveCart = async (cart: CartDocument) => {
  return cart.save();
};
