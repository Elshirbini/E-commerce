import { ShippingTax, ShippingTaxDocument } from "./shippingTax.schema";

export const createShippingTax = async (
  shippingTaxData: Partial<ShippingTaxDocument>,
) => {
  return ShippingTax.create(shippingTaxData);
};

export const findShippingTaxByIdAndUpdate = async (
  id: string,
  shippingTaxData: Partial<ShippingTaxDocument>,
) => {
  return ShippingTax.findByIdAndUpdate(id, shippingTaxData, {
    new: true,
    runValidators: true,
  });
};

export const getCountries = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = ShippingTax.find().sort({ country_en: 1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [countries, totalCount] = await Promise.all([
    query,
    ShippingTax.countDocuments(),
  ]);

  return { countries, totalCount, page };
};

export const findShippingTaxByCountry = async (country: string) => {
  return ShippingTax.findOne({
    $or: [{ country_ar: country }, { country_en: country }],
  });
};

export const findShippingTaxByIdAndDelete = async (id: string) => {
  return ShippingTax.findByIdAndDelete(id);
};
