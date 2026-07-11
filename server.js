const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

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
<<<<<<< HEAD
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

=======
app.use(cors());
>>>>>>> ca6e2409eeb832b9c483d5195fd330400983b14a
app.use(express.json());

const CK_USER_ID = 'CK101282816';
const CK_API_KEY = 'H00QE5HWM1V2LA60MXTA467O025IM9FC53117211AROXL4MM33NQ4E68B704H7VT';
const CK_BASE = 'https://www.nellobytesystems.com';

<<<<<<< HEAD
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
=======
app.get('/', (req, res) => {
  res.json({ status: 'QuickTop backend running ✅', version: '2.0' });
});

app.get('/airtime', async (req, res) => {
  try {
    const { network, amount, phone, ref } = req.query;
    if(!network || !amount || !phone || !ref) return res.status(400).json({status:'error',message:'Missing parameters'});
    const url = `${CK_BASE}/APIAirtimeV1.asp?UserID=${CK_USER_ID}&APIKey=${CK_API_KEY}&MobileNetwork=${network}&Amount=${amount}&MobileNumber=${phone}&RequestID=${ref}&CallBackURL=none`;
    const response = await fetch(url);
    const text = await response.text();
    try { res.json(JSON.parse(text)); } catch(e) { res.json({ status: 'error', message: text }); }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
>>>>>>> ca6e2409eeb832b9c483d5195fd330400983b14a

app.get('/data', async (req, res) => {
  try {
    const { network, plan, phone, ref } = req.query;
    if(!network || !plan || !phone || !ref) return res.status(400).json({status:'error',message:'Missing parameters'});
    const url = `${CK_BASE}/APIDatabundleV1.asp?UserID=${CK_USER_ID}&APIKey=${CK_API_KEY}&MobileNetwork=${network}&DataPlan=${plan}&MobileNumber=${phone}&RequestID=${ref}&CallBackURL=none`;
    const response = await fetch(url);
    const text = await response.text();
    try { res.json(JSON.parse(text)); } catch(e) { res.json({ status: 'error', message: text }); }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/balance', async (req, res) => {
  try {
    const url = `${CK_BASE}/APIWalletBalanceV1.asp?UserID=${CK_USER_ID}&APIKey=${CK_API_KEY}`;
    const response = await fetch(url);
    const text = await response.text();
    try { res.json(JSON.parse(text)); } catch(e) { res.json({ status: 'error', message: text }); }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

<<<<<<< HEAD
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    })
    .catch((err) => {

        console.error("❌ PostgreSQL connection failed");
        console.error(err);

        process.exit(1);

    });
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`QuickTop backend running on port ${PORT}`);
});
>>>>>>> ca6e2409eeb832b9c483d5195fd330400983b14a
