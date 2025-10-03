import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { configDotenv } from "dotenv";
import { authRoutes } from "./auth/auth.routes.js";
import { productRoutes } from "./product/product.routes.js";
import { cartRoutes } from "./cart/cart.routes.js";
import { errorHandling } from "./middlewares/errorHandling.js";
import { dbConnection } from "./config/dbConnection.js";
import { couponRoutes } from "./coupon/coupon.routes.js";
import { favoritesRoutes } from "./favorites/favorites.routes.js";
import { categoryRoutes } from "./category/category.routes.js";
import { brandRoutes } from "./brand/brand.routes.js";
import { addressesRoutes } from "./addresses/addresses.routes.js";
import { orderRoutes } from "./order/order.routes.js";
import { webhook } from "./order/order.controller.js";
configDotenv();
const app = express();

const apiLimiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again after 15 minutes!",
});

const loginLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes!",
});
//                                 **Middlewares**

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.post("/webhook", express.raw({ type: "application/json" }), webhook);
app.use(cookieParser());
app.use(express.json());
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
app.use("/api/auth", loginLimiter);
app.use("/api", apiLimiter);

//                         **  ROUTES **

app.get("/", (req, res) =>
  res.send("<a href='/api/auth/google'>Authenticate with google </a>")
);

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/order", orderRoutes);

//                                 **Global error handler**

app.use(errorHandling);

app.listen(8080, () => {
  dbConnection();
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
