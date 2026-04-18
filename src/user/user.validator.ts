import { body } from "express-validator";

export const updateUserValidation = [
  body("fullName").trim().isString().withMessage("Full name must be String"),
  body("phone")
    .isNumeric()
    .withMessage("Phone must be number")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone must be 11 digits"),
];
