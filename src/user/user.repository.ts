import { User, UserDocument } from "./user.schema";

export const findUserByIdAndUpdate = async (
  id: string,
  userData: Partial<UserDocument>,
) => {
  return User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });
};

export const findUserById = async (id: string) => {
  return User.findById(id);
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

export const findValidUser = async (id: string, code: string) => {
  return User.findOne({
    _id: id,
    codeValidation: code,
    codeValidationExpire: { $gt: Date.now() },
  });
};

export const findUserByGoogleId = async (googleId: string) => {
  return User.findOne({ googleId });
};

export const getUsers = async (id: string, query: any) => {
  const limit = query.limit !== undefined ? parseInt(query.limit) : 10;
  const page = query.page ? parseInt(query.page) : 1;
  const skip = (page - 1) * limit;

  let usersQuery = User.find({ _id: { $ne: id } }).sort({ createdAt: -1 });
  if (limit > 0) {
    usersQuery = usersQuery.skip(skip).limit(limit);
  }

  const [users, totalCount] = await Promise.all([
    usersQuery,
    User.countDocuments({ _id: { $ne: id } }),
  ]);

  return { users, totalCount, page };
};

export const createUser = async (userData: Partial<UserDocument>) => {
  return User.create(userData);
};

export const saveUser = async (user: UserDocument) => {
  return user.save();
};

export const findUserByEmailAndUpdate = async (
  email: string,
  userData: Partial<UserDocument>,
) => {
  return User.findOneAndUpdate({ email }, userData, {
    new: true,
    runValidators: true,
  });
};

export const findUserAndDeleteById = async (id: string) => {
  return User.findByIdAndDelete(id);
};
