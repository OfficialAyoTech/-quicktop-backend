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
const dataPlansRoutes = require("./routes/dataPlansRoutes");
const electricityRoutes = require("./routes/electricityRoutes");
const cableRoutes = require("./routes/cableRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const pinRoutes = require("./routes/pinRoutes");
const profileRoutes = require("./routes/profileRoutes");
const referralRoutes =
    require("./routes/referralRoutes");
const kycRoutes = require("./routes/kycRoutes");
const adminRoutes = require("./routes/adminRoutes");
const waecRoutes = require("./routes/waecRoutes");
const legalRoutes = require("./routes/legalRoutes");

const startTransactionWorker = require("./workers/transactionWorker");

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

// Paystack webhook needs the raw body for signature verification —
// must be registered before express.json() and scoped to this exact path only
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

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
// app.use("/api/transfers", transferRoutes);
app.use("/api/data-plans", dataPlansRoutes);
app.use("/api/electricity", electricityRoutes);
app.use("/api/cable", cableRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/pin", pinRoutes);
app.use("/api/profile", profileRoutes);
app.use(
    "/api/referrals",
    referralRoutes
);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/push", require("./routes/pushRoutes"));
app.use("/api/waec", waecRoutes);
app.use("/api/legal", legalRoutes);

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

    startTransactionWorker();

});

    })
    .catch((err) => {

        console.error("❌ PostgreSQL connection failed");
        console.error(err);

        process.exit(1);

    });