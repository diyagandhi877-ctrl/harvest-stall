const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");

// @desc  Update own profile (name, language; farmers can update farmerProfile fields)
// @route PUT /api/users/me
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, language, farmName, storeAddress, description, whatsapp, availability } = req.body;
  const user = req.user;

  if (name) user.name = name;
  if (language) user.language = language;

  if (user.role === "farmer") {
    if (farmName !== undefined) user.farmerProfile.farmName = farmName;
    if (storeAddress !== undefined) user.farmerProfile.storeAddress = storeAddress;
    if (description !== undefined) user.farmerProfile.description = description;
    if (whatsapp !== undefined) user.farmerProfile.whatsapp = whatsapp;
    if (availability !== undefined) user.farmerProfile.availability = availability;
  }

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Add an address
// @route POST /api/users/me/addresses
// @access Private
const addAddress = asyncHandler(async (req, res) => {
  const { label, line1, line2, city, state, pincode, isDefault } = req.body;
  if (!line1 || !city || !state || !pincode) {
    res.status(400);
    throw new Error("Address line, city, state, and pincode are required");
  }

  if (isDefault) {
    req.user.addresses.forEach((a) => (a.isDefault = false));
  }

  req.user.addresses.push({ label, line1, line2, city, state, pincode, isDefault: !!isDefault });
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

// @desc  Update an address
// @route PUT /api/users/me/addresses/:addressId
// @access Private
const updateAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  const fields = ["label", "line1", "line2", "city", "state", "pincode"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) address[f] = req.body[f];
  });

  if (req.body.isDefault) {
    req.user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }

  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

// @desc  Delete an address
// @route DELETE /api/users/me/addresses/:addressId
// @access Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  address.deleteOne();
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

// @desc  Toggle a product in the wishlist
// @route POST /api/users/me/wishlist/:productId
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const idx = req.user.wishlist.findIndex((id) => id.toString() === productId);
  let action;
  if (idx === -1) {
    req.user.wishlist.push(productId);
    action = "added";
  } else {
    req.user.wishlist.splice(idx, 1);
    action = "removed";
  }
  await req.user.save();
  res.json({ success: true, action, wishlist: req.user.wishlist });
});

// @desc  Get wishlist with populated product data
// @route GET /api/users/me/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ success: true, wishlist: user.wishlist });
});

module.exports = {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist
};
