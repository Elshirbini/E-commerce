import { Coupon, CouponDocument } from "./coupon.schema";

export const getCoupons = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Coupon.find().sort({ createdAt: -1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [coupons, totalCount] = await Promise.all([
    query,
    Coupon.countDocuments(),
  ]);

  return { coupons, totalCount, page };
};

export const addCoupon = async (couponData: Partial<CouponDocument>) => {
  return Coupon.create(couponData);
};

export const findCouponByIdAndUpdate = async (
  id: string,
  couponData: Partial<CouponDocument>,
) => {
  return Coupon.findByIdAndUpdate(id, couponData, {
    new: true,
    runValidators: true,
  });
};

export const findCouponByIdAndDelete = async (id: string) => {
  return Coupon.findByIdAndDelete(id);
};

export const findCouponByCode = async (code: string) => {
  return Coupon.findOne({ code, expires: { $gt: Date.now() } });
};
