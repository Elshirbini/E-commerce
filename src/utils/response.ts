import { Response } from "express";

export const success = (
  res: Response,
  statusCode: number,
  message: string | null = "",
  data: any | null = {},
  meta?: any,
) => {
  const payload: any = { success: true, message: message, data: data };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};
