import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";

export const errorHandling = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "dev") {
    sendErrForDev(err, res);
  } else {
    sendErrForProd(err, res);
  }
};

const sendErrForDev = (err: ApiError, res: Response) => {
  return res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrForProd = (err: ApiError, res: Response) => {
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
