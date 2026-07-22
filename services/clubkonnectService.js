const httpClient = require("../utils/httpClient");

const BASE_URL = process.env.CK_BASE;
const USER_ID = process.env.CK_USER_ID;
const API_KEY = process.env.CK_API_KEY;

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
        console.log("Checking ClubKonnect Wallet Balance...");

        const response = await httpClient.get(url);

        console.log("Wallet Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== CLUBKONNECT WALLET ERROR ==========");
        console.log("Status:", error.response?.status);
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

        const response = await httpClient.get(url);

        console.log("Airtime Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== CLUBKONNECT AIRTIME ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Body:", error.response?.data);
        console.log("Message:", error.message);

        throw error;

    }

};

/**
 * Buy Data
 */
const buyData = async ({
    network,
    plan,
    phone,
    requestId,
    callbackUrl = "",
}) => {

    try {

        const url =
    `${BASE_URL}/APIDatabundleV1.asp` +
    `?UserID=${USER_ID}` +
    `&APIKey=${API_KEY}` +
    `&MobileNetwork=${network}` +
    `&DataPlan=${plan}` +
    `&MobileNumber=${phone}` +
    `&RequestID=${requestId}` +
    `&CallBackURL=${encodeURIComponent(callbackUrl)}`;

        console.log("==================================");
        console.log("Buying Data...");

        const response = await httpClient.get(url);

        console.log("Data Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== CLUBKONNECT DATA ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Body:", error.response?.data);
        console.log("Message:", error.message);

        throw error;

    }

};
/**
 * Get Available Data Plans
 */
const getDataPlans = async () => {

    try {

        const url =
            `${BASE_URL}/APIDatabundlePlansV2.asp` +
            `?UserID=${USER_ID}`;

        console.log("==================================");
        console.log("Fetching Data Plans...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Data Plans:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== DATA PLANS ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};
/**
 * Query Transaction
 */
const queryTransaction = async ({ requestId }) => {

    try {

        const url =
            `${BASE_URL}/APIQueryV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}` +
            `&RequestID=${requestId}`;

        console.log("==================================");
        console.log("Querying Transaction...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Query Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== QUERY ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};

module.exports = {
    getWalletBalance,
    buyAirtime,
    buyData,
    queryTransaction,
    getDataPlans,
};