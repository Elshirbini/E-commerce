import { body, checkExact } from "express-validator";

export const registrationValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be string")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password is weak , password must be from 8 to 16 chars"),
  body("phone")
    .trim()
    .optional()
    .isString()
    .withMessage("Phone must be string")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be from 10 to 15 digits"),

  checkExact(),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("password").trim().notEmpty().withMessage("Password is required"),
  checkExact(),
];

export const codeValidator = [
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be String"),
  checkExact(),
];

export const otpValidator = [
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isString()
    .withMessage("OTP must be String"),
  checkExact(),
];

export const emailValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  checkExact(),
];

export const passwordValidator = [
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 16 })
    .withMessage("Password is weak , password must from 8 to 16 chars"),
  checkExact(),
];
