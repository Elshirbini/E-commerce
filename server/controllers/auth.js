import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { User } from "../models/user.js";
import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

const maxAge = 1 * 24 * 60 * 60 * 1000;
// Days * hours per day * minutes per hour * seconds per minute * milliseconds per second

const cookieOptions = {
  maxAge,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmedalshirbini33@gmail.com",
    pass: "rvgedkbbviilneor",
  },
});

export const getUserInfo = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const userDoc = await User.findById(user._id);

  if (!userDoc) throw new ApiError("User not found", 404);

  res.status(200).json({ userDoc });
});

export const oAuthCallback = asyncHandler(async (req, res, next) => {
  const { token } = req.user;

  res.cookie("jwt", token, cookieOptions);
  res.status(200).redirect("/");
});

export const signup = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (password !== confirmPassword) {
    throw new ApiError("Password and confirm password should be equal.", 401);
  }

  if (!errors.isEmpty()) throw new ApiError(errors.array()[0].msg, 400);

  const mailOptions = {
    from: "ahmedalshirbini33@gmail.com",
    to: email,
    subject: "Welcome for you in my E-commerce App",
    text: " Your account Created Successfully",
  };
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });

  res.cookie("jwt", token, cookieOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  return res.status(200).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { emailOrUserName, password } = req.body;
  if (!emailOrUserName.trim() || !password.trim()) {
    throw new ApiError("Email and Password mustn't be empty", 404);
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
  });

  if (!user) throw new ApiError("User not found", 404);

  const hashedPassword = user.password;
  const isPasswordTrue = bcrypt.compare(password, hashedPassword);

  if (!isPasswordTrue) throw new ApiError("Wrong password", 401);

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });

  res.cookie("jwt", accessToken, cookieOptions);

  res.status(200).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
  res.status(200).send("Logout successfully");
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { password } = req.body;

  const userDoc = await User.findById(user._id);

  if (!userDoc) throw new ApiError("User not found", 404);

  const isPasswordTrue = await bcrypt.compare(password, userDoc.password);

  if (!isPasswordTrue) throw new ApiError("Wrong password", 401);

  await User.deleteOne({ _id: userDoc._id });

  res.status(200).send("Account deleted successfully");
});

export const addImage = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const image = req.file.path;

  const result = await cloudinary.uploader.upload(image, {
    folder: "Users",
  });

  const userDoc = await User.findByIdAndUpdate(
    user._id,
    {
      image: { public_id: result.public_id, url: result.url },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!userDoc) throw new ApiError("User not found", 404);

  res.status(200).json({
    message: "Image added successfully",
    image: result,
  });
});

export const deleteImage = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const userDoc = await User.findById(user._id);

  if (!userDoc) throw new ApiError("User not found", 404);

  await cloudinary.uploader.destroy(userDoc.image.public_id);
  userDoc.image = null;
  await userDoc.save();

  return res.status(200).json({ message: "Image deleted successfully" });
});

export const sendTokenToEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) throw new ApiError("Email has no account", 404);

  const resetToken = crypto.randomBytes(3).toString("hex");
  const hashResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await User.findByIdAndUpdate(
    user._id,
    {
      passwordResetToken: hashResetToken,
      passwordResetTokenExpire: Date.now() + 5 * 60 * 1000,
    },
    { new: true, runValidators: true }
  );

  const mailOptions = {
    from: "ahmedalshirbini33@gmail.com",
    to: email,
    subject: "Reset Your Password",
    text: `Paste Your Verification code ${resetToken} \n\nThis Verification code will be valid for 5 min`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpire = undefined;
      user.save();
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.status(200).json({
    message: "Verification code sent successfully",
    userId: user._id,
  });
});

export const validateTokenSent = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const { userId } = req.params;

  const token = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    _id: userId,
    passwordResetToken: token,
    passwordResetTokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError("The Verification code is wrong or expired", 401);
  }

  res.status(200).json({ message: "success", userId: user._id });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { userId } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400);
  }

  if (password !== confirmPassword) {
    throw new ApiError("Password and confirmPassword must be equal", 401);
  }

  const userDoc = await User.findById(userId);

  const isEqual = await bcrypt.compare(password, userDoc.password);
  if (isEqual) throw new ApiError("This password has already set", 404);

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetTokenExpire: undefined,
    },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError("User not found", 404);

  res.status(200).json({ message: "Password changed successfully" });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, userName, color } = req.body;
  const { user } = req.user;

  if (!firstName && !lastName && !userName && !color) {
    throw new ApiError("No changes", 400);
  }

  const userDoc = await User.findByIdAndUpdate(
    user._id,
    {
      firstName,
      lastName,
      userName,
      color,
    },
    { new: true, runValidators: true }
  );

  if (!userDoc) throw new ApiError("User not found", 404);

  res
    .status(200)
    .json({ message: "Profile updated successfully", user: userDoc });
});
