import { body } from "express-validator";
import { allCurrencies } from "../utils/allCurrencies";

export const settingsValidation = [
  body("enabledCurrencies")
    .notEmpty()
    .withMessage("Enabled currencies must be not empty")
    .isArray()
    .withMessage("Enabled currencies must be an array")
    .custom((currencies) => {
      const invalid = currencies.filter(
        (c: string) => !allCurrencies.includes(c),
      );
      if (invalid.length > 0) {
        throw new Error(
          `Invalid currencies: ${invalid.join(", ")}. Allowed currencies are ${allCurrencies.join(", ")}`,
        );
      }
      return true;
    }),
];
