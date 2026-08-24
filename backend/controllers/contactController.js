const asyncHandler = require("express-async-handler");
const ContactMessage = require("../models/ContactMessage");
const User = require("../models/User");

// @desc  Submit the general site contact form
// @route POST /api/contact
// @access Public (optionally authenticated)
const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !message || (!email && !phone)) {
    res.status(400);
    throw new Error("Name, message, and an email or phone are required");
  }

  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
    fromUser: req.user ? req.user._id : undefined
  });

  res.status(201).json({ success: true, message: "Message sent — we'll get back to you soon", id: doc._id });
});

// @desc  Contact a specific farmer/seller about a product
// @route POST /api/contact/seller/:farmerId
// @access Public (optionally authenticated)
const contactSeller = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const farmer = await User.findOne({ _id: req.params.farmerId, role: "farmer" });
  if (!farmer) {
    res.status(404);
    throw new Error("Seller not found");
  }
  if (!message || (!name && !req.user)) {
    res.status(400);
    throw new Error("Name and message are required");
  }

  const doc = await ContactMessage.create({
    name: name || req.user.name,
    email: email || req.user?.email,
    phone: phone || req.user?.phone,
    subject: subject || "Product inquiry",
    message,
    fromUser: req.user ? req.user._id : undefined,
    toFarmer: farmer._id
  });

  res.status(201).json({ success: true, message: "Message sent to the seller", id: doc._id });
});

module.exports = { sendContactMessage, contactSeller };
