import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { ApiError } from "../utils/apiError";

const sectionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    title_ar: String,
    title_en: String,
    description_en: String,
    description_ar: String,
    link: String,
    images: [
      {
        imageKey: String,
        imageUrl: String,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const pageSchema = new Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
    },
    sections: [sectionSchema],
  },
  { timestamps: true },
);

type Page = InferSchemaType<typeof pageSchema>;
export type PageDocument = HydratedDocument<Page>;

export const Page = model("pages", pageSchema);
