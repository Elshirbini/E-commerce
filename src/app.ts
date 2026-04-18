import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import { errorHandling } from "./middlewares/errorHandling";
import { httpLoggerMiddleware } from "./middlewares/httpLogger";
import path from "path";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./user/user.routes";
import i18n from "./config/i18n";
import { sanitizeBody } from "./middlewares/sanitizeBody";
import { categoryRoutes } from "./category/category.routes";
import { productRoutes } from "./product/product.routes";
import { settingsRoutes } from "./settings/settings.routes";
import { cartRoutes } from "./cart/cart.routes";
import { contactUsRoutes } from "./contactUs/contactUs.routes";
import { orderRoutes } from "./order/order.routes";
import { adminRoutes } from "./admin/admin.routes";
import { couponRoutes } from "./coupon/coupon.routes";
import { shippingTaxRoutes } from "./shippingTax/shippingTax.routes";
import { pageRoutes } from "./page/page.routes";
import "./cron/deleteUnconfirmedOrders";

configDotenv();

const app = express();

//                        **Middlewares**

app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLoggerMiddleware);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(sanitizeBody);
app.use(httpLoggerMiddleware);
app.use(compression());
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }),
);
app.use(i18n.init);

//                                 **ROUTES**

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/contact-us", contactUsRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/shipping-tax", shippingTaxRoutes);
app.use("/api/v1/pages", pageRoutes);

// app.use(express.static(path.join(__dirname, "dist")));

// // Fallback to index.html for other routes (for React Router)

// app.use((req, res, next) => {
//   if (req.path.startsWith("/api")) {
//     return res.status(404).json({ message: "API route not found" });
//   }
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
//                                 **Global Error Handler**

app.use(errorHandling);

export default app;
