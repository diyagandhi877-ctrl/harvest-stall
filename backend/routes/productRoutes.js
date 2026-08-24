const express = require("express");
const { body } = require("express-validator");
const {
  listProducts,
  searchSuggestions,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  listMyProducts
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { requireApprovedFarmer } = require("../middleware/role");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const router = express.Router();

// Public browsing
router.get("/", listProducts);
router.get("/suggestions", searchSuggestions);

// Farmer's own product list — must come before "/:id" so "mine" isn't parsed as an id
router.get("/mine/list", protect, requireApprovedFarmer, listMyProducts);

router.get("/:id", getProduct);

const productValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("type").isIn(["fruit", "veg"]).withMessage("Type must be fruit or veg"),
  body("prices.250g").optional().isFloat({ min: 0 }),
  body("prices.500g").optional().isFloat({ min: 0 }),
  body("prices.1kg").optional().isFloat({ min: 0 })
];

router.post(
  "/",
  protect,
  requireApprovedFarmer,
  upload.array("images", 5),
  productValidation,
  validate,
  createProduct
);
router.put("/:id", protect, requireApprovedFarmer, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, requireApprovedFarmer, deleteProduct);
router.patch("/:id/stock", protect, requireApprovedFarmer, updateStock);

module.exports = router;
