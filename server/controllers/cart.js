import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";

export const addToCart = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId, quantity, price } = req.body;

    const userData = await User.findById(user._id);
    if (!userData) {
      return next(new ApiError("User not found", 404));
    }

    const product = await Product.findById(productId);

    if (!product || price !== product.price || quantity > product.quantity) {
      return next(new ApiError("Product not found or invalid request", 404));
    }

    const cart = await Cart.findOne({ userId: userData._id });

    if (cart) {
      const existingProduct = cart.items.find(
        (ele) => ele.productId.toString() == productId
      );
      if (existingProduct) {
        if (!(existingProduct.quantity <= product.quantity - 1)) {
          return next(
            new ApiError(
              `I'am Sorry we have ${product.quantity} items only`,
              400
            )
          );
        }
        existingProduct.quantity += quantity;
        cart.totalCost += quantity * price;
        await cart.save();

        const updatedCart = await Cart.findOne({ _id: cart._id }).populate(
          "items.productId"
        );

        userData.cart = updatedCart;
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

        userData.cart = updatedCart;
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

      userData.cart = updatedCart;
      await userData.save();

      res
        .status(201)
        .json({ message: "Cart created successfully", cart: updatedCart });
    }
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const getUserCart = async (req, res, next) => {
  try {
    const { user } = req.user;

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    const cart = await Cart.findOne({ userId: user._id }).populate(
      "items.productId"
    );

    res.status(200).json({ cart: cart });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
