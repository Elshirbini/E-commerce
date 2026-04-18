import { body, checkExact } from "express-validator";

export const addCountryValidation = [
  body("country_en")
    .notEmpty()
    .withMessage("Country en is required")
    .isString()
    .withMessage("Country en is required"),

  body("country_ar")
    .notEmpty()
    .withMessage("Country ar is required")
    .isString()
    .withMessage("Country ar is required"),

  body("tax")
    .notEmpty()
    .withMessage("Tax is required")
    .isFloat({ min: 0 })
    .withMessage("Tax must be positive number"),

  checkExact(),
];
