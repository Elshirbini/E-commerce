import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
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
configDotenv();
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

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
