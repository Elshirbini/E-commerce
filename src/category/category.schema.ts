import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    thumbnail: {
      imageKey: { type: String, required: false },
      imageUrl: { type: String, required: false },
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

type Category = InferSchemaType<typeof categorySchema>;
export type CategoryDocument = HydratedDocument<Category>;

export const Category = model<CategoryDocument>("categories", categorySchema);
