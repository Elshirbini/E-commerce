import { ApiError } from "../utils/apiError";
import { redisClient } from "../config/redis";
import { generateOTP } from "../utils/generateOTP";
import { hash, compare } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.util";
import { NextFunction, Request, Response } from "express";
import { success } from "../utils/response";
import {
  createUser,
  findUserByEmail,
  findUserByEmailAndUpdate,
  findUserById,
  findUserByIdAndUpdate,
  findValidUser,
} from "../user/user.repository";
import { emailService } from "../email/email.service";

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "prod",
  sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
} as object;
const accessCookieOptions = {
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "prod",
  sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict",
} as object;

export const oAuthCallback = async (req: Request, res: Response) => {
  const accessToken = req.user?.accessToken;
  const refreshToken = req.user?.refreshToken;
  const fullName = req.user?.fullName;
  const id = req.user?.id;
  const role = req.user?.role;

  if (!req.user || !req.user.accessToken || req.query.error) {
    return res.redirect(
      process.env.NODE_ENV === "prod"
        ? process.env.GOOGLE_failed_CALLBACK_URL_PROD!
        : process.env.GOOGLE_failed_CALLBACK_URL +
            `?error=${encodeURIComponent("An error occurred")}`,
    );
  }

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.redirect(
    process.env.NODE_ENV === "prod"
      ? `${process.env.FRONTEND_URL_PROD}/google-confirm?role=${role}&fullName=${fullName}&_id=${id}&success=true`
      : `${process.env.FRONTEND_URL}/google-confirm?role=${role}&fullName=${fullName}&_id=${id}&success=true`,
  );
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const user = await findUserById(userId);
  if (!user) throw new ApiError(req.__("User not found"), 404);

  return success(res, 200, null, user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) throw new ApiError(req.__("User not found"), 404);

  if (!user.password && user.googleId) {
    res.redirect("http://localhost:8080/api/v1/auth/google");
  }

  const isPassEq = await compare(password, user.password!);
  if (!isPassEq) throw new ApiError(req.__("Password Wrong"), 401);

  const accessToken = await generateAccessToken(user._id.toString(), user.role);
  const refreshToken = await generateRefreshToken(user._id.toString());

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.cookie("accessToken", accessToken, accessCookieOptions);

  return success(res, 200, "Login successfully", {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const isExist = await findUserByEmail(email);
  if (isExist) throw new ApiError(req.__("This email is already exist"), 403);

  const otp = generateOTP();

  const userData = { fullName, email, password };

  redisClient.setEx(`${otp}`, 300, JSON.stringify(userData));

  await emailService.sendOTPConfirmationEmail(email, otp);

  return success(res, 200, "OTP sent", null);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { otp } = req.body;

  const userData = await redisClient.get(`${otp}`);
  if (!userData) {
    throw new ApiError(req.__("Invalid or expired verification code"), 403);
  }

  const parsedData = JSON.parse(userData);

  const { email, fullName, password } = parsedData;

  const hashedPassword = await hash(password, 12);

  const createData = {
    fullName,
    email,
    password: hashedPassword,
  };

  await createUser(createData);

  await redisClient.del(`${otp}`);

  return success(res, 201, "Account created successfully");
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const code = crypto.randomBytes(3).toString("hex");
  const cryptOtp = crypto.createHash("sha256").update(code).digest("hex");

  const user = await findUserByEmailAndUpdate(email, {
    codeValidation: cryptOtp,
    codeValidationExpire: new Date(Date.now() + 5 * 60 * 1000),
  });

  if (!user) throw new ApiError(req.__("This email has no account"), 404);

  await emailService.sendResetPasswordEmail(email, code);

  return success(res, 200, "Code sent successfully", { id: user._id });
};

export const verifyCodeForPassword = async (req: Request, res: Response) => {
  const { code } = req.body;
  const { id } = req.params;

  const cryptCode = crypto.createHash("sha256").update(`${code}`).digest("hex");

  const user = await findValidUser(id, cryptCode);

  if (!user) {
    throw new ApiError(req.__("Invalid or expired verification code"), 401);
  }

  return success(res, 200, null, { userId: user._id });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { id } = req.params;

  const userDoc = await findUserById(id);
  if (!userDoc || !userDoc.password)
    throw new ApiError(req.__("User not found"), 404);

  const isSet = await compare(password, userDoc.password);
  if (isSet) {
    throw new ApiError(req.__("This password has already exists"), 403);
  }

  const hashedPassword = await hash(password, 12);

  const user = await findUserByIdAndUpdate(id, {
    password: hashedPassword,
    codeValidation: null,
    codeValidationExpire: null,
  });

  if (!user) {
    throw new ApiError(req.__("Invalid or expired verification code"), 401);
  }

  return success(res, 200, "Your password change successfully");
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken)
    return next(new ApiError(req.__("Invalid refresh token"), 401));

  const payload = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!,
  ) as {
    id: string;
  };

  if (!payload) return next(new ApiError(req.__("Token is not valid"), 401));

  const user = await findUserById(payload.id);
  if (!user) return next(new ApiError(req.__("User not found"), 404));

  const newAccessToken = await generateAccessToken(
    user._id.toString(),
    user.role,
  );

  res.cookie("accessToken", newAccessToken, accessCookieOptions);

  return success(res, 200, "Access token updated");
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  return success(res, 200, "Logged out successfully");
};
