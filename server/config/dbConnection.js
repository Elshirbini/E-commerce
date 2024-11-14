import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

export const dbConnection = () => {
  mongoose.connect(process.env.DB_URL).then(() => {
    console.log("connected");
  });
};
