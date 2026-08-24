const mongoose = require("mongoose");

const WEIGHTS = ["250g", "500g", "1kg"];

const weightMapSchema = new mongoose.Schema(
  {
    "250g": { type: Number, min: 0 },
    "500g": { type: Number, min: 0 },
    "1kg": { type: Number, min: 0 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["fruit", "veg"], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    icon: { type: String, default: "🥗" },
    images: [{ type: String }], // uploaded file URLs; icon is used as fallback in the UI
    origin: { type: String, trim: true },
    description: { type: String, trim: true },
    organic: { type: Boolean, default: false },

    calories: { type: Number, min: 0 },
    nutrient: { type: String, trim: true },
    nutrientPct: { type: Number, min: 0, max: 400 },

    prices: { type: weightMapSchema, required: true },
    mrp: { type: weightMapSchema }, // present only for weights currently on sale
    seasonalOffer: {
      label: { type: String },
      active: { type: Boolean, default: false }
    },

    stock: { type: weightMapSchema, default: () => ({ "250g": 0, "500g": 0, "1kg": 0 }) },

    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true } // farmer can unpublish without deleting
  },
  { timestamps: true }
);

productSchema.index({ name: "text", origin: "text" });
productSchema.index({ farmer: 1 });
productSchema.index({ type: 1 });
productSchema.index({ isActive: 1 });

productSchema.methods.stockFor = function stockFor(weight) {
  return this.stock?.[weight] ?? 0;
};

productSchema.statics.WEIGHTS = WEIGHTS;

module.exports = mongoose.model("Product", productSchema);
