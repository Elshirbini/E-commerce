import { Order } from "../order/schemas/order.schema";
import { Product, ProductDocument } from "./product.schema";

export const createProduct = async (productData: Partial<ProductDocument>) => {
  return Product.create(productData);
};

export const findProductByIdAndUpdate = async (
  productId: string,
  productData: Partial<ProductDocument>,
) => {
  return Product.findByIdAndUpdate(productId, productData, {
    new: true,
    runValidators: true,
  });
};

export const findProductById = async (productId: string) => {
  return Product.findById(productId);
};

export const findProductsByCategoryId = async (
  categoryId: string,
  queryReq: any = {},
) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Product.find({ categoryId })
    .select("-__v -updatedAt -images")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [products, totalCount] = await Promise.all([
    query,
    Product.countDocuments({ categoryId }),
  ]);

  return { products, totalCount, page };
};

export const getMuchAndLatestSaledProducts = async (queryReq: any = {}) => {
  const { type, from, to } = queryReq;
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  const matchStage = {
    isPaid: true,
    ...(from &&
      to && {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      }),
  };

  const pipeline: any[] = [
    { $match: matchStage },
    { $unwind: "$cartItems" },
    {
      $group: {
        _id: "$cartItems.productId",
        totalSold: { $sum: "$cartItems.quantity" },
        lastSoldAt: { $max: "$createdAt" },
      },
    },
  ];

  if (type === "best") {
    pipeline.push({ $sort: { totalSold: -1 } });
  } else if (type === "latest") {
    pipeline.push({ $sort: { lastSoldAt: -1 } });
  }

  // Count pipeline
  const countPipeline = [...pipeline, { $count: "totalCount" }];
  const countResult = await Order.aggregate(countPipeline);
  const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  // Data pipeline
  if (limit > 0) {
    pipeline.push({ $skip: skip }, { $limit: limit });
  }

  pipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  );

  const products = await Order.aggregate(pipeline);

  return { products, totalCount, page };
};

export const saveProduct = async (product: ProductDocument) => {
  return product.save();
};

export const findProductByIdAndDelete = async (productId: string) => {
  return Product.findByIdAndDelete(productId);
};

export const findProductsByIds = async (productIds: string[]) => {
  return Product.find({ _id: { $in: productIds } });
};
