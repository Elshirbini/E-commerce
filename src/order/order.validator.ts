import { body, checkExact } from "express-validator";

export const createCashOrderValidation = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be string"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be string"),
  body("email").optional().isEmail().withMessage("Invalid email"),
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

  body("shippingAddress.governorate")
    .trim()
    .notEmpty()
    .withMessage("Governorate is required")
    .isString()
    .withMessage("Governorate must be a string"),

  body("shippingAddress.area")
    .trim()
    .notEmpty()
    .withMessage("Area is required")
    .isString()
    .withMessage("Area must be a string"),

  body("shippingAddress.piece")
    .trim()
    .notEmpty()
    .withMessage("Piece is required")
    .isString()
    .withMessage("Piece must be a string"),

  body("shippingAddress.gaddah")
    .optional()
    .isString()
    .withMessage("Gaddah must be a string"),

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

  body("shippingAddress.floorNumber")
    .optional()
    .isString()
    .withMessage("Floor number must be a string"),

  body("shippingAddress.apartmentNumber")
    .optional()
    .isString()
    .withMessage("Apartment number must be a string"),

  body("shippingAddress.addressNumber")
    .optional()
    .isString()
    .withMessage("Address number must be a string"),

  body("shippingAddress.landmarks")
    .optional()
    .isString()
    .withMessage("Landmarks must be a string"),

  body("shippingAddress.notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string"),

  checkExact(),
];

export const updateOrderValidation = [
  body("isPaid").optional().isBoolean().withMessage("isPaid must be a boolean"),
  body("isDelivered")
    .optional()
    .isBoolean()
    .withMessage("isDelivered must be a boolean"),
  body("isConfirmed")
    .optional()
    .isBoolean()
    .withMessage("isConfirmed must be a boolean"),
];
export const confirmOrderValidation = [
  body("isConfirmed")
    .optional()
    .isBoolean()
    .withMessage("isConfirmed must be a boolean"),
];
