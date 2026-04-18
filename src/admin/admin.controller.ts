import { Request, Response } from "express";
import { success } from "../utils/response";
import {
  createUser,
  findUserByEmail,
  findUserByIdAndUpdate,
  getUsers,
} from "../user/user.repository";
import { ApiError } from "../utils/apiError";
import { hash } from "bcrypt";

export const addAdmin = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const isExist = await findUserByEmail(email);
  if (isExist) throw new ApiError(req.__("This email is already exist"), 403);

  const hashedPassword = await hash(password, 12);

  const createData = {
    fullName,
    email,
    password: hashedPassword,
    role: "admin" as "user" | "admin",
  };

  await createUser(createData);

  return success(res, 201, "Admin created successfully");
};

export const getAllUsers = async (req: Request, res: Response) => {
  const { users, totalCount, page } = await getUsers(req.userId!, req.query);
  return success(res, 200, null, users, { page, totalCount });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await findUserByIdAndUpdate(id, {
    role: role as "user" | "admin",
  });

  if (!user) {
    throw new ApiError(req.__("User not found"), 404);
  }

  return success(res, 200, "User role updated successfully");
};
