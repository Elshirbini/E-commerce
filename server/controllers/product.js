import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { Cart } from "../models/cart.js";

export const searchingProducts = async (req, res, next) => {
  const { user } = req.user;
  const { searchTerm } = req.body;

  if (!searchTerm.length) throw new ApiError("Search term required", 404);

  const userDoc = await User.findById(user._id);

  if (!userDoc) throw new ApiError("User not found", 404);

  const regExp = new RegExp(searchTerm.trim(), "i");
  const products = await Product.find({
    $or: [{ name: regExp }, { category: regExp }],
  });

  if (!products.length) throw new ApiError("No products found", 404);

  res.status(200).json({ product: products });
};

export const createProduct = async (req, res, next) => {
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
  const images = req.files;

  if (!images) throw new ApiError("File is required", 400);

  const userDoc = await User.findById(userId);

  if (!userDoc) throw new ApiError("User not found", 404);

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

  for (const info of images) {
    const result = await cloudinary.uploader.upload(info.path, {
      folder: "Products",
    });
    product.images.push({ public_id: result.public_id, url: result.url });
  }
  await product.save();

  res.status(201).json({ product: product });
};

export const updateProduct = async (req, res, next) => {
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
    throw new ApiError("No changes", 400);
  }

  const userDoc = await User.findById(user._id);

  if (!userDoc) throw new ApiError("User not found", 404);

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

  if (!product) throw new ApiError("Product not found", 404);

  res
    .status(200)
    .json({ message: "Product updated successfully", product: product });
};

export const addImages = async (req, res, next) => {
  const { user } = req.user;
  const { productId } = req.params;
  const image = req.file.path;

  if (!image) throw new ApiError("File is required", 400);

  const userDoc = await User.findById(user._id);

  if (!userDoc) return next(new ApiError("User not found", 404));

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

  if (!product) throw new ApiError("Product not found", 404);

  res.status(200).json({ productImages: product.images });
};

export const deleteImages = async (req, res, next) => {
  const { productId } = req.params;
  const public_id = req.query.image;

  const product = await Product.findByIdAndUpdate(productId, {
    $pull: { images: { public_id: public_id } },
  });

  if (!product) throw new ApiError("Product not found", 404);

  await cloudinary.uploader.destroy(public_id);

  if (!product.images.length) {
    product.images = [];
    await product.save();
  }

  res.status(200).json({ message: "Image deleted successfully" });
};

export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  let product = await Product.findById(productId);
  if (!product) throw new ApiError("Product not found", 404);

  if (product.images.length) {
    for (const id of product.images) {
      await cloudinary.uploader.destroy(id.public_id);
    }
  }

  const cart = await Cart.findOneAndUpdate(
    {
      items: { $elemMatch: { productId: productId } },
    },
    { $pull: { items: { productId: productId } } },
    { new: true, runValidators: true }
  );

  if (!cart) throw new ApiError("Cart not found", 404);

  const newTotalCost = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  cart.totalCost = newTotalCost;
  await cart.save();

  product = await Product.findByIdAndDelete(productId);

  res.status(200).json({ message: "Product deleted successfully" });
};
