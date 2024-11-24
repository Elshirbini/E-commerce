import { model, Schema } from "mongoose";

const product = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [Object],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "brands",
    },
    sizes: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL", "XXXL"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const Product = model("products", product);
