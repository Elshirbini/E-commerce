import { User } from "../auth/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const getAddresses = async (req, res, next) => {
  const { user } = req.user;

  const addresses = await User.findById(user._id).populate("addresses");

  if (!addresses || !addresses.addresses)
    throw new ApiError("User or addresses not found", 404);

  res.status(200).json({ addresses: addresses.addresses });
};

export const addAddress = async (req, res, next) => {
  const { city, phone, postalCode, details } = req.body;
  const { user } = req.user;

  if (!city || !phone || !postalCode || !details) {
    throw new ApiError("All fields are required", 401);
  }

  const userData = await User.findByIdAndUpdate(
    user._id,
    {
      $push: { addresses: { city, phone, postalCode, details } },
    },
    { new: true, runValidators: true }
  );

  if (!userData) throw new ApiError("User not found", 404);

  res.status(200).json({
    message: "Address added successfully",
    addresses: userData.addresses,
  });
};

export const updateAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const { city, phone, postalCode, details } = req.body;
  const { user } = req.user;

  const userData = await User.findOneAndUpdate(
    {
      _id: user._id,
      "addresses._id": addressId,
    },
    {
      $set: {
        "addresses.$.city": city,
        "addresses.$.phone": phone,
        "addresses.$.details": details,
        "addresses.$.postalCode": postalCode,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!userData) throw new ApiError("User or address not found", 404);

  res.status(200).json({
    message: "Address updated successfully",
    Addresses: userData.addresses,
  });
};

export const removeAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const { user } = req.user;

  const userData = await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true, runValidators: true }
  );

  if (!userData) throw new ApiError("User not found", 404);

  res.status(200).json({ message: "Address removed successfully" });
};
