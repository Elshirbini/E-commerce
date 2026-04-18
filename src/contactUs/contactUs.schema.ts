import { Schema, model, HydratedDocument, InferSchemaType } from "mongoose";

const contactUs = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: String,
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

type ContactUs = InferSchemaType<typeof contactUs>;

export type ContactUsDocument = HydratedDocument<ContactUs>;

export const ContactUs = model<ContactUs>("contactUs", contactUs);
