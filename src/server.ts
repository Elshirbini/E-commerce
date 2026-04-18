import app from "./app";
import { configDotenv } from "dotenv";
import { logger } from "./config/logger";
import { dbConnection } from "./config/dbConnection";
configDotenv();

app.listen(8080, "0.0.0.0", () => {
  dbConnection();
  logger.info(`🚀 Server running on PORT:${process.env.PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
