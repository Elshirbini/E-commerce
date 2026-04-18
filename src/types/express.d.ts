import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: string;
    user?: {
      accessToken?: string;
      refreshToken?: string;
      fullName?: string;
      id?: string;
      role?: string;
    };
  }
}
