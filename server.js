const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CK_USER_ID = 'CK101282816';
const CK_API_TOKEN = 'LN9R04NUVN2ZRI172944E64LPMVN5Y731Q3CVE3J8ZF33Q5LC4C55T7N9D22A983';
const CK_BASE = 'https://www.clubkonnect.com/API';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'QuickTop backend is running ✅' });
});

// Buy Airtime
app.get('/airtime', async (req, res) => {
  try {
    const { network, amount, phone, ref } = req.query;
    const url = `${CK_BASE}/airtime.asp?UserID=${CK_USER_ID}&APIToken=${CK_API_TOKEN}&MobileNetwork=${network}&Amount=${amount}&MobileNumber=${phone}&RequestID=${ref}`;
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { status: 'error', message: text }; }
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Buy Data Bundle
app.get('/data', async (req, res) => {
  try {
    const { network, plan, phone, ref } = req.query;
    const url = `${CK_BASE}/databundle.asp?UserID=${CK_USER_ID}&APIToken=${CK_API_TOKEN}&MobileNetwork=${network}&DataPlan=${plan}&MobileNumber=${phone}&RequestID=${ref}`;
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { status: 'error', message: text }; }
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Check Wallet Balance
app.get('/balance', async (req, res) => {
  try {
    const url = `${CK_BASE}/walletbalance.asp?UserID=${CK_USER_ID}&APIToken=${CK_API_TOKEN}`;
    const response = await fetch(url);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { status: 'error', message: text }; }
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`QuickTop backend running on port ${PORT}`);
});
