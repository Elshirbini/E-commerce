import { Request, Response } from "express";
import { CloudflareService } from "../services/cloudflareR2";
import {
  createProduct,
  findProductById,
  findProductByIdAndDelete,
  findProductByIdAndUpdate,
  findProductsByCategoryId,
  getMuchAndLatestSaledProducts,
  saveProduct,
} from "./product.repository";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { ProductDocument } from "./product.schema";
import { Types } from "mongoose";

export const addProduct = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  interface MulterFiles {
    thumbnail?: Express.Multer.File[];
    images?: Express.Multer.File[];
  }
  const files = req.files as MulterFiles;
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    price_kwd,
    price_sar,
    price_qar,
    price_bhd,
    price_aed,
    price_omr,
    quantity,
    weight,
    discount,
  } = req.body;
  let thumbnail: { imageKey: string; imageUrl: string } | undefined;
  let images: { imageKey: string; imageUrl: string }[] = [];

  let productData: Partial<ProductDocument> = {
    categoryId: new Types.ObjectId(categoryId),
    name: { ar: name_ar, en: name_en },
    description: {
      ar: description_ar,
      en: description_en,
    },
    price: {
      kwd: price_kwd,
      sar: price_sar,
      qar: price_qar,
      bhd: price_bhd,
      aed: price_aed,
      omr: price_omr,
    },
    discount,
    quantity,
    weight,
  };

  if (files) {
    if (files.thumbnail) {
      for (const file of files.thumbnail) {
        const result = await new CloudflareService().uploadFileS3(
          file.buffer,
          "products/" + new Date().toISOString() + "-" + file.originalname,
          file.mimetype,
        );

        thumbnail = { imageUrl: result.url, imageKey: result.key };
      }
    }
    if (files.images) {
      for (const file of files.images) {
        const result = await new CloudflareService().uploadFileS3(
          file.buffer,
          "products/" + new Date().toISOString() + "-" + file.originalname,
          file.mimetype,
        );

        images.push({ imageUrl: result.url, imageKey: result.key });
      }
    }
  }
  productData = { ...productData, thumbnail, images: images as any };

  await createProduct(productData);

  return success(res, 201, "Product created successfully");
};

export const getAllProducts = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const { products, totalCount, page } = await findProductsByCategoryId(
    categoryId,
    req.query,
  );

  return success(res, 200, null, products, { page, totalCount });
};

export const getProductDetails = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }
  return success(res, 200, null, product);
};

export const getProductsSales = async (req: Request, res: Response) => {
  const { type, from, to } = req.query;

  if (!type || !from || !to)
    throw new ApiError(req.__("Invalid query params"), 400);

  const { products, totalCount, page } = await getMuchAndLatestSaledProducts(
    req.query,
  );

  return success(res, 200, null, products, { page, totalCount });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    price_kwd,
    price_sar,
    price_qar,
    price_bhd,
    price_aed,
    price_omr,
    quantity,
    weight,
    discount,
  } = req.body;

  let productData: Partial<ProductDocument> = {
    name: { ar: name_ar, en: name_en },
    description: {
      ar: description_ar,
      en: description_en,
    },
    price: {
      kwd: price_kwd,
      sar: price_sar,
      qar: price_qar,
      bhd: price_bhd,
      aed: price_aed,
      omr: price_omr,
    },
    discount,
    quantity,
    weight,
  };

  const product = await findProductByIdAndUpdate(productId, productData);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }

  return success(res, 200, "Product updated successfully");
};

export const updateImage = async (req: Request, res: Response) => {
  const file = req.file;
  const { productId } = req.params;
  const { oldImageKey, type } = req.body;

  const cloudflare = new CloudflareService();

  const product = await findProductById(productId);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }

  const isThumbnail = product.thumbnail?.imageKey === oldImageKey;
  const imageIndex = product.images.findIndex(
    (img) => img.imageKey === oldImageKey,
  );

  // state 1 : delete only
  if (!file && oldImageKey) {
    if (!isThumbnail && imageIndex === -1) {
      throw new ApiError(req.__("Invalid imageKey"), 400);
    }

    await cloudflare.deleteFileS3(oldImageKey);

    if (isThumbnail) {
      product.thumbnail = null;
    } else {
      product.images.splice(imageIndex, 1);
    }

    await saveProduct(product);

    return success(res, 200, "Image deleted successfully");
  }

  // state 2 : add image only
  if (file && !oldImageKey) {
    const result = await cloudflare.uploadFileS3(
      file.buffer,
      "products/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );

    if (type === "thumbnail") {
      // لو عنده thumbnail قديم احذفه
      if (product.thumbnail?.imageKey) {
        await cloudflare.deleteFileS3(product.thumbnail.imageKey);
      }

      product.thumbnail = { imageUrl: result.url, imageKey: result.key };
      await saveProduct(product);
      return success(res, 200, "Thumbnail updated successfully");
    }
    if (type === "images") {
      if (product.images.length >= 5) {
        throw new ApiError(req.__("Maximum of 5 images allowed"), 400);
      }

      const image = { imageUrl: result.url, imageKey: result.key };
      product.images.push(image);

      await saveProduct(product);

      return success(res, 200, "Image added successfully");
    }
  }

  // state 3 : replace image
  if (file && oldImageKey) {
    if (!isThumbnail && imageIndex === -1) {
      throw new ApiError(req.__("Invalid imageKey"), 400);
    }

    const result = await cloudflare.uploadFileS3(
      file.buffer,
      "products/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );

    const newImage = { imageUrl: result.url, imageKey: result.key };

    await cloudflare.deleteFileS3(oldImageKey);

    if (isThumbnail) {
      product.thumbnail = newImage;
    } else {
      product.images.push(newImage);
    }

    await saveProduct(product);
    return success(res, 200, "Image replaced successfully");
  }

  throw new ApiError(req.__("Provide file or oldImageKey"), 400);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const product = await findProductByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(req.__("Product not found"), 404);
  }

  if (product.thumbnail) {
    await new CloudflareService().deleteFileS3(product.thumbnail.imageKey!);
  }

  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      await new CloudflareService().deleteFileS3(img.imageKey);
    }
  }

  return success(res, 200, "Product deleted successfully");
};
