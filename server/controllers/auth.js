import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { User } from "../models/user.js";
import { cloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";

const maxAge = 1 * 24 * 60 * 60 * 1000;
// Days * hours per day * minutes per hour * seconds per minute * milliseconds per second

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmedalshirbini33@gmail.com",
    pass: "rvgedkbbviilneor",
  },
});

export const getUserInfo = async (req, res, next) => {
  try {
    const { user } = req.user;
    const userId = user._id;
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userDoc });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);
    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ error: "Password and confirm password should be equal." });
    }
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
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
    await user.save();

    const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: maxAge,
    });

    res.cookie("jwt", token, {
      maxAge,
      secure: true,
      sameSite: "None",
    });

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) {
      return res
        .status(404)
        .json({ error: "Email and Password mustn't be empty" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const hashedPassword = user.password;
    const isPasswordTrue = bcrypt.compare(password, hashedPassword);
    if (!isPasswordTrue) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: maxAge,
    });

    res.cookie("jwt", accessToken, { maxAge, secure: true, sameSite: "None" });

    res.status(200).json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    res.status(200).send("Logout successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { user } = req.user;
    const { password } = req.body;

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordTrue = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordTrue) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    await User.deleteOne({ _id: userDoc._id });

    res.status(200).send("Account deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addImage = async (req, res, next) => {
  try {
    const { user } = req.user;
    const image = req.file.path;

    const result = await cloudinary.uploader.upload(image, {
      folder: "Users",
    });

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    userDoc.image = { public_id: result.public_id, url: result.url };
    await userDoc.save();

    res.status(200).json({
      message: "Image added successfully",
      image: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { user } = req.user;
    const userDoc = await User.findById(user._id);

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }
    await cloudinary.uploader.destroy(userDoc.image.public_id);
    userDoc.image = null;
    await userDoc.save();

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendTokenToEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "Email has no account" });
    }

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateTokenSent = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { userId } = req.params;

    const token = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      _id: userId,
      passwordResetToken: token,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: "The Verification code is wrong or expired" });
    }

    res.status(200).json({ message: "success", userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and confirmPassword must be equal" });
    }

    const userDoc = await User.findById(userId);

    const isEqual = await bcrypt.compare(password, userDoc.password);
    if (isEqual) {
      return res.status(400).json({ error: "This password has already set" });
    }

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

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, color } = req.body;
    const { user } = req.user;

    if(!firstName && !lastName && !userName && !color){
      return res.status(404).json({error : "No changes"})
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

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: userDoc });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
