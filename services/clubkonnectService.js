const httpClient = require("../utils/httpClient");

const BASE_URL = process.env.CK_BASE;
const USER_ID = process.env.CK_USER_ID;
const API_KEY = process.env.CK_API_KEY;

const getWalletBalance = async () => {
    try {

        const url =
            `${BASE_URL}/APIWalletBalanceV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}`;

        console.log("Calling URL:", url);

        const response = await httpClient.get(url);

        return response.data;

    } catch (error) {

        console.log("========== CLUBKONNECT ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);
        console.log("Message:", error.message);

        throw error;
    }
};

module.exports = {
    getWalletBalance,
};