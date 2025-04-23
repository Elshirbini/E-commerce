import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";

export const addToCart = async (req, res, next) => {
  const { user } = req.user;
  const { productId, quantity, price } = req.body;

  const userData = await User.findById(user._id);

  if (!userData) throw new ApiError("User not found", 404);

  const product = await Product.findById(productId);

  if (!product || price !== product.price || quantity > product.quantity) {
    throw new ApiError("Product not found or invalid request", 404);
  }

  const cart = await Cart.findOne({ userId: userData._id });

  if (cart) {
    const existingProduct = cart.items.find(
      (ele) => ele.productId.toString() == productId
    );
    if (existingProduct) {
      if (!(existingProduct.quantity <= product.quantity - 1)) {
        throw new ApiError(
          `I'am Sorry we have ${product.quantity} items only`,
          400
        );
      }

      existingProduct.quantity += quantity;
      cart.totalCost += quantity * price;
      await cart.save();

      const updatedCart = await Cart.findOne({ _id: cart._id }).populate(
        "items.productId"
      );

      userData.cart = updatedCart._id;
      await userData.save();

      return res
        .status(200)
        .json({ message: "Cart updated successfully", cart: updatedCart });
    } else {
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: user._id },
        {
          $push: {
            items: { productId, quantity, price },
          },
          totalCost: cart.totalCost + quantity * price,
        },
        { new: true, runValidators: true }
      ).populate("items.productId");

      userData.cart = updatedCart._id;
      await userData.save();

      return res
        .status(200)
        .json({ cart: updatedCart, message: "Product added successfully" });
    }
  } else {
    const cart = await Cart.create({
      items: [{ productId, price, quantity }],
      userId: userData._id,
      totalCost: quantity * price,
    });
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: cart.userId }).populate(
      "items.productId"
    );

    userData.cart = updatedCart._id;
    await userData.save();

    res
      .status(201)
      .json({ message: "Cart created successfully", cart: updatedCart });
  }
};

export const getUserCart = async (req, res, next) => {
  const { user } = req.user;

  if (!user) throw new ApiError("User not found", 404);

  const cart = await Cart.findOne({ userId: user._id }).populate(
    "items.productId"
  );

  res.status(200).json({ cart: cart });
};

export const removeFromCart = async (req, res, next) => {
  const { cartId, productId } = req.params;
  const { user } = req.user;

  const userData = await User.findById(user._id);
  if (!userData) throw new ApiError("User not found");

  const cart = await Cart.findById(cartId);
  if (!cart) throw new ApiError("Cart not found", 404);

  const product = await Product.findById(productId);
  const productInCart = cart.items.find(
    (ele) => ele.productId.toString() === productId
  );
  if (!product || !productInCart) {
    throw new ApiError(
      "Product not found in products or not found in cart",
      404
    );
  }

  await Cart.findByIdAndUpdate(
    cart._id,
    {
      $pull: { items: { productId: productInCart.productId } },
    },
    { new: true, runValidators: true }
  );

  cart.totalCost = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  await cart.save();

  res.status(200).json({ message: "Product deleted from cart successfully" });
};

export const updateQuantity = async (req, res, next) => {
  const { user } = req.user;
  const { cartId, productId } = req.params;
  const { quantity } = req.body;

  if (!quantity) throw new ApiError("Quantity is required");

  const userData = await User.findById(user._id);
  if (!userData) throw new ApiError("User not found");

  const cart = await Cart.findById(cartId);
  if (!cart) throw new ApiError("Cart not found");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError("Product not found");

  const productInCart = cart.items.find(
    (ele) => ele.productId.toString() === productId
  );

  if (!product || !productInCart) {
    throw new ApiError("Product not found in products or not found in cart");
  }
  await Cart.findOneAndUpdate(
    { _id: cartId, "items.productId": productId },
    {
      $set: { "items.$.quantity": quantity },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  cart.totalCost = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  await cart.save();

  res
    .status(200)
    .json({ message: "Quantity updated successfully", cart: cart });
};
