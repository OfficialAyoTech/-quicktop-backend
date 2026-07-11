require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("./config/firebase");
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

// ==========================
// Security Middleware
// ==========================

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://officialayotech.github.io"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

app.use(express.json());

// ==========================
// Routes
// ==========================

app.use("/status", statusRoute);
app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/airtime", airtimeRoutes);

// ==========================
// Home Route
// ==========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to QuickTop API 🚀",
        version: "2.0.0"
    });
});

// ==========================
// 404 Handler
// ==========================

app.use(notFound);

// ==========================
// Global Error Handler
// ==========================

app.use(errorHandler);

// ==========================
// Database Connection
// ==========================

pool.query("SELECT NOW()")
    .then((result) => {

        console.log("✅ PostgreSQL connected successfully");
        console.log("🕒 Database Time:", result.rows[0].now);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    })
    .catch((err) => {

        console.error("❌ PostgreSQL connection failed");
        console.error(err);

        process.exit(1);

    });