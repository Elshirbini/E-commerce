import { body, checkExact } from "express-validator";

export const checkoutCashValidation = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be string"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be string"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isString()
    .withMessage("Phone must be string")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be from 10 to 15 digits"),
  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item"),
  body("items.*.productId")
    .optional()
    .isString()
    .withMessage("productId must be string"),
  body("items.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantity must be >= 1"),
  body("coupon").optional().isString().withMessage("Coupon must be string"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("shippingAddress is required")
    .isObject()
    .withMessage("shippingAddress must be an object"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),
  body("shippingAddress.buildingNumber")
    .trim()
    .notEmpty()
    .withMessage("Building number is required")
    .isString()
    .withMessage("Building number must be a string"),
  body("shippingAddress.governorate")
    .optional()
    .isString()
    .withMessage("Governorate must be a string"),
  body("shippingAddress.area")
    .optional()
    .isString()
    .withMessage("Area must be a string"),
  body("shippingAddress.notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string"),
  checkExact(),
];

export const checkoutStripeValidation = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be string"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be string"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isString()
    .withMessage("Phone must be string")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be from 10 to 15 digits"),
  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item"),
  body("items.*.productId")
    .optional()
    .isString()
    .withMessage("productId must be string"),
  body("items.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantity must be >= 1"),
  body("coupon").optional().isString().withMessage("Coupon must be string"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("shippingAddress is required")
    .isObject()
    .withMessage("shippingAddress must be an object"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),
  body("shippingAddress.buildingNumber")
    .trim()
    .notEmpty()
    .withMessage("Building number is required")
    .isString()
    .withMessage("Building number must be a string"),
  body("shippingAddress.governorate")
    .optional()
    .isString()
    .withMessage("Governorate must be a string"),
  body("shippingAddress.area")
    .optional()
    .isString()
    .withMessage("Area must be a string"),
  body("shippingAddress.notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string"),
  // body("successUrl")
  //   .optional()
  //   .isURL()
  //   .withMessage("successUrl must be a valid URL"),
  // body("cancelUrl")
  //   .optional()
  //   .isURL()
  //   .withMessage("cancelUrl must be a valid URL"),
  checkExact(),
];

export const markCashPaidValidation = [
  body("paid").notEmpty().isBoolean().withMessage("paid must be a boolean"),
  checkExact(),
];
