const express = require("express");
const {
  dashboardOverview,
  revenueAnalytics,
  topProducts,
  getMessages,
  updateMessageStatus
} = require("../controllers/farmerController");
const { protect } = require("../middleware/auth");
const { requireApprovedFarmer } = require("../middleware/role");

const router = express.Router();

router.use(protect, requireApprovedFarmer);

router.get("/dashboard", dashboardOverview);
router.get("/analytics/revenue", revenueAnalytics);
router.get("/analytics/top-products", topProducts);
router.get("/messages", getMessages);
router.patch("/messages/:id", updateMessageStatus);

module.exports = router;
