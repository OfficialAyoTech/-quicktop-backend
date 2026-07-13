const httpClient = require("../utils/httpClient");

const BASE_URL = process.env.CK_BASE;
const USER_ID = process.env.CK_USER_ID;
const API_KEY = process.env.CK_API_KEY;

console.log("CK_BASE =", BASE_URL);
console.log("CK_USER_ID =", USER_ID);
console.log("API_KEY exists =", !!API_KEY);

/**
 * Get ClubKonnect Wallet Balance
 */
const getWalletBalance = async () => {
  try {
    const url =
      `${BASE_URL}/APIWalletBalanceV1.asp` +
      `?UserID=${USER_ID}` +
      `&APIKey=${API_KEY}`;

    console.log("==================================");
    console.log("Checking Wallet Balance...");
   console.log("BASE_URL VALUE:");
console.log(JSON.stringify(BASE_URL));

console.log("FINAL URL:");
console.log(JSON.stringify(url));

   console.log("==================================");
console.log("FINAL URL:");
console.log(url);
console.log("==================================");

const response = await httpClient.get(url);

    console.log("Wallet Response:");
    console.log(response.data);

    return response.data;

  } catch (error) {
    console.log("========== CLUBKONNECT WALLET ERROR ==========");
    console.log("Status:", error.response?.status);
    console.log("Headers:", error.response?.headers);
    console.log("Body:", error.response?.data);
    console.log("Message:", error.message);

    throw error;
  }
};

/**
 * Buy Airtime
 */
const buyAirtime = async ({
  network,
  amount,
  phone,
  requestId,
  callbackUrl = "",
}) => {
  try {
    const url =
      `${BASE_URL}/APIAirtimeV1.asp` +
      `?UserID=${USER_ID}` +
      `&APIKey=${API_KEY}` +
      `&MobileNetwork=${network}` +
      `&Amount=${amount}` +
      `&MobileNumber=${phone}` +
      `&RequestID=${requestId}` +
      `&CallBackURL=${encodeURIComponent(callbackUrl)}`;

    console.log("==================================");
    console.log("Buying Airtime...");
    console.log("BASE_URL VALUE:");
console.log(JSON.stringify(BASE_URL));

console.log("FINAL URL:");
console.log(JSON.stringify(url));

    const response = await httpClient.get(url);

    console.log("Airtime Response:");
    console.log(response.data);

    return response.data;

  } catch (error) {
    console.log("========== CLUBKONNECT AIRTIME ERROR ==========");
    console.log("Status:", error.response?.status);
    console.log("Headers:", error.response?.headers);
    console.log("Body:", error.response?.data);
    console.log("Message:", error.message);

    throw error;
  }
};

module.exports = {
  getWalletBalance,
  buyAirtime,
};