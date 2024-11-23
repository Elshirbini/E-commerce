import { model, Schema } from "mongoose";

const user = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
    color: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "carts",
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "products",
      },
    ],
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User = model("users", user);
