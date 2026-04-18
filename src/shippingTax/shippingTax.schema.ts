import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

const shippingTax = new Schema({
  country_en: {
    type: String,
    required: true,
  },
  country_ar: {
    type: String,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
});

type ShippingTax = InferSchemaType<typeof shippingTax>;
export type ShippingTaxDocument = HydratedDocument<ShippingTax>;

export const ShippingTax = model<ShippingTaxDocument>(
  "shippingTax",
  shippingTax,
);
