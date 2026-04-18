import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const httpLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const duration = Date.now() - start;

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
    logger.http(logMessage);
  });

  next();
};
