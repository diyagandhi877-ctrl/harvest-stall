const express = require("express");
const {
  dashboardStats,
  listCustomers,
  listFarmers,
  setFarmerApproval,
  setUserActive,
  listAllProducts,
  removeProduct,
  listAllOrders,
  createCategory,
  updateCategory,
  deleteCategory,
  sendAnnouncement,
  listAnnouncements
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/dashboard", dashboardStats);

router.get("/customers", listCustomers);
router.get("/farmers", listFarmers);
router.patch("/farmers/:id/approval", setFarmerApproval);
router.patch("/users/:id/status", setUserActive);

router.get("/products", listAllProducts);
router.delete("/products/:id", removeProduct);

router.get("/orders", listAllOrders);

router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/announcements", sendAnnouncement);
router.get("/announcements", listAnnouncements);

module.exports = router;
