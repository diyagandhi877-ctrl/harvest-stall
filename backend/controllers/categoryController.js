const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

// @desc  List active categories (for filter chips / dropdowns)
// @route GET /api/categories
// @access Public
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, categories });
});

module.exports = { listCategories };
