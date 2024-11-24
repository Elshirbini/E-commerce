import { Schema, model } from "mongoose";

const brand = new Schema({
  name: {
    type: String,
    required: true,
    unique: [true, "Brand name must be unique"],
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Brand = model("brands", brand);
