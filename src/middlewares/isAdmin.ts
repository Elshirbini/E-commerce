import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userRole = req.userRole;

  if (userRole !== "admin") {
    throw new ApiError(
      req.__("You don't have the permissions to do this action"),
      403,
    );
  }
  next();
};
