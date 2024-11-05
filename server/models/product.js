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
    image: {
      type: String,
    },
    category : {
        type : String,
        enum : ["Hoodie" , "Pantaloon" , "Jacket" , "T-shirt"]
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("products" , product)