import mongoose from "mongoose";

const Schema = mongoose.Schema;

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
      type: String,
      enum: ["Hoodie", "Pantaloon", "Jacket", "T-shirt"],
    },
    brand: {
      type: String,
      enum: [
        "Defacto",
        "H&M",
        "Nike",
        "Gucci",
        "Crocs",
        "Tommy Hilfiger",
        "Versace",
        "Adidas",
      ],
      default: "Unknown brand",
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

export const Product = mongoose.model("products", product);
