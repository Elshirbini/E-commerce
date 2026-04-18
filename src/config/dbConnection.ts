import { connect } from "mongoose";
import { logger } from "./logger";

class Database {
  private static instance: Database;

  private constructor() {
    this.connect();
  }

  private async connect() {
    try {
      logger.info(`Connecting to MongoDB: ${process.env.DB_URL}`);
      await connect(process.env.DB_URL!, {
        serverSelectionTimeoutMS: 50000,
      });
      logger.info("Connected to MongoDB");
    } catch (error) {
      logger.error(`Error connecting to MongoDB: ${error}`);
      throw error;
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

export const db = Database.getInstance();
