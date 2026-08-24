const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },

    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set if sender was logged in
    toFarmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set for "contact seller"; null = general site contact

    status: { type: String, enum: ["new", "read", "replied"], default: "new" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
