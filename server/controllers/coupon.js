import { ApiError } from "../utils/apiError.js"

export const createCoupon = (req,res,next) => {
    try {
        const {code , discount , expires} = req.body
    } catch (error) {
        next(new ApiError(error , 500))
    }
}