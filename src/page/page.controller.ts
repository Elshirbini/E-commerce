import { Request, Response } from "express";
import {
  createPage,
  findPageAndDelete,
  findPageByPage,
  getAllPages,
  savePage,
} from "./page.repository";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { CloudflareService } from "../services/cloudflareR2";

export const addPage = async (req: Request, res: Response) => {
  const { page } = req.body;

  await createPage({ page });

  return success(res, 201, "Page created successfully");
};

export const getPages = async (req: Request, res: Response) => {
  const { pages, totalCount, page } = await getAllPages(req.query);

  return success(res, 200, null, pages, { page, totalCount });
};

export const getPage = async (req: Request, res: Response) => {
  const { page } = req.params;

  const pageDoc = await findPageByPage(page);

  if (!pageDoc) {
    throw new ApiError(req.__("Page not found"), 404);
  }

  return success(res, 200, null, pageDoc);
};

export const deletePage = async (req: Request, res: Response) => {
  const { page } = req.params;

  const pageDoc = await findPageAndDelete(page);
  if (!pageDoc) throw new ApiError(req.__("Page not found"), 404);

  for (const section of pageDoc.sections) {
    if (section.images && section.images.length > 0) {
      for (const img of section.images) {
        await new CloudflareService().deleteFileS3(img.imageKey!);
      }
    }
  }

  return success(res, 200, "Page deleted successfully");
};

export const addSection = async (req: Request, res: Response) => {
  const { page } = req.params;
  const sectionData = req.body;
  const files = req.files as Express.Multer.File[] | undefined;
  let images: { imageKey: string; imageUrl: string }[] = [];

  if (files) {
    for (const file of files) {
      const result = await new CloudflareService().uploadFileS3(
        file.buffer,
        "pages/" + new Date().toISOString() + "-" + file.originalname,
        file.mimetype,
      );

      images.push({
        imageKey: result.key,
        imageUrl: result.url,
      });
    }
  }

  sectionData.images = images;

  const pageDoc = await findPageByPage(page);
  if (!pageDoc) {
    throw new ApiError(req.__("Page not found"), 404);
  }

  const exists = pageDoc.sections.some((s) => s.type === sectionData.type);
  if (exists) {
    throw new ApiError(req.__("Section already exists"), 400);
  }

  pageDoc.sections.push(sectionData);

  await savePage(pageDoc);

  return success(res, 200, "Section added successfully");
};

export const editSection = async (req: Request, res: Response) => {
  const { page, type } = req.params;
  const sectionData = req.body;

  const pageDoc = await findPageByPage(page);
  if (!pageDoc) throw new ApiError(req.__("Page not found"), 404);

  const section = pageDoc.sections.find((s) => s.type === type);
  if (!section) throw new ApiError(req.__("Section not found"), 404);

  Object.assign(section, sectionData);

  await savePage(pageDoc);

  return success(res, 200, "Section updated successfully");
};

export const updateImage = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const { page, type } = req.params;
  const { oldImageKey } = req.body;

  const cloudflare = new CloudflareService();

  const pageDoc = await findPageByPage(page);
  if (!pageDoc) throw new ApiError(req.__("Page not found"), 404);

  const section = pageDoc.sections.find((s) => s.type === type);
  if (!section) throw new ApiError(req.__("Section not found"), 404);

  const imageIndex = section.images.findIndex(
    (img) => img.imageKey === oldImageKey,
  );

  // state 1 : delete only
  if (!file && oldImageKey) {
    if (imageIndex === -1) {
      throw new ApiError(req.__("Invalid imageKey"), 400);
    }

    await cloudflare.deleteFileS3(oldImageKey);

    section.images.splice(imageIndex, 1);

    await savePage(pageDoc);

    return success(res, 200, "Image deleted successfully");
  }

  // state 2 : add image only
  if (file && !oldImageKey) {
    const result = await cloudflare.uploadFileS3(
      file.buffer,
      "pages/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );

    if (section.images.length >= 5) {
      throw new ApiError(req.__("Maximum of 5 images allowed"), 400);
    }

    const image = { imageUrl: result.url, imageKey: result.key };
    section.images.push(image);

    await savePage(pageDoc);

    return success(res, 200, "Image added successfully");
  }

  // state 3 : replace image
  if (file && oldImageKey) {
    if (imageIndex === -1) {
      throw new ApiError(req.__("Invalid imageKey"), 400);
    }

    const result = await cloudflare.uploadFileS3(
      file.buffer,
      "pages/" + new Date().toISOString() + "-" + file.originalname,
      file.mimetype,
    );

    const newImage = { imageUrl: result.url, imageKey: result.key };

    await cloudflare.deleteFileS3(oldImageKey);

    section.images.push(newImage);

    await savePage(pageDoc);

    return success(res, 200, "Image replaced successfully");
  }

  throw new ApiError(req.__("Provide file or oldImageKey"), 400);
};

export const deleteSection = async (req: Request, res: Response) => {
  const { page, type } = req.params;

  const pageDoc = await findPageByPage(page);
  if (!pageDoc) throw new ApiError(req.__("Page not found"), 404);

  const sectionIndex = pageDoc.sections.findIndex((s) => s.type === type);
  if (sectionIndex === -1) throw new ApiError(req.__("Section not found"), 404);

  if (
    pageDoc.sections[sectionIndex].images &&
    pageDoc.sections[sectionIndex].images.length > 0
  ) {
    for (const img of pageDoc.sections[sectionIndex].images) {
      await new CloudflareService().deleteFileS3(img.imageKey!);
    }
  }

  pageDoc.sections.splice(sectionIndex, 1);

  await savePage(pageDoc);

  return success(res, 200, "Section deleted successfully");
};
