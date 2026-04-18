import { Request, Response } from "express";
import { success } from "../utils/response";
import {
  createCategory,
  findCategoryAndDeleteById,
  findCategoryById,
  findCategoryByIdAndUpdate,
  getAllCategories,
  getAllSpecialCategories,
} from "./category.repository";
import { ApiError } from "../utils/apiError";
import { CloudflareService } from "../services/cloudflareR2";
import { CategoryDocument } from "./category.schema";

export const addCategory = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const { name_ar, name_en, description_ar, description_en } = req.body;

  let categoryData: Partial<CategoryDocument> = {
    name: {
      ar: name_ar,
      en: name_en,
    },
    description: {
      ar: description_ar,
      en: description_en,
    },
  };

  if (file) {
    const result = await new CloudflareService().uploadFileS3(
      file?.buffer,
      "categories/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );

    categoryData.thumbnail = { imageKey: result.key, imageUrl: result.url };
  }

  const newCategory = await createCategory(categoryData);

  return success(res, 201, "Category added successfully", newCategory);
};

export const editCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file as Express.Multer.File;
  const { name_ar, name_en, description_ar, description_en, isSpecial } =
    req.body;

  if (isSpecial) {
    const { totalCount } = await getAllSpecialCategories({ limit: 0 });
    if (totalCount >= 2) {
      throw new ApiError(
        req.__("You can't add more than 2 special categories"),
        400,
      );
    }
  }

  let categoryData: Partial<CategoryDocument> = {
    name:
      name_ar && name_en
        ? {
            ar: name_ar,
            en: name_en,
          }
        : undefined,
    description:
      description_ar && description_en
        ? {
            ar: description_ar,
            en: description_en,
          }
        : undefined,
    isSpecial: isSpecial,
  };

  const category = await findCategoryById(id);
  if (!category) {
    throw new ApiError(req.__("Category not found"), 404);
  }

  if (file) {
    if (category.thumbnail?.imageKey) {
      await new CloudflareService().deleteFileS3(category.thumbnail.imageKey);
    }
    const result = await new CloudflareService().uploadFileS3(
      file?.buffer,
      "categories/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );
    categoryData.thumbnail = { imageKey: result.key, imageUrl: result.url };
  }

  await findCategoryByIdAndUpdate(id, categoryData);

  return success(res, 200, "Category updated successfully");
};

export const getCategories = async (req: Request, res: Response) => {
  const { categories, totalCount, page } = await getAllCategories(req.query);

  return success(res, 200, null, categories, { page, totalCount });
};

export const getSpecialCategories = async (req: Request, res: Response) => {
  const { categories, totalCount, page } = await getAllSpecialCategories(
    req.query,
  );

  return success(res, 200, null, categories, { page, totalCount });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedCategory = await findCategoryAndDeleteById(id);
  if (!deletedCategory) {
    throw new ApiError(req.__("Category not found"), 404);
  }

  if (deletedCategory.thumbnail?.imageKey) {
    await new CloudflareService().deleteFileS3(
      deletedCategory.thumbnail.imageKey,
    );
  }

  return success(res, 200, "Category deleted successfully");
};
