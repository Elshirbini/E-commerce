import mongoose from "mongoose";
const Schema = mongoose.Schema;

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

export const User = mongoose.model("users", user);
