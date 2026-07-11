require("dotenv").config();

const { buyAirtime } = require("../services/clubkonnectService");
const generateReference = require("../utils/referenceGenerator");

async function test() {
  try {
    const result = await buyAirtime({
      network: "01", // MTN
      amount: 50,
      phone: "07064819881", // Replace with your own number
      requestId: generateReference(),
      callbackUrl: "",
    });

    console.log("========== SUCCESS ==========");
    console.log(result);

  } catch (error) {
    console.error("========== FAILED ==========");
    console.error(error.response?.data || error.message);
  }
}

test();