import { Order, OrderDocument } from "./schemas/order.schema";

export const createOrder = async (orderData: Partial<OrderDocument>) => {
  return Order.create(orderData);
};

export const findOrderByIdAndUpdate = async (
  id: string,
  orderData: Partial<OrderDocument>,
) => {
  return Order.findByIdAndUpdate(id, orderData, {
    new: true,
    runValidators: true,
  });
};

export const getOrders = async (queryReq: any = {}) => {
  const limit =
    queryReq.limit !== undefined ? parseInt(queryReq.limit as string) : 10;
  const page = queryReq.page ? parseInt(queryReq.page as string) : 1;
  const skip = (page - 1) * limit;

  let query = Order.find({ isConfirmed: true })
    .populate([
      { path: "userId", select: "_id fullName email" },
      { path: "cartItems.productId", select: "_id name" },
    ])
    .select("-updatedAt -__v -shippingAddress -email -phone")
    .sort({
      createdAt: -1,
    });

  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const [orders, totalCount] = await Promise.all([
    query,
    Order.countDocuments({ isConfirmed: true }),
  ]);

  return { orders, totalCount, page };
};

export const findOrderById = async (id: string) => {
  return Order.findById(id).populate("userId cartItems.productId");
};

export const deleteUnconfirmedOrdersAbove6H = async () => {
  await Order.deleteMany({
    isConfirmed: false,
    createdAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
};
