import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  addToFavorites,
  getAllFavorites,
  removeFromFavorites,
} from "./favorites.controller.js";

const router = express.Router();

router.get("/getAllFavorites", verifyToken, getAllFavorites);
router.post("/addToFavorites/:productId", verifyToken, addToFavorites);
router.delete(
  "/removeFromFavorites/:productId",
  verifyToken,
  removeFromFavorites
);

export const favoritesRoutes = router;
