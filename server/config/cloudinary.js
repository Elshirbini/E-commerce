import { v2 as Cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
configDotenv();
Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinary = Cloudinary;
