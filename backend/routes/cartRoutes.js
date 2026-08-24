const express = require("express");
const { body } = require("express-validator");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect, requireRole("customer"));

router.get("/", getCart);
router.post(
  "/items",
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("weight").isIn(["250g", "500g", "1kg"]).withMessage("weight must be 250g, 500g, or 1kg"),
    body("quantity").optional().isInt({ min: 1 })
  ],
  validate,
  addItem
);
router.put("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);
router.delete("/", clearCart);

module.exports = router;
