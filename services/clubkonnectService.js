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

/**
 * Verify Electricity Meter
 */
const verifyMeter = async ({
    electricCompany,
    meterNo,
    meterType
}) => {

    try {

        const url =
            `${BASE_URL}/APIVerifyElectricityV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}` +
            `&ElectricCompany=${electricCompany}` +
`&MeterNo=${meterNo}` +
`&MeterType=${meterType}`;

        console.log("==================================");
        console.log("Verifying Meter...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Meter Verification Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== VERIFY METER ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};

/**
 * Buy Electricity
 */
const buyElectricity = async ({
    electricCompany,
    meterNo,
    meterType,
    amount,
    phone,
    requestId,
    callbackUrl = ""
}) => {

    try {

        const url =
            `${BASE_URL}/APIElectricityV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}` +
           `&ElectricCompany=${electricCompany}` +
`&MeterType=${meterType}` +
`&MeterNo=${meterNo}` +
            `&Amount=${amount}` +
            `&PhoneNo=${phone}` +
            `&RequestID=${requestId}` +
            `&CallBackURL=${encodeURIComponent(callbackUrl)}`;

        console.log("==================================");
        console.log("Buying Electricity...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Electricity Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== ELECTRICITY ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};

/**
 * Verify Cable Smartcard
 */
const verifyCable = async ({
    cableTv,
    smartCardNo
}) => {

    try {

        const url =
            `${BASE_URL}/APIVerifyCableTVV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}` +
            `&CableTV=${cableTv}` +
            `&SmartCardNo=${smartCardNo}`;

        console.log("==================================");
        console.log("Verifying Smartcard...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Cable Verification Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== VERIFY CABLE ERROR ==========");
        console.log(error.response?.data || error.message);

        throw error;

    }

};

/**
 * Purchase Cable TV
 */
const buyCable = async ({
    cableTv,
    packageCode,
    smartCardNo,
    phone,
    requestId,
    callbackUrl = ""
}) => {

    try {

        const url =
            `${BASE_URL}/APICableTVV1.asp` +
            `?UserID=${USER_ID}` +
            `&APIKey=${API_KEY}` +
            `&CableTV=${cableTv}` +
            `&Package=${packageCode}` +
            `&SmartCardNo=${smartCardNo}` +
            `&PhoneNo=${phone}` +
            `&RequestID=${requestId}` +
            `&CallBackURL=${encodeURIComponent(callbackUrl)}`;

        console.log("==================================");
        console.log("Buying Cable TV...");
        console.log(url);

        const response = await httpClient.get(url);

        console.log("Cable Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.log("========== CABLE ERROR ==========");
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

    verifyMeter,
    buyElectricity,

    verifyCable,
    buyCable
};