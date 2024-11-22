import { connect } from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

export const dbConnection = () => {
  connect(process.env.DB_URL).then(() => {
    console.log("connected");
  });
};
