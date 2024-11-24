import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  addAddress,
  getAddresses,
  removeAddress,
  updateAddress,
} from "../controllers/addresses.js";
const router = express.Router();

router.get("/get-addresses", verifyToken, getAddresses);
router.put("/add-address", verifyToken, addAddress);
router.patch("/update-address/:addressId", verifyToken, updateAddress);
router.delete("/remove-address/:addressId", verifyToken, removeAddress);

export const addressesRoutes = router;
