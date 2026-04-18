import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { isAdmin } from "../middlewares/isAdmin";
import { addCountryValidation } from "./shippingTax.validator";
import { validateInputs } from "../middlewares/validateInputs";
import {
  addCountry,
  deleteCountry,
  editCountry,
  getAllCountries,
} from "./shippingTax.controller";

const router = express.Router();

router.get("/", getAllCountries);

router.use(verifyToken, isAdmin);

router.post("/", addCountryValidation, validateInputs, addCountry);

router
  .route("/:id")
  .patch(addCountryValidation, validateInputs, editCountry)
  .delete(deleteCountry);

export const shippingTaxRoutes = router;
