import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";

export const getAllFavorites = async (req, res, next) => {
  try {
    const { user } = req.user;

    const userData = await User.findById(user._id).populate("favorites");

    if (!userData) return next(new ApiError("User not found", 404));

    res.status(200).json({ products: userData.favorites });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const addToFavorites = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) return next(new ApiError("Product not found"));

    const userData = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { favorites: productId },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!userData) return next(new ApiError("User not found"));

    res.status(200).json({
      message: "Product Added to favorites successfully",
      favorites: userData.favorites,
    });
  } catch (error) {
    next(new ApiError(error, 404));
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return next(new ApiError("Product not found", 404));

    const userData = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { favorites: productId },
      },
      { new: true, runValidators: true }
    );

    if (!userData) return next(new ApiError("User not found"));

    res
      .status(200)
      .json({ message: "Product removed from favorites successfully" });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
