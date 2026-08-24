const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Announcement = require("../models/Announcement");

// @desc  Platform-wide dashboard stats
// @route GET /api/admin/dashboard
// @access Private/Admin
const dashboardStats = asyncHandler(async (req, res) => {
  const [totalCustomers, totalFarmers, pendingFarmers, totalProducts, totalOrders, revenueAgg] =
    await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "farmer", "farmerProfile.approvalStatus": "pending" }),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $in: ["delivered", "out_for_delivery", "preparing", "accepted"] } } },
        { $group: { _id: null, revenue: { $sum: "$itemsTotal" } } }
      ])
    ]);

  res.json({
    success: true,
    stats: {
      totalCustomers,
      totalFarmers,
      pendingFarmers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg[0]?.revenue || 0
    }
  });
});

// @desc  List/search customers
// @route GET /api/admin/customers
// @access Private/Admin
const listCustomers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = { role: "customer" };
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [users, total] = await Promise.all([
    User.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, customers: users, pagination: { page: pageNum, total, pages: Math.ceil(total / limitNum) } });
});

// @desc  List/search farmers (with approval status filter)
// @route GET /api/admin/farmers?status=pending
// @access Private/Admin
const listFarmers = asyncHandler(async (req, res) => {
  const { q, status, page = 1, limit = 20 } = req.query;
  const filter = { role: "farmer" };
  if (status) filter["farmerProfile.approvalStatus"] = status;
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { "farmerProfile.farmName": new RegExp(q, "i") }];

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [users, total] = await Promise.all([
    User.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, farmers: users, pagination: { page: pageNum, total, pages: Math.ceil(total / limitNum) } });
});

// @desc  Approve or reject a farmer account
// @route PATCH /api/admin/farmers/:id/approval
// @access Private/Admin
const setFarmerApproval = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400);
    throw new Error("status must be approved, rejected, or pending");
  }

  const farmer = await User.findOne({ _id: req.params.id, role: "farmer" });
  if (!farmer) {
    res.status(404);
    throw new Error("Farmer not found");
  }

  farmer.farmerProfile.approvalStatus = status;
  farmer.farmerProfile.rejectionReason = status === "rejected" ? rejectionReason || "" : undefined;
  await farmer.save();
  res.json({ success: true, farmer: farmer.toSafeObject() });
});

// @desc  Activate/deactivate any user account (customer or farmer)
// @route PATCH /api/admin/users/:id/status
// @access Private/Admin
const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Cannot deactivate an admin account");
  }
  user.isActive = !!isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  List all products across all farmers (moderation view)
// @route GET /api/admin/products
// @access Private/Admin
const listAllProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (q) filter.name = new RegExp(q, "i");

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("farmer", "name farmerProfile.farmName")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, products, pagination: { page: pageNum, total, pages: Math.ceil(total / limitNum) } });
});

// @desc  Force-unpublish/remove a product (policy violation etc.)
// @route DELETE /api/admin/products/:id
// @access Private/Admin
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
});

// @desc  List all orders platform-wide
// @route GET /api/admin/orders?status=pending
// @access Private/Admin
const listAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name")
      .populate("farmer", "name farmerProfile.farmName")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Order.countDocuments(filter)
  ]);
  res.json({ success: true, orders, pagination: { page: pageNum, total, pages: Math.ceil(total / limitNum) } });
});

// ---------- Categories ----------

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, type, icon } = req.body;
  if (!name || !slug) {
    res.status(400);
    throw new Error("name and slug are required");
  }
  const category = await Category.create({ name, slug, type, icon });
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  ["name", "slug", "type", "icon", "isActive"].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});

// ---------- Announcements ----------

const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, audience } = req.body;
  if (!title || !body) {
    res.status(400);
    throw new Error("title and body are required");
  }
  const announcement = await Announcement.create({
    title,
    body,
    audience: audience || "all",
    postedBy: req.user._id
  });
  res.status(201).json({ success: true, announcement });
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({}).sort({ createdAt: -1 });
  res.json({ success: true, announcements });
});

module.exports = {
  dashboardStats,
  listCustomers,
  listFarmers,
  setFarmerApproval,
  setUserActive,
  listAllProducts,
  removeProduct,
  listAllOrders,
  createCategory,
  updateCategory,
  deleteCategory,
  sendAnnouncement,
  listAnnouncements
};
