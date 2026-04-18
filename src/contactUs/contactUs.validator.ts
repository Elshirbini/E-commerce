import { body } from "express-validator";

export const addCommentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be string")
    .isLength({ min: 3, max: 50 }),
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .isString()
    .withMessage("Phone must be string"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isString()
    .withMessage("Comment must be string")
    .isLength({ min: 5, max: 300 })
    .withMessage("Comment must be between 5 and 300 characters"),
];
