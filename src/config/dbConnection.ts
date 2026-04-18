import { connect } from "mongoose";
import { logger } from "./logger";

export const dbConnection = async () => {
  try {
    await connect(process.env.DB_URL!, {
      serverSelectionTimeoutMS: 50000,
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};
