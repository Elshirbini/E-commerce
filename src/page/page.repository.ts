import { Page, PageDocument } from "./page.schema";

export const createPage = async (pageData: Partial<PageDocument>) => {
  return Page.create(pageData);
};

export const findPageByPage = async (page: string) => {
  return Page.findOne({ page });
};

export const getAllPages = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Page.find().sort({ page: 1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [pages, totalCount] = await Promise.all([query, Page.countDocuments()]);

  return { pages, totalCount, page };
};

export const savePage = async (page: PageDocument) => {
  return page.save();
};

export const findPageAndDelete = async (page: string) => {
  return Page.findOneAndDelete({ page });
};
