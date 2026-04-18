import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const user = new Schema(
  {
    googleId: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    codeValidation: String,
    codeValidationExpire: Date,
  },
  { timestamps: true },
);

user.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } },
);

type User = InferSchemaType<typeof user>;

export type UserDocument = HydratedDocument<User>;

export const User = model("users", user);
