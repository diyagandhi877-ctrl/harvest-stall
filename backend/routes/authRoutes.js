const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Stricter limiter on auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts. Try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Enter a valid email"),
    body("phone").optional({ checkFalsy: true }).matches(/^\+?[0-9]{7,15}$/).withMessage("Enter a valid phone number"),
    body("role").optional().isIn(["customer", "farmer"]).withMessage("Invalid role")
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("identifier").trim().notEmpty().withMessage("Email or phone is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.get("/me", protect, getMe);

module.exports = router;
