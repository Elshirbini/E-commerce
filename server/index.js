import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { configDotenv } from "dotenv";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/product.js";
import { cartRoutes } from "./routes/cart.js";
import { ApiError } from "./utils/apiError.js";
import { errorHandling } from "./middlewares/errorHandling.js";
import { dbConnection } from "./config/dbConnection.js";
import { couponRoutes } from "./routes/coupon.js";
import { favoritesRoutes } from "./routes/favorites.js";
import { categoryRoutes } from "./routes/category.js";
import { brandRoutes } from "./routes/brand.js";
import { addressesRoutes } from "./routes/addresses.js";
import { orderRoutes } from "./routes/order.js";
import { webhook } from "./controllers/order.js";
configDotenv();
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(compression());
app.post("/webhook", express.raw({ type: "application/json" }), webhook);
app.use(cookieParser());
app.use(express.json());
app.use(xss());
app.use(mongoSanitize());
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

app.use("/api", apiLimiter);
app.use("/api/auth", loginLimiter);

//                         **  ROUTES **

app.get("/", (req, res) => res.send("Hello from docker"));

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/order", orderRoutes);

app.use("/favicon.ico", express.static("./favicon.ico"));

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400));
});

app.use(errorHandling);

app.listen(8080, () => {
  dbConnection();
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
