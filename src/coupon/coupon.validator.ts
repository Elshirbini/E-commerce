import { body, checkExact } from "express-validator";

export const createCouponValidation = [
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be string")
    .isLength({ min: 4, max: 6 })
    .withMessage("Code must be from 4 to 6 chars"),

  body("discount")
    .notEmpty()
    .withMessage("Discount is required")
    .isInt({ min: 0, max: 100 })
    .withMessage("Discount must be from 0 to 100"),

  body("expires")
    .notEmpty()
    .withMessage("Expires is required")
    .isString()
    .withMessage("Expires must be date")
    .toDate(),

  checkExact(),
];
