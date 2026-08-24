const express = require("express");
const { listCategories } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", listCategories);

module.exports = router;
