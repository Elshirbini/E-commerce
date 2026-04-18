import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  UpdateQuery,
  model,
} from "mongoose";

const product = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    price: {
      kwd: { type: Number, required: false },
      sar: { type: Number, required: false },
      qar: { type: Number, required: false },
      bhd: { type: Number, required: false },
      aed: { type: Number, required: false },
      omr: { type: Number, required: false },
    },
    discount: { type: Number, min: 0, max: 100 },
    finalPrice: {
      kwd: { type: Number },
      sar: { type: Number },
      qar: { type: Number },
      bhd: { type: Number },
      aed: { type: Number },
      omr: { type: Number },
    },
    quantity: { type: Number, required: true, min: 0 },
    weight: { type: String, required: false },
    thumbnail: {
      imageKey: { type: String, required: false },
      imageUrl: { type: String, required: false },
    },
    images: [
      {
        imageKey: { type: String, required: true },
        imageUrl: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

product.pre("save", async function () {
  const discount = this.discount || 0;
  const finalPrice: any = {};

  if (this.price) {
    for (const [currency, value] of Object.entries(this.price)) {
      if (typeof value === "number") {
        const discounted = value - (value * discount) / 100;
        finalPrice[currency] = roundTo2(discounted);
      }
    }
  }

  this.finalPrice = finalPrice;
});

product.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as UpdateQuery<any> | null;
  if (!update) return;

  if (update?.price || update?.discount !== undefined) {
    const discount = update?.discount ?? 0;
    const finalPrice: any = {};

    for (const [currency, value] of Object.entries(update?.price || {})) {
      if (typeof value === "number" && !isNaN(value)) {
        const discounted = value - (value * discount) / 100;
        finalPrice[currency] = roundTo2(discounted);
      }
    }

    this.set({ finalPrice });
  }
});

type Product = InferSchemaType<typeof product>;
export type ProductDocument = HydratedDocument<Product>;

export const Product = model<ProductDocument>("products", product);
