require("dotenv").config();

const validateEnv = require("./config/validateEnv");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

validateEnv();

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
const walletLedgerRoutes = require("./routes/walletLedgerRoutes");
const airtimeRoutes = require("./routes/airtimeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transferRoutes = require("./routes/transferRoutes");

const app = express();

// Trust Render's proxy
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

// Swagger Documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ===================================
// Security Middleware
// ===================================

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
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

app.use("/api/data", dataRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/wallet", walletRoutes);
app.use("/api/wallet-ledger", walletLedgerRoutes);
app.use("/api/airtime", airtimeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transfers", transferRoutes);
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