import { Coupon } from "../models/coupon.js";
import { ApiError } from "../utils/apiError.js";
import couponCode from "coupon-code";
import { hash } from "bcrypt";

export const createCoupon = async (req, res, next) => {
  try {
    const { discount, expires } = req.body;

    const date = Date.now();

    if (discount > 100 || new Date(expires).getTime() <= date) {
      return next(
        new ApiError("discount and expire date should be valid", 400)
      );
    }
    const code = couponCode.generate({ parts: 2, partLen: 4 });
    const hashedCode = await hash(code, 12);

    const coupon = await Coupon.create({
      code: hashedCode,
      discount,
      expires,
    });

    res.status(200).json({
      coupon: {
        code,
        discount,
        expires,
      },
    });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
