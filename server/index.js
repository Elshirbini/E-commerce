import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { authRoutes } from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { productRoutes } from "./routes/product.js";
import { cartRoutes } from "./routes/cart.js";
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

app.listen(8080, () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("connected");
    })
    .catch((err) => console.log(err));
});
