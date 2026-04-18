import { body, checkExact } from "express-validator";

export const addPageValidation = [
  body("page")
    .notEmpty()
    .withMessage("Page is required")
    .isString()
    .withMessage("Page must be string"),

  checkExact(),
];

export const addSectionValidation = [
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isString()
    .withMessage("Type must be string"),

  body("title_ar")
    .trim()
    .optional()
    .isString()
    .withMessage("Arabic title must be String"),
  body("title_en")
    .trim()
    .optional()
    .isString()
    .withMessage("English title must be String"),

  body("description_ar")
    .trim()
    .optional()
    .isString()
    .withMessage("Arabic description must be String"),

  body("description_en")
    .trim()
    .optional()
    .isString()
    .withMessage("English description must be String"),

  body("link").trim().optional().isString().withMessage("Link must be String"),
];

export const editSectionValidation = [
  body("title_ar")
    .trim()
    .optional()
    .isString()
    .withMessage("Arabic title must be String"),

  body("title_en")
    .trim()
    .optional()
    .isString()
    .withMessage("English title must be String"),

  body("description_ar")
    .trim()
    .optional()
    .isString()
    .withMessage("Arabic description must be String"),

  body("description_en")
    .trim()
    .optional()
    .isString()
    .withMessage("English description must be String"),

  body("link").trim().optional().isString().withMessage("Link must be String"),
];
