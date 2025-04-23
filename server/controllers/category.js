import { cloudinary } from "../config/cloudinary.js";
import { Category } from "../models/category.js";
import { ApiError } from "../utils/apiError.js";

export const getAllCategories = async (req, res, next) => {
  const { user } = req.user;
  if (!user) throw new ApiError("User not found", 404);

  const categories = await Category.find();

  res.status(200).json({ categories });
};

export const createCategory = async (req, res, next) => {
  const { user } = req.user;
  const { name } = req.body;
  const image = req.file.path;

  if (!image) throw new ApiError("Image is required");
  if (!user) throw new ApiError("User not found", 404);

  const result = await cloudinary.uploader.upload(image, {
    folder: "Category",
  });
  const category = await Category.create({
    name,
    image: { public_id: result.public_id, url: result.url },
  });

  res.status(200).json({ message: "Category created successfully", category });
};

export const deleteCategory = async (req, res, next) => {
  const { user } = req.user;
  const { categoryId } = req.params;

  if (!user) throw new ApiError("User not found", 404);

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError("Category not found", 404);

  await cloudinary.uploader.destroy(category.image.public_id);

  res.status(200).json({ message: "Category deleted successfully" });
};
