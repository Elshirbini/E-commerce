import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";

export const validateInputs = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(req.__(errors.array()[0].msg), 400);
  }

  next();
};
