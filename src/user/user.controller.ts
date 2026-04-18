import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { findUserByIdAndUpdate } from "./user.repository";

export const updateUser = async (req: Request, res: Response) => {
  const { fullName, phone } = req.body;
  const { id } = req.params;

  const user = await findUserByIdAndUpdate(id, {
    fullName,
    phone,
  });

  if (!user) throw new ApiError(req.__("User not found"), 404);

  return success(res, 200, null, user);
};
