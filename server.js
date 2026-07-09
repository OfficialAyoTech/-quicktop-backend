require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("./config/firebase");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// Security Middleware
// ==========================

// Secure HTTP headers
app.use(helmet());

// Allow only your frontend
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://officialayotech.github.io"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

// Parse JSON
app.use(express.json());

// ==========================
// Routes
// ==========================

const statusRoute = require("./routes/status");
const dataRoutes = require("./routes/dataRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes"); // ✅ NEW

app.use("/status", statusRoute);
app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes); // ✅ NEW

// ==========================
// Home Route
// ==========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to QuickTop API 🚀",
        version: "1.0.0"
    });
});

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