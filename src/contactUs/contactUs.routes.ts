import express from "express";
import { isAdmin } from "../middlewares/isAdmin";
import { verifyToken } from "../middlewares/verifyToken";
import {
  addComment,
  deleteComment,
  getAllComments,
} from "./contactUs.controller";
import { addCommentValidation } from "./contactUs.validator";
import { validateInputs } from "../middlewares/validateInputs";
const router = express.Router();

router.post("/", addCommentValidation, validateInputs, addComment);

router.get("/", verifyToken, isAdmin, getAllComments);

router.delete("/:id", verifyToken, isAdmin, deleteComment);

export const contactUsRoutes = router;
