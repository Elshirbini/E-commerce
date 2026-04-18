import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { NextFunction, Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.util";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  saveUser,
} from "../user/user.repository";

configDotenv();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_CALLBACK_URL_PROD
          : process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      scope: ["email", "profile"],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails?.[0]?.value || !profile.name) {
          return done(new ApiError(req.__("Data is uncompleted"), 400), false);
        }

        let user = await findUserByGoogleId(profile.id);

        if (!user) {
          const existingUser = await findUserByEmail(profile.emails[0].value);

          if (existingUser) {
            // لو فيه يوزر بالإيميل ده، نربط حساب الجوجل بيه
            existingUser.googleId = profile.id;
            user = await saveUser(existingUser);
          } else {
            // مفيش يوزر خالص، نعمل واحد جديد
            user = await createUser({
              googleId: profile.id,
              fullName: `${profile.name.givenName} ${profile.name.familyName ? profile.name.familyName : ""}`,
              email: profile.emails[0].value,
            });
          }
        }

        await saveUser(user);

        const accessToken = await generateAccessToken(
          user._id.toString(),
          user.role,
        );
        const refreshToken = await generateRefreshToken(user._id.toString());

        return done(null, {
          accessToken,
          refreshToken,
          id: user._id.toString(),
          fullName: user.fullName,
          role: user.role,
        });
      } catch (error) {
        logger.error(error);
        return done(error, false);
      }
    },
  ),
);

export const oAuthenticated = passport.authenticate("google", {
  scope: ["email", "profile"],
  prompt: "select_account", // لإعادة طلب الكود عند كل طلب
});

export const oCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      logger.error("Passport Error:", err);
      return res.redirect(
        (process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
          : process.env.GOOGLE_failed_CALLBACK_URL) +
          `?error=${encodeURIComponent(err.message)}`,
      );
    }

    if (!user) {
      return res.redirect(
        (process.env.NODE_ENV === "prod"
          ? process.env.GOOGLE_failed_CALLBACK_URL_PROD
          : process.env.GOOGLE_failed_CALLBACK_URL) +
          `?error=${encodeURIComponent("Authentication Failed")}`,
      );
    }

    req.user = user;
    next();
  })(req, res, next);
};
