const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// @desc  Get the logged-in customer's cart (with live product data)
// @route GET /api/cart
// @access Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name icon prices stock isActive farmer"
  );
  res.json({ success: true, cart: cart || { items: [] } });
});

// @desc  Add an item (or increase quantity if same product+weight already in cart)
// @route POST /api/cart/items
// @access Private
const addItem = asyncHandler(async (req, res) => {
  const { productId, weight, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (!product.prices?.[weight]) {
    res.status(400);
    throw new Error("Invalid weight option for this product");
  }
  if (product.stockFor(weight) < quantity) {
    res.status(409);
    throw new Error(`Only ${product.stockFor(weight)} left in ${weight}`);
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.weight === weight
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      weight,
      quantity: Number(quantity),
      priceAtAdd: product.prices[weight]
    });
  }

  await cart.save();
  const populated = await cart.populate("items.product", "name icon prices stock isActive farmer");
  res.status(201).json({ success: true, cart: populated });
});

// @desc  Update quantity of a cart item
// @route PUT /api/cart/items/:itemId
// @access Private
const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  item.quantity = quantity;
  await cart.save();
  const populated = await cart.populate("items.product", "name icon prices stock isActive farmer");
  res.json({ success: true, cart: populated });
});

// @desc  Remove a cart item
// @route DELETE /api/cart/items/:itemId
// @access Private
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }
  item.deleteOne();
  await cart.save();
  const populated = await cart.populate("items.product", "name icon prices stock isActive farmer");
  res.json({ success: true, cart: populated });
});

// @desc  Empty the cart (e.g. after checkout)
// @route DELETE /api/cart
// @access Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
