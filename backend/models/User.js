const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" }, // Home / Work / Other
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true, timestamps: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"]
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      match: [/^\+?[0-9]{7,15}$/, "Enter a valid phone number"]
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["customer", "farmer", "admin"],
      default: "customer"
    },
    avatarInitial: { type: String },
    language: { type: String, enum: ["en", "hi", "mr"], default: "en" },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Farmer-specific fields (only populated when role === 'farmer')
    farmerProfile: {
      farmName: { type: String, trim: true },
      storeAddress: { type: String, trim: true },
      description: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      availability: {
        type: String,
        enum: ["open", "closed", "on_break"],
        default: "open"
      },
      approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      rejectionReason: { type: String }
    },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ "farmerProfile.approvalStatus": 1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
