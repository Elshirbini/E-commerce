import jwt from "jsonwebtoken";
import { ApiError } from "./apiError";

export const generateRefreshToken = async (_id: string) => {
  const token = await new Promise((resolve, reject) => {
    jwt.sign(
      { id: _id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "7d",
      },
      (err, token) => {
        if (err) return reject(new ApiError("Error in signing token", 501));
        resolve(token);
      },
    );
  });
  return token;
};

export const generateAccessToken = async (_id: string, role: string) => {
  const token = await new Promise((resolve, reject) => {
    jwt.sign(
      { id: _id, role },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15m",
      },
      (err, token) => {
        if (err) return reject(new ApiError("Error in signing token", 501));
        resolve(token);
      },
    );
  });
  return token;
};
