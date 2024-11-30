import { model, Schema } from "mongoose";
import { ApiError } from "../utils/apiError.js";

const user = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
    },
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
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
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
    addresses: [
      {
        id: { type: Schema.Types.ObjectId },
        city: String,
        details: String,
        phone: String,
        postalCode: String,
      },
    ],
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

user.pre("save", function (next) {
  if (!this.googleId && !this.password) {
    return next(new ApiError("Please provide password", 401));
  }
  next();
});

export const User = model("users", user);
