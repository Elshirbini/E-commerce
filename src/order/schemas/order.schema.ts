import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";
import { Counter } from "./counter.schema";

const cartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const order = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    firstName: String,
    lastName: String,
    phone: String,
    cartItems: { type: [cartItemSchema], default: [] },
    shippingAddress: {
      country: { type: String, required: true },
      governorate: String,
      area: String,
      street: { type: String, required: true },
      buildingNumber: { type: String, required: true },
      notes: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "stripe"],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    orderNumber: { type: Number, unique: true },
  },
  { timestamps: true },
);

type Order = InferSchemaType<typeof order>;

export type OrderDocument = HydratedDocument<Order>;

order.pre<OrderDocument>("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    this.orderNumber = counter.seq;
  }
});

export const Order = model<OrderDocument>("orders", order);
