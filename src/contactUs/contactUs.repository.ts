import { ContactUs, ContactUsDocument } from "./contactUs.schema";

export const createComment = async (
  commentData: Partial<ContactUsDocument>,
) => {
  return ContactUs.create(commentData);
};

export const getComments = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = ContactUs.find().sort({ createdAt: -1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [comments, totalCount] = await Promise.all([
    query,
    ContactUs.countDocuments(),
  ]);

  return { comments, totalCount, page };
};

export const deleteCommentById = async (id: string) => {
  return ContactUs.findByIdAndDelete(id);
};
