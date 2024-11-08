import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { cloudinary } from "../utils/cloudinary.js";

export const searchingProducts = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { searchTerm } = req.body;
    if (!searchTerm.length) {
      return res.status(400).json({ error: "Search term required" });
    }
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }
    const regExp = new RegExp(searchTerm.trim(), "i");
    const products = await Product.find({
      $or: [{ name: { $regex: regExp } }, { category: { $regex: regExp } }],
    });

    if (!products.length) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json({ product: products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const userId = user._id;
    const { name, price, category, description, sizes } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).send("User not found.");
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      sizes,
      user,
    });
    await product.save();

    res.status(201).json({ product: product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;
    const { name, price, category, description, sizes } = req.body;

    if (!name && !price && !category && !description && !sizes) {
      return res.status(404).json({ error: "No changes" });
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        price,
        category,
        description,
        sizes,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", product: product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addImages = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { productId } = req.params;
    const image = req.file.path;

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
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

    res.status(200).json({ productImages: product.images });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteImages = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const public_id = req.query.image;

    console.log(productId);
    console.log(public_id);
    // const products = await Product.find();
    // products.forEach((product) => {
    //   if (!product.images.length) {
    //     product.images = null;
    //     product.save();
    //   }
    // });

    const product = await Product.findByIdAndUpdate(productId, {
      $pull: { images: { public_id: public_id } },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await cloudinary.uploader.destroy(public_id);

    if (!product.images.length) {
      product.images = null;
      await product.save();
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
