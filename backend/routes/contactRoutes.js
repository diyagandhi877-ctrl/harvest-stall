const express = require("express");
const { body } = require("express-validator");
const { sendContactMessage, contactSeller } = require("../controllers/contactController");
const { attachUserIfPresent } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const messageValidation = [
  body("message").trim().notEmpty().withMessage("Message is required")
];

router.post("/", attachUserIfPresent, messageValidation, validate, sendContactMessage);
router.post("/seller/:farmerId", attachUserIfPresent, messageValidation, validate, contactSeller);

module.exports = router;
