import { User } from "../auth/user.model.js";

export const isAdmin = async (req, res, next) => {
  const { user } = req.user;
  const userDoc = await User.findById(user._id);
  if (userDoc?.role === "admin") {
    next();
  } else {
    return res
      .status(401)
      .json({ error: "Access denied ,This functionality for admins only" });
  }
};
