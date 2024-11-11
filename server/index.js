import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { authRoutes } from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { productRoutes } from "./routes/product.js";
import { cartRoutes } from "./routes/cart.js";
import { ApiError } from "./utils/apiError.js";
import { errorHandling } from "./middlewares/errorHandling.js";
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

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400));
});

app.use(errorHandling);

app.listen(8080, () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("connected");
    })
    .catch((err) => console.log(err));
});
