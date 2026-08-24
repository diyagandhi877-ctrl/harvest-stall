require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Trust the first proxy (needed for correct rate-limiting/IPs behind e.g. Render/Heroku/Nginx)
app.set("trust proxy", 1);

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $ and . from req.body/query/params to block NoSQL injection
app.use(compression());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// General API rate limit (auth routes have their own stricter limiter)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Serve uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Routes ----------
app.get("/api/health", (req, res) => res.json({ success: true, message: "Harvest Stall API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Harvest Stall API listening on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

start();

module.exports = app;
