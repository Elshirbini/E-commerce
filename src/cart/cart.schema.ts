import { Schema, model, Types, HydratedDocument, UpdateQuery } from "mongoose";
import { logger } from "../config/logger";

export interface CartItem {
  productId: Types.ObjectId | string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart extends Document {
  userId: Types.ObjectId | string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CartDocument = HydratedDocument<Cart>;

const cartItemSchema = new Schema<CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const cartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "KWD",
    },
  },
  { timestamps: true },
);

cartSchema.pre("save", async function () {
  this.subtotal = this.items.reduce((acc, item) => acc + item.totalPrice, 0);
});

cartSchema.post(
  ["findOneAndUpdate", "updateOne"],
  async function (result, next) {
    try {
      const update = this.getUpdate() as UpdateQuery<any>;

      // لو الـ update أصلاً خاص بالـ subtotal، متعملش حاجة
      if (update?.$set?.subtotal !== undefined) {
        return next();
      }

      const updatedCart = await this.model.findOne(this.getQuery());
      if (!updatedCart || !updatedCart.items) return next();

      const subtotal = updatedCart.items.reduce(
        (acc: number, item: any) => acc + item.totalPrice,
        0,
      );

      // نحدث subtotal بدون ما نشغل الهـوك تاني
      await this.model.updateOne(
        { _id: updatedCart._id },
        { $set: { subtotal } },
        { runValidators: false },
      );

      next();
    } catch (err) {
      logger.error("Error updating subtotal:", err);
      next(err as any);
    }
  },
);

export const Cart = model<CartDocument>("Cart", cartSchema);
