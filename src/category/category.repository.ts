import { Category, CategoryDocument } from "./category.schema";

export const createCategory = async (
  categoryData: Partial<CategoryDocument>,
) => {
  return Category.create(categoryData);
};

export const findCategoryById = async (id: string) => {
  return Category.findById(id);
};

export const getAllCategories = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Category.find().sort({ createdAt: -1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [categories, totalCount] = await Promise.all([
    query,
    Category.countDocuments(),
  ]);

  return { categories, totalCount, page };
};

export const getAllSpecialCategories = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Category.find({ isSpecial: true }).sort({ createdAt: -1 });
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [categories, totalCount] = await Promise.all([
    query,
    Category.countDocuments({ isSpecial: true }),
  ]);

  return { categories, totalCount, page };
};

export const findCategoryByIdAndUpdate = async (
  id: string,
  categoryData: Partial<CategoryDocument>,
) => {
  return Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  });
};

export const findCategoryAndDeleteById = async (id: string) => {
  return Category.findByIdAndDelete(id);
};
