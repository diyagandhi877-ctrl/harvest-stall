const express = require("express");
const { checkout, myOrders, getOrder, farmerOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { requireRole, requireApprovedFarmer } = require("../middleware/role");

const router = express.Router();

router.use(protect);

router.post("/checkout", requireRole("customer"), checkout);
router.get("/my", requireRole("customer"), myOrders);

router.get("/farmer/list", requireApprovedFarmer, farmerOrders);
router.patch("/:id/status", requireApprovedFarmer, updateOrderStatus);

router.get("/:id", getOrder); // ownership checked inside controller

module.exports = router;
