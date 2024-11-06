import express from "express";
import { body } from "express-validator";
import { User } from "../models/user.js";
import { upload } from "../utils/multer.js";
import {
  login,
  logout,
  signup,
  getUserInfo,
  deleteAccount,
  addImage,
  deleteImage,
  sendTokenToEmail,
  validateTokenSent,
  resetPassword,
  updateProfile,
} from "../controllers/auth.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.get("/get-user-info", verifyToken, getUserInfo);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please write a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email has already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password should be contains from 8 to 16 chars")
      .matches(/[A-Z]/)
      .withMessage("Password must be contain chars from A to Z")
      .matches(/[a-z]/)
      .withMessage("Password must be contain chars from a to z")
      .matches(/[0-9]/)
      .withMessage("Password must be contains numbers")
      .matches(/[!@#$%^&*(){}<>?~]/)
      .withMessage("Password must be special chars"),
  ],
  signup
);

router.post("/login", login);
router.delete("/delete-account", verifyToken, deleteAccount);
router.post("/add-image", verifyToken, upload.single("image"), addImage);
router.delete("/delete-image", verifyToken, deleteImage);
router.post("/send-token-to-email", sendTokenToEmail);
router.post("/validate-code-sent/:userId", validateTokenSent);
router.patch(
  "/reset-password/:userId",
  [
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password should be contains from 8 to 16 chars")
      .matches(/[A-Z]/)
      .withMessage("Password must be contain chars from A to Z")
      .matches(/[a-z]/)
      .withMessage("Password must be contain chars from a to z")
      .matches(/[0-9]/)
      .withMessage("Password must be contains numbers")
      .matches(/[!@#$%^&*(){}<>?~]/)
      .withMessage("Password must be special chars"),
  ],
  resetPassword
);
router.put("/update-profile", verifyToken, updateProfile);
router.post("/logout", logout);
export const authRoutes = router;
