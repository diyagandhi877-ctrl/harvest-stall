const express = require("express");
const { body } = require("express-validator");
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect); // every route below requires login

router.put("/me", updateProfile);

router.post(
  "/me/addresses",
  [
    body("line1").trim().notEmpty().withMessage("Address line is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("pincode").trim().notEmpty().withMessage("Pincode is required")
  ],
  validate,
  addAddress
);
router.put("/me/addresses/:addressId", updateAddress);
router.delete("/me/addresses/:addressId", deleteAddress);

router.get("/me/wishlist", getWishlist);
router.post("/me/wishlist/:productId", toggleWishlist);

module.exports = router;
