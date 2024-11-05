import { Product } from "../models/product.js";
import { User } from "../models/user.js";

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
    const { name, price, category, description } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).send("User not found.");
    }
    if (userDoc.role !== "admin") {
      return res
        .status(401)
        .json({ error: "This function must be used from Admins only" });
    }
    const product = await Product.create({
      name,
      price,
      category,
      description,
      user,
    });
    await product.save();

    res.status(201).json({ product: product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
