const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc  Register a new customer or farmer
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, farmName, storeAddress } = req.body;

  if (!email && !phone) {
    res.status(400);
    throw new Error("Provide an email or a phone number");
  }

  const existing = await User.findOne({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean)
  });
  if (existing) {
    res.status(409);
    throw new Error("An account with that email or phone already exists");
  }

  // Admin accounts are never created through public signup.
  const safeRole = role === "farmer" ? "farmer" : "customer";

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: safeRole,
    avatarInitial: name.trim().charAt(0).toUpperCase(),
    ...(safeRole === "farmer"
      ? {
          farmerProfile: {
            farmName: farmName || `${name}'s Farm`,
            storeAddress: storeAddress || "",
            approvalStatus: "pending",
            availability: "open"
          }
        }
      : {})
  });

  const token = generateToken(user._id, user.role);
  res.status(201).json({
    success: true,
    message:
      safeRole === "farmer"
        ? "Farmer account created — pending admin approval before you can list products"
        : "Account created",
    token,
    user: user.toSafeObject()
  });
});

// @desc  Login with email/phone + password
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Enter your email/phone and password");
  }

  const isEmail = /^\S+@\S+\.\S+$/.test(identifier.trim());
  const query = isEmail ? { email: identifier.trim().toLowerCase() } : { phone: identifier.trim() };

  const user = await User.findOne(query).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact support.");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @desc  Get the logged-in user's own profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
