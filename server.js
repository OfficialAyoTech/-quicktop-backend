const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CK_USER_ID = 'CK101282816';
const CK_API_KEY = 'H00QE5HWM1V2LA60MXTA467O025IM9FC53117211AROXL4MM33NQ4E68B704H7VT';
const CK_BASE = 'https://www.nellobytesystems.com';

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`QuickTop backend running on port ${PORT}`);
});
