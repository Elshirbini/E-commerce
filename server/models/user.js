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
      type: Object,
      default: null,
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
