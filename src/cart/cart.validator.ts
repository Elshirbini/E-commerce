import { body, checkExact } from "express-validator";
import { ApiError } from "../utils/apiError";

export const addToCartValidation = [
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),

  checkExact(),
];

export const syncCartValidation = [
  body("items")
    .notEmpty()
    .withMessage("Items is required")
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item")
    .custom((items) => {
      for (const item of items) {
        if (
          !item.hasOwnProperty("productId") ||
          !item.hasOwnProperty("quantity")
        ) {
          throw new ApiError("Each item must have productId and quantity", 400);
        }
      }
    }),

  checkExact(),
];
