require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// Initialize Firebase
require("./config/firebase");

// PostgreSQL
const pool = require("./config/database");

// Middleware
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// Routes
const statusRoute = require("./routes/status");
const dataRoutes = require("./routes/dataRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const airtimeRoutes = require("./routes/airtimeRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Security Middleware
// ===================================

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://officialayotech.github.io"
    ],
    credentials: true
}));

app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

// ===================================
// Routes
// ===================================

app.use("/status", statusRoute);

app.use("/api", dataRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/airtime", airtimeRoutes);

// ===================================
// Home
// ===================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to QuickTop API 🚀",
        version: "2.0.0"
    });
});

// ===================================
// 404
// ===================================

app.use(notFound);

// ===================================
// Error Handler
// ===================================

app.use(errorHandler);

// ===================================
// Start Server
// ===================================

pool.connect()
    .then((client) => {

        console.log("✅ PostgreSQL connected");
        client.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    })
    .catch((err) => {

        console.error("❌ PostgreSQL connection failed");
        console.error(err);

        process.exit(1);

    });