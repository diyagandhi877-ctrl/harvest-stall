const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ContactMessage = require("../models/ContactMessage");

// @desc  Farmer dashboard overview: counts + revenue snapshot
// @route GET /api/farmer/dashboard
// @access Private/Farmer
const dashboardOverview = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const [productCount, activeProductCount, orderCounts, revenueAgg, unreadMessages] = await Promise.all([
    Product.countDocuments({ farmer: farmerId }),
    Product.countDocuments({ farmer: farmerId, isActive: true }),
    Order.aggregate([
      { $match: { farmer: farmerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { farmer: farmerId, status: { $in: ["delivered", "out_for_delivery", "preparing", "accepted"] } } },
      { $group: { _id: null, revenue: { $sum: "$itemsTotal" } } }
    ]),
    ContactMessage.countDocuments({ toFarmer: farmerId, status: "new" })
  ]);

  const statusMap = orderCounts.reduce((acc, o) => ({ ...acc, [o._id]: o.count }), {});

  res.json({
    success: true,
    overview: {
      totalProducts: productCount,
      activeProducts: activeProductCount,
      pendingOrders: statusMap.pending || 0,
      acceptedOrders: statusMap.accepted || 0,
      deliveredOrders: statusMap.delivered || 0,
      rejectedOrders: statusMap.rejected || 0,
      totalRevenue: revenueAgg[0]?.revenue || 0,
      unreadMessages,
      availability: req.user.farmerProfile?.availability || "open",
      approvalStatus: req.user.farmerProfile?.approvalStatus || "pending"
    }
  });
});

// @desc  Revenue over time, grouped by day, for a simple analytics chart
// @route GET /api/farmer/analytics/revenue?days=30
// @access Private/Farmer
const revenueAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(90, Number(req.query.days) || 30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await Order.aggregate([
    {
      $match: {
        farmer: req.user._id,
        createdAt: { $gte: since },
        status: { $in: ["delivered", "out_for_delivery", "preparing", "accepted"] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$itemsTotal" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, series: rows });
});

// @desc  Best-selling products for this farmer
// @route GET /api/farmer/analytics/top-products
// @access Private/Farmer
const topProducts = asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    { $match: { farmer: req.user._id, status: { $ne: "rejected" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  res.json({ success: true, topProducts: rows });
});

// @desc  Messages received by this farmer (from "contact seller")
// @route GET /api/farmer/messages
// @access Private/Farmer
const getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find({ toFarmer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("fromUser", "name phone email");
  res.json({ success: true, messages });
});

// @desc  Mark a message as read/replied
// @route PATCH /api/farmer/messages/:id
// @access Private/Farmer
const updateMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const message = await ContactMessage.findOne({ _id: req.params.id, toFarmer: req.user._id });
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  message.status = status || "read";
  await message.save();
  res.json({ success: true, message });
});

module.exports = { dashboardOverview, revenueAnalytics, topProducts, getMessages, updateMessageStatus };
