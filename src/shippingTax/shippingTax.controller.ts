import { Request, Response } from "express";
import {
  createShippingTax,
  findShippingTaxByIdAndDelete,
  findShippingTaxByIdAndUpdate,
  getCountries,
} from "./shippingTax.repository";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";

export const addCountry = async (req: Request, res: Response) => {
  const shippingTaxData = req.body;

  await createShippingTax(shippingTaxData);

  return success(res, 201, "Shipping tax added successfully");
};

export const editCountry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const shippingTaxData = req.body;

  const shippingTax = await findShippingTaxByIdAndUpdate(id, shippingTaxData);
  if (!shippingTax) {
    throw new ApiError(req.__("Shipping tax not found"), 404);
  }

  return success(res, 200, "Shipping tax updated successfully");
};

export const getAllCountries = async (req: Request, res: Response) => {
  const { countries, totalCount, page } = await getCountries(req.query);

  return success(res, 200, null, countries, { page, totalCount });
};

export const deleteCountry = async (req: Request, res: Response) => {
  const { id } = req.params;

  const shippingTax = await findShippingTaxByIdAndDelete(id);
  if (!shippingTax) {
    throw new ApiError(req.__("Shipping tax not found"), 404);
  }

  return success(res, 200, "Shipping tax deleted successfully");
};
