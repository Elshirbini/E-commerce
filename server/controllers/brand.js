import asyncHandler from "express-async-handler";
import { cloudinary } from "../config/cloudinary.js";
import { Brand } from "../models/brand.js";
import { ApiError } from "../utils/apiError.js";

export const getAllBrands = asyncHandler(async (req, res, next) => {
  const { user } = req.user;

  if (!user) throw new ApiError("User not found", 404);

  const brands = await Brand.find();

  if (!brands) throw new ApiError("Brands not found", 404);

  res.status(200).json({ brands });
});

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const image = req.file.path;
  const { user } = req.user;

  if (!image) throw new ApiError("File is required.", 401);
  if (!user) throw new ApiError("User not found.", 404);

  const result = await cloudinary.uploader.upload(image, {
    folder: "Brand",
  });

  const brand = await Brand.create({
    name,
    image: { public_id: result.public_id, url: result.url },
  });

  res.status(201).json({ message: "Brand created successfully", brand });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const { user } = req.user;

  if (!user) throw new ApiError("User not found", 404);

  const brand = await Brand.findByIdAndDelete(brandId);
  if (!brand) throw new ApiError("Brand not found", 404);

  await cloudinary.uploader.destroy(brand.image.public_id);

  res.status(200).json({ message: "Brand deleted successfully" });
});
