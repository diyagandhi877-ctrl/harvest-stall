const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc  List/search/filter/sort/paginate products
// @route GET /api/products
// @access Public
// Query params: q, type(fruit|veg), organic(true), minPrice, maxPrice, weight, category,
//               farmer, sort(name|price-asc|price-desc|calories|newest), page, limit
const listProducts = asyncHandler(async (req, res) => {
  const {
    q,
    type,
    organic,
    weight = "500g",
    category,
    farmer,
    minPrice,
    maxPrice,
    sort = "name",
    page = 1,
    limit = 20
  } = req.query;

  const filter = { isActive: true };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (farmer) filter.farmer = farmer;
  if (organic === "true") filter.organic = true;
  if (q) filter.$text = { $search: q };

  const priceField = `prices.${["250g", "500g", "1kg"].includes(weight) ? weight : "500g"}`;
  if (minPrice || maxPrice) {
    filter[priceField] = {};
    if (minPrice) filter[priceField].$gte = Number(minPrice);
    if (maxPrice) filter[priceField].$lte = Number(maxPrice);
  }

  const sortMap = {
    name: { name: 1 },
    "price-asc": { [priceField]: 1 },
    "price-desc": { [priceField]: -1 },
    calories: { calories: 1 },
    newest: { createdAt: -1 }
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.name)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("farmer", "name farmerProfile.farmName farmerProfile.availability"),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    products: items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc  Search suggestions (lightweight, name-only, for a typeahead)
// @route GET /api/products/suggestions?q=man
// @access Public
const searchSuggestions = asyncHandler(async (req, res) => {
  const { q = "" } = req.query;
  if (!q.trim()) return res.json({ success: true, suggestions: [] });

  const matches = await Product.find({
    isActive: true,
    name: { $regex: q.trim(), $options: "i" }
  })
    .select("name icon type")
    .limit(8);

  res.json({ success: true, suggestions: matches });
});

// @desc  Get single product with farmer contact details
// @route GET /api/products/:id
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("farmer", "name farmerProfile.farmName farmerProfile.storeAddress farmerProfile.whatsapp farmerProfile.availability");

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, product });
});

// @desc  Create a product (farmer only, must be approved)
// @route POST /api/products
// @access Private/Farmer
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    category,
    icon,
    origin,
    description,
    organic,
    calories,
    nutrient,
    nutrientPct,
    prices,
    mrp,
    stock
  } = req.body;

  if (!name || !type || !prices) {
    res.status(400);
    throw new Error("name, type, and prices are required");
  }

  const images = (req.files || []).map((f) => `/uploads/products/${f.filename}`);

  const product = await Product.create({
    farmer: req.user._id,
    name,
    type,
    category: category || undefined,
    icon: icon || "🥗",
    images,
    origin,
    description,
    organic: !!organic,
    calories,
    nutrient,
    nutrientPct,
    prices,
    mrp,
    stock: stock || { "250g": 0, "500g": 0, "1kg": 0 }
  });

  res.status(201).json({ success: true, product });
});

// @desc  Update a product (owning farmer only)
// @route PUT /api/products/:id
// @access Private/Farmer
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit your own products");
  }

  const editable = [
    "name",
    "type",
    "category",
    "icon",
    "origin",
    "description",
    "organic",
    "calories",
    "nutrient",
    "nutrientPct",
    "prices",
    "mrp",
    "stock",
    "isActive"
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.files && req.files.length) {
    const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  res.json({ success: true, product });
});

// @desc  Delete a product (owning farmer only)
// @route DELETE /api/products/:id
// @access Private/Farmer
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own products");
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// @desc  Quick stock/price update (owning farmer only)
// @route PATCH /api/products/:id/stock
// @access Private/Farmer
const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update your own products");
  }

  const { stock, prices } = req.body;
  if (stock) product.stock = { ...product.stock.toObject(), ...stock };
  if (prices) product.prices = { ...product.prices.toObject(), ...prices };

  await product.save();
  res.json({ success: true, product });
});

// @desc  List the logged-in farmer's own products
// @route GET /api/products/mine/list
// @access Private/Farmer
const listMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, products });
});

module.exports = {
  listProducts,
  searchSuggestions,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  listMyProducts
};
