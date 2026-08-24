// Run with: npm run seed
// Populates a fresh database with an admin account, one approved demo farmer,
// the category list, and the same 12 starter products from the original frontend mock data.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const categories = [
  { name: "Fruits", slug: "fruits", type: "fruit", icon: "🍎" },
  { name: "Vegetables", slug: "vegetables", type: "veg", icon: "🥦" }
];

async function run() {
  await connectDB();

  console.log("Clearing existing demo data...");
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  console.log("Creating admin account...");
  const admin = await User.create({
    name: "Harvest Stall Admin",
    email: "admin@harveststall.test",
    password: "Admin@12345",
    role: "admin",
    avatarInitial: "A"
  });

  console.log("Creating demo farmer (pre-approved)...");
  const farmer = await User.create({
    name: "Ramesh Patil",
    email: "farmer@harveststall.test",
    phone: "+919876543210",
    password: "Farmer@12345",
    role: "farmer",
    avatarInitial: "R",
    farmerProfile: {
      farmName: "Patil Family Farm",
      storeAddress: "Nashik, Maharashtra",
      description: "Third-generation growers of fruit and leafy greens.",
      whatsapp: "+919876543210",
      availability: "open",
      approvalStatus: "approved"
    }
  });

  console.log("Creating categories...");
  const catDocs = await Category.insertMany(categories);
  const fruitCat = catDocs.find((c) => c.type === "fruit")._id;
  const vegCat = catDocs.find((c) => c.type === "veg")._id;

  console.log("Creating starter products...");
  const produce = [
    { name: "Alphonso Mango", type: "fruit", icon: "🥭", calories: 60, nutrient: "Vitamin C", nutrientPct: 36, origin: "Ratnagiri, MH", organic: true, prices: { "250g": 90, "500g": 170, "1kg": 320 }, mrp: { "1kg": 380 } },
    { name: "Nagpur Orange", type: "fruit", icon: "🍊", calories: 47, nutrient: "Vitamin C", nutrientPct: 64, origin: "Nagpur, MH", organic: false, prices: { "250g": 35, "500g": 65, "1kg": 120 } },
    { name: "Shimla Apple", type: "fruit", icon: "🍎", calories: 52, nutrient: "Fiber", nutrientPct: 17, origin: "Shimla, HP", organic: true, prices: { "250g": 55, "500g": 105, "1kg": 200 }, mrp: { "1kg": 230 } },
    { name: "Cavendish Banana", type: "fruit", icon: "🍌", calories: 89, nutrient: "Potassium", nutrientPct: 12, origin: "Jalgaon, MH", organic: false, prices: { "250g": 15, "500g": 28, "1kg": 50 } },
    { name: "Pomegranate", type: "fruit", icon: "🍎", calories: 83, nutrient: "Vitamin K", nutrientPct: 21, origin: "Solapur, MH", organic: true, prices: { "250g": 60, "500g": 115, "1kg": 210 } },
    { name: "Baby Spinach", type: "veg", icon: "🥬", calories: 23, nutrient: "Vitamin A", nutrientPct: 188, origin: "Nashik, MH", organic: true, prices: { "250g": 20, "500g": 35, "1kg": 60 } },
    { name: "Broccoli", type: "veg", icon: "🥦", calories: 34, nutrient: "Vitamin C", nutrientPct: 149, origin: "Nashik, MH", organic: true, prices: { "250g": 45, "500g": 85, "1kg": 160 }, mrp: { "1kg": 190 } },
    { name: "Carrot", type: "veg", icon: "🥕", calories: 41, nutrient: "Vitamin A", nutrientPct: 334, origin: "Ooty, TN", organic: false, prices: { "250g": 12, "500g": 22, "1kg": 40 } },
    { name: "Bell Pepper", type: "veg", icon: "🫑", calories: 31, nutrient: "Vitamin C", nutrientPct: 213, origin: "Nashik, MH", organic: false, prices: { "250g": 30, "500g": 55, "1kg": 100 } },
    { name: "Beetroot", type: "veg", icon: "🍠", calories: 43, nutrient: "Folate", nutrientPct: 27, origin: "Pune, MH", organic: true, prices: { "250g": 18, "500g": 32, "1kg": 58 } },
    { name: "Cherry Tomato", type: "veg", icon: "🍅", calories: 18, nutrient: "Lycopene", nutrientPct: 40, origin: "Nashik, MH", organic: true, prices: { "250g": 25, "500g": 45, "1kg": 80 } },
    { name: "Green Grapes", type: "fruit", icon: "🍇", calories: 69, nutrient: "Vitamin K", nutrientPct: 18, origin: "Nashik, MH", organic: false, prices: { "250g": 40, "500g": 75, "1kg": 140 } }
  ].map((p) => ({
    ...p,
    farmer: farmer._id,
    category: p.type === "fruit" ? fruitCat : vegCat,
    stock: { "250g": 40, "500g": 40, "1kg": 25 }
  }));

  await Product.insertMany(produce);

  console.log("\nSeed complete.");
  console.log("Admin login:  admin@harveststall.test / Admin@12345");
  console.log("Farmer login: farmer@harveststall.test / Farmer@12345");
  console.log(`Products created: ${produce.length}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
