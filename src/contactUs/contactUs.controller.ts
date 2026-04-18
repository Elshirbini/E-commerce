import { Request, Response } from "express";
import {
  createComment,
  deleteCommentById,
  getComments,
} from "./contactUs.repository";
import { success } from "../utils/response";

export const addComment = async (req: Request, res: Response) => {
  const { name, email, phone, comment } = req.body;

  await createComment({ name, email, phone, comment });

  return success(res, 201, "Comment added successfully");
};

export const getAllComments = async (req: Request, res: Response) => {
  const { comments, totalCount, page } = await getComments(req.query);
  return success(res, 200, null, comments, { page, totalCount });
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;

  await deleteCommentById(id);

  return success(res, 200, "Comment deleted successfully");
};
