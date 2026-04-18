import { body, checkExact } from "express-validator";

export const addCategoryValidation = [
  body("name_ar")
    .trim()
    .notEmpty()
    .withMessage("Arabic name must be not empty")
    .isString()
    .withMessage("Arabic name must be String"),
  body("name_en")
    .trim()
    .notEmpty()
    .withMessage("English name must be not empty")
    .isString()
    .withMessage("English name must be String"),
  body("description_ar")
    .trim()
    .notEmpty()
    .withMessage("Arabic description must be not empty")
    .isString()
    .withMessage("Arabic description must be String"),
  body("description_en")
    .trim()
    .notEmpty()
    .withMessage("English description must be not empty")
    .isString()
    .withMessage("English description must be String"),

  checkExact(),
];
export const editCategoryValidation = [
  body("name_ar")
    .trim()
    .optional()
    .isString()
    .withMessage("Arabic name must be String"),
  body("name_en")
    .trim()
    .optional()
    .isString()
    .withMessage("English name must be String"),
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

  body("isSpecial")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isSpecial must be boolean"),

  checkExact(),
];
