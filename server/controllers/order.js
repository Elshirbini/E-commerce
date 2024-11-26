import { Cart } from "../models/cart.js";
import { Coupon } from "../models/coupon.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { ApiError } from "../utils/apiError.js";

export const getOrder = async (req, res, next) => {
  try {
    const { user } = req.user;

    const order = await Order.find({ userId: user._id });
    if (!order) return next(new ApiError("User or order not found.", 404));

    res.status(200).json({ order });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { user } = req.user;
    if (!user) return next(new ApiError("User not found", 404));

    const orders = await Order.find();

    res.status(200).json({ orders });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const createCashOrder = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { couponCode, shippingAddress, paymentMethod } = req.body;
    let totalPrice;

    if (!user) return next(new ApiError("User not found", 404));

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return next(new ApiError("Cart not found.", 404));

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        expires: { $gt: Date.now() },
      });

      if (!coupon) {
        return next(new ApiError("Coupon is not valid or has expired", 404));
      }

      totalPrice = (coupon.discount / 100) * cart.totalCost;
    } else {
      totalPrice = cart.totalCost;
    }

    const order = await Order.create({
      paymentMethod,
      shippingAddress,
      userId: user._id,
      cartItems: cart.items,
      totalPrice,
    });

    if (order) {
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { quantity: -item.quantity, sold: item.quantity },
          },
          { new: true, runValidators: true }
        );
      }
      await Cart.findOneAndDelete({ userId: user._id });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const updateOrderToPaid = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { user } = req.user;

    if (!user) return next(new ApiError("User not found", 404));

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: true,
        paidAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) return next(new ApiError("Order not found", 404));

    res.status(200).json({ updatedOrder });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};

export const updateOrderToDelivered = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { user } = req.user;

    if (!user) return next(new ApiError("User not found", 404));

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        isDelivered: true,
        deliveredAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) return next(new ApiError("Order not found", 404));

    res.status(200).json({ updatedOrder });
  } catch (error) {
    next(new ApiError(error, 500));
  }
};
