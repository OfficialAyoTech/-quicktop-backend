const httpClient = require("../utils/httpClient");

const BASE_URL = process.env.VTPASS_BASE_URL;
const API_KEY = process.env.VTPASS_API_KEY;
const PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY;
const SECRET_KEY = process.env.VTPASS_SECRET_KEY;

/**
 * Get WAEC variation codes (GET request — api-key + public-key headers)
 */
const getWaecVariations = async () => {

    try {

        const url = `${BASE_URL}/api/service-variations?serviceID=waec`;

        console.log("==================================");
        console.log("Fetching WAEC variations...");

        const response = await httpClient.get(url, {
            headers: {
                "api-key": API_KEY,
                "public-key": PUBLIC_KEY
            }
        });

        console.log("WAEC Variations Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== VTPASS WAEC VARIATIONS ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Body:", error.response?.data);
        console.log("Message:", error.message);

        throw error;

    }

};

/**
 * Buy WAEC Result Checker PIN (POST request — api-key + secret-key headers)
 */
const buyWaec = async ({
    requestId,
    phone,
    variationCode = "waecdirect",
    quantity = 1
}) => {

    try {

        const url = `${BASE_URL}/api/pay`;

        console.log("==================================");
        console.log("Buying WAEC Result Checker PIN...");

        const response = await httpClient.post(
            url,
            {
                request_id: requestId,
                serviceID: "waec",
                variation_code: variationCode,
                quantity,
                phone
            },
            {
                headers: {
                    "api-key": API_KEY,
                    "secret-key": SECRET_KEY
                }
            }
        );

        console.log("WAEC Purchase Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== VTPASS WAEC PURCHASE ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Body:", error.response?.data);
        console.log("Message:", error.message);

        throw error;

    }

};

/**
 * Query WAEC transaction status (POST request — api-key + secret-key headers)
 * Used as a fallback if a purchase call itself times out or errors, so we
 * can check with VTpass whether it actually went through before deciding
 * whether it's safe to refund the customer.
 */
const queryWaecTransaction = async ({ requestId }) => {

    try {

        const url = `${BASE_URL}/api/requery`;

        console.log("==================================");
        console.log("Querying WAEC transaction...");

        const response = await httpClient.post(
            url,
            { request_id: requestId },
            {
                headers: {
                    "api-key": API_KEY,
                    "secret-key": SECRET_KEY
                }
            }
        );

        console.log("WAEC Query Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== VTPASS WAEC QUERY ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};

module.exports = {
    getWaecVariations,
    buyWaec,
    queryWaecTransaction
};