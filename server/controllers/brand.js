import { cloudinary } from "../config/cloudinary.js";
import { Brand } from "../models/brand.js";
import { ApiError } from "../utils/apiError.js";

export const getAllBrands = async (req, res, next) => {
  try {
    const { user } = req.user;

    if (!user) return next(new ApiError("User not found", 404));

    const brands = await Brand.find();

    if (!brands) return next(new ApiError("Brands not found", 404));

    res.status(200).json({ brands });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name } = req.body;
    const image = req.file.path;
    const { user } = req.user;

    if (!image) return next(new ApiError("File is required.", 401));
    if (!user) return next(new ApiError("User not found.", 404));

    const result = await cloudinary.uploader.upload(image, {
      folder: "Brand",
    });

    const brand = await Brand.create({
      name,
      image: { public_id: result.public_id, url: result.url },
    });

    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { user } = req.user;

    if (!user) return next(new ApiError("User not found", 404));

    const brand = await Brand.findByIdAndDelete(brandId);
    if (!brand) return next(new ApiError("Brand not found", 404));

    await cloudinary.uploader.destroy(brand.image.public_id);

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
