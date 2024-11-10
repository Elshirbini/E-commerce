import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cart = new Schema(
  {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalCost: {
      type: Number,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("carts", cart);
