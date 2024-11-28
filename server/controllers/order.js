import asyncHandler from "express-async-handler";
import { Cart } from "../models/cart.js";
import { Coupon } from "../models/coupon.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/apiError.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getOrder = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const order = await Order.find({ userId: user._id });
  if (!order) throw new ApiError("User or order not found.", 404);

  res.status(200).json({ order });
});

export const getAllOrders = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  if (!user) throw new ApiError("User not found", 404);

  const orders = await Order.find();

  res.status(200).json({ orders });
});

export const createCashOrder = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { couponCode, shippingAddress } = req.body;
  let totalPrice;

  if (!user) throw new ApiError("User not found", 404);

  const cart = await Cart.findOne({ userId: user._id });
  if (!cart) throw new ApiError("Cart not found.", 404);

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode,
      expires: { $gt: Date.now() },
    });

    if (!coupon) {
      throw new ApiError("Coupon is not valid or has expired", 404);
    }

    totalPrice = (coupon.discount / 100) * cart.totalCost;
  } else {
    totalPrice = cart.totalCost;
  }

  const order = await Order.create({
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
});

export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { user } = req.user;

  if (!user) throw new ApiError("User not found", 404);

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      isPaid: true,
      paidAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) throw new ApiError("Order not found", 404);

  res.status(200).json({ updatedOrder });
});

export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { user } = req.user;

  if (!user) throw new ApiError("User not found", 404);

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      isDelivered: true,
      deliveredAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) throw new ApiError("Order not found", 404);

  res.status(200).json({ updatedOrder });
});

export const checkoutSession = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { couponCode, shippingAddress } = req.body;
  let totalPrice;
  if (!user) throw new ApiError("User not found", 404);

  const cart = await Cart.findOne({ userId: user._id });
  if (!cart) throw new ApiError("Cart not found", 404);

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode,
      expires: { $gt: Date.now() },
    });

    if (!coupon) throw new ApiError("Coupon not found", 404);

    totalPrice = (coupon.discount / 100) * cart.totalCost;
  } else {
    totalPrice = cart.totalCost;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalPrice * 100,
          product_data: {
            name: `${user.firstName} ${user.lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/cart`,
    customer_email: user.email,
    client_reference_id: cart._id.toString(),
    metadata: shippingAddress,
  });

  if (!session) {
    throw new ApiError("Error occurred when sending your data", 400);
  }

  res.status(201).json({ message: "session Created successfully", session });
});

const createCardOrder = asyncHandler(async (session) => {
  const cartId = session.client_reference_id;
  const email = session.customer_email;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError("User not found", 404);

  const cart = await Cart.findById(cartId);
  if (!cart) throw new ApiError("cart not found", 404);

  const order = await Order.create({
    cartItems: cart.items,
    shippingAddress,
    totalPrice: orderPrice,
    paymentMethod: "card",
    isPaid: true,
    paidAt: Date.now(),
    userId: user._id,
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

    await Cart.findByIdAndDelete(cartId);
  }
});

export const webhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.WEBHOOK_SECRET_KEY;

  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

  if (event.type === "checkout.session.completed") {
    // Create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ message: "Success" });
});
