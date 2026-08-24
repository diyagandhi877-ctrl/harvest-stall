const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot at time of order
    icon: { type: String },
    weight: { type: String, enum: ["250g", "500g", "1kg"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // snapshot price per unit
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderGroupId: { type: String, required: true, index: true }, // ties multi-farmer checkout together
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    itemsTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending"
    },
    rejectionReason: { type: String },
    paymentMethod: { type: String, enum: ["cod", "upi", "card"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
