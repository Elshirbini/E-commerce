import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";

export const sanitizeBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    }
  }
  next();
};
