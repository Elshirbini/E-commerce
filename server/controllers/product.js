import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

export const searchingProducts = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { searchTerm } = req.body;

    if (!searchTerm.length) {
      return next(new ApiError("Search term required", 404));
    }
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return next(new ApiError("User not found", 404));
    }
    const regExp = new RegExp(searchTerm.trim(), "i");
    const products = await Product.find({
      $or: [{ name: regExp }, { category: regExp }],
    });

    if (!products.length) {
      return next(new ApiError("No products found", 404));
    }

    res.status(200).json({ product: products });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const userId = user._id;
    const {
      name,
      price,
      category,
      description,
      sizes,
      brand,
      quantity,
      discount,
    } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return next(new ApiError("User not found", 404));
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      sizes,
      brand,
      quantity,
      discount,
      user,
    });
    await product.save();

    res.status(201).json({ product: product });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;
    const {
      name,
      price,
      category,
      description,
      sizes,
      brand,
      quantity,
      discount,
    } = req.body;

    if (
      !name &&
      !price &&
      !category &&
      !description &&
      !sizes &&
      !brand &&
      !quantity &&
      !discount
    ) {
      return next(new ApiError("No changes", 400));
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return next(new ApiError("User not found", 404));
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        category,
        description,
        sizes,
        brand,
        discount,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ApiError("Product not found", 404));
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", product: product });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const addImages = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;
    const image = req.file.path;

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return next(new ApiError("User not found", 404));
    }
    const result = await cloudinary.uploader.upload(image, {
      folder: "Products",
    });

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          images: {
            public_id: result.public_id,
            url: result.url,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ApiError("Product not found", 404));
    }

    res.status(200).json({ productImages: product.images });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const deleteImages = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const public_id = req.query.image;

    const product = await Product.findByIdAndUpdate(productId, {
      $pull: { images: { public_id: public_id } },
    });

    if (!product) {
      return next(new ApiError("Product not found", 404));
    }

    await cloudinary.uploader.destroy(public_id);

    if (!product.images.length) {
      product.images = null;
      await product.save();
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
