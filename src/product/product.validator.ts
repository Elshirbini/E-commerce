import { body, checkExact } from "express-validator";
// import { Settings } from "../settings/settings.schema";
// import { NextFunction, Request, Response } from "express";
// import { allCurrencies } from "../utils/allCurrencies";

export const addProductValidator = [
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

  body("price_kwd")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in KWD must be a number greater than 0")
    .toFloat(),

  body("price_sar")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in SAR must be a number greater than 0")
    .toFloat(),

  body("price_qar")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in QAR must be a number greater than 0")
    .toFloat(),

  body("price_bhd")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in BHD must be a number greater than 0")
    .toFloat(),

  body("price_omr")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in OMR must be a number greater than 0")
    .toFloat(),
  body("price_aed")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in AED must be a number greater than 0")
    .toFloat(),
  body("price_usd")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price in USD must be a number greater than 0")
    .toFloat(),

  body("discount")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Discount must be an integer and from 0 to 100")
    .toInt(),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity must be not empty")
    .isInt({ min: 0 })
    .withMessage("Quantity must be an integer and at least 0")
    .toInt(),

  body("weight")
    .optional()
    .isString()
    .withMessage("Weight must be String")
    .isLength({ max: 16 })
    .withMessage("Weight must be at most 16 characters"),

  checkExact(),
];

// export const addProductValidator = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const settings = await Settings.findOne();
//   const enabledCurrencies = settings?.enabledCurrencies || [];

//   // ثابتة – الفيلدات العامة
//   const baseValidations = [
//     body("name_ar")
//       .trim()
//       .notEmpty()
//       .withMessage("Arabic name must be not empty")
//       .isString()
//       .withMessage("Arabic name must be String")
//       .isLength({ max: 32 })
//       .withMessage("Arabic name must be at most 32 characters"),

//     body("name_en")
//       .trim()
//       .notEmpty()
//       .withMessage("English name must be not empty")
//       .isString()
//       .withMessage("English name must be String")
//       .isLength({ max: 32 })
//       .withMessage("English name must be at most 32 characters"),

//     body("description_ar")
//       .trim()
//       .notEmpty()
//       .withMessage("Arabic description must be not empty")
//       .isString()
//       .withMessage("Arabic description must be String")
//       .isLength({ max: 62 })
//       .withMessage("Arabic description must be at most 62 characters"),

//     body("description_en")
//       .trim()
//       .notEmpty()
//       .withMessage("English description must be not empty")
//       .isString()
//       .withMessage("English description must be String")
//       .isLength({ max: 62 })
//       .withMessage("English description must be at most 62 characters"),

//     body("quantity")
//       .notEmpty()
//       .withMessage("Quantity must be not empty")
//       .isInt({ min: 0 })
//       .withMessage("Quantity must be an integer and at least 0")
//       .toInt(),

//     body("discount")
//       .notEmpty()
//       .withMessage("Discount must be not empty")
//       .isInt({ min: 0, max: 100 })
//       .withMessage("Discount must be an integer and from 0 to 100")
//       .toInt(),

//     body("weight")
//       .optional()
//       .isString()
//       .withMessage("Weight must be String")
//       .isLength({ max: 16 })
//       .withMessage("Weight must be at most 16 characters"),
//   ];

//   // ديناميكية – العملات من الإعدادات
//   const priceValidations = [];

//   for (const currency of allCurrencies) {
//     const isEnabled = enabledCurrencies.includes(currency);

//     let validator = body(`price_${currency}`)
//       .optional()
//       .isFloat({ gt: 0 })
//       .withMessage(
//         `Price in ${currency.toUpperCase()} must be a number greater than 0`
//       )
//       .toFloat();

//     if (isEnabled) {
//       validator = body(`price_${currency}`)
//         .notEmpty()
//         .withMessage(`Price in ${currency.toUpperCase()} must be not empty`)
//         .isFloat({ gt: 0 })
//         .withMessage(
//           `Price in ${currency.toUpperCase()} must be a number greater than 0`
//         )
//         .toFloat();
//     }

//     priceValidations.push(validator);
//   }

//   // جمع الكل
//   const validations = [...baseValidations, ...priceValidations];

//   // نفذهم
//   await Promise.all(validations.map((v) => v.run(req)));
//   next();
// };

export const updateImageValidator = [
  body("oldImageKey")
    .optional()
    .isString()
    .withMessage("oldImageKey must be String"),
  body("type")
    .optional()
    .isIn(["thumbnail", "images"])
    .withMessage("Type must be either 'thumbnail' or 'images'"),
];
