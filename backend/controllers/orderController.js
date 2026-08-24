const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc  Checkout — turns the cart into one Order per farmer, decrements stock
// @route POST /api/orders/checkout
// @access Private/Customer
const checkout = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod = "cod" } = req.body;

  const address = req.user.addresses.id(addressId);
  if (!address) {
    res.status(400);
    throw new Error("Select a valid delivery address");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Validate stock for every line before committing anything.
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      res.status(409);
      throw new Error(`${item.product ? item.product.name : "An item"} is no longer available`);
    }
    if (item.product.stockFor(item.weight) < item.quantity) {
      res.status(409);
      throw new Error(`Not enough stock for ${item.product.name} (${item.weight})`);
    }
  }

  // Group cart items by farmer so each farmer gets their own order to accept/reject.
  const byFarmer = new Map();
  for (const item of cart.items) {
    const farmerId = item.product.farmer.toString();
    if (!byFarmer.has(farmerId)) byFarmer.set(farmerId, []);
    byFarmer.get(farmerId).push(item);
  }

  const orderGroupId = crypto.randomUUID();
  const createdOrders = [];

  for (const [farmerId, items] of byFarmer.entries()) {
    const orderItems = items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      icon: i.product.icon,
      weight: i.weight,
      quantity: i.quantity,
      price: i.priceAtAdd
    }));
    const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      orderGroupId,
      customer: req.user._id,
      farmer: farmerId,
      items: orderItems,
      shippingAddress: {
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      },
      itemsTotal,
      paymentMethod,
      status: "pending"
    });
    createdOrders.push(order);

    // Decrement stock now that the order is placed.
    for (const i of items) {
      await Product.updateOne(
        { _id: i.product._id },
        { $inc: { [`stock.${i.weight}`]: -i.quantity } }
      );
    }
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, orderGroupId, orders: createdOrders });
});

// @desc  Get the logged-in customer's order history
// @route GET /api/orders/my
// @access Private/Customer
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("farmer", "name farmerProfile.farmName");
  res.json({ success: true, orders });
});

// @desc  Get a single order (customer who owns it, or the farmer it belongs to)
// @route GET /api/orders/:id
// @access Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("farmer", "name farmerProfile.farmName farmerProfile.whatsapp")
    .populate("customer", "name phone email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isOwnerCustomer = order.customer._id.toString() === req.user._id.toString();
  const isOwnerFarmer = order.farmer._id.toString() === req.user._id.toString();
  if (!isOwnerCustomer && !isOwnerFarmer && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, order });
});

// @desc  List orders placed on the logged-in farmer's products
// @route GET /api/orders/farmer/list?status=pending
// @access Private/Farmer
const farmerOrders = asyncHandler(async (req, res) => {
  const filter = { farmer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("customer", "name phone");
  res.json({ success: true, orders });
});

// @desc  Farmer accepts/rejects/updates status of one of their orders
// @route PATCH /api/orders/:id/status
// @access Private/Farmer
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const allowed = ["accepted", "rejected", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update orders for your own products");
  }

  // If rejecting, restock the items.
  if (status === "rejected" && order.status !== "rejected") {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { [`stock.${item.weight}`]: item.quantity } }
      );
    }
    order.rejectionReason = rejectionReason || "Rejected by farmer";
  }

  order.status = status;
  await order.save();
  res.json({ success: true, order });
});

module.exports = { checkout, myOrders, getOrder, farmerOrders, updateOrderStatus };
