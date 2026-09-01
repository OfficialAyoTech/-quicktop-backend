require("dotenv").config();

const EricoDataService = require("../services/EricoDataService");

async function test() {
  try {
    console.log("Testing ERICODATA...\n");

    // 1. Check provider wallet
    console.log("1️⃣ Checking ERICODATA wallet...");
    const balance = await EricoDataService.getBalance();

    console.log("Balance response:");
    console.log(JSON.stringify(balance, null, 2));

    // 2. Get MTN plans
    console.log("\n2️⃣ Getting MTN plans...");
    const plansResponse = await EricoDataService.getPlans("mtn");

    console.log("MTN plans retrieved.");

    const plans = plansResponse.plans || [];

    console.log(`Total MTN plans: ${plans.length}`);

    // Show selected plan
    const testPlan = plans.find(
      (plan) =>
        Number(plan.id) === 298 &&
        plan.network === "MTN"
    );

    if (!testPlan) {
      throw new Error("Test plan ID 298 was not found.");
    }

    console.log("\nSelected test plan:");
    console.log(JSON.stringify(testPlan, null, 2));

    console.log("\n✅ ERICODATA connection successful!");
    console.log("✅ Wallet endpoint working!");
    console.log("✅ Plans endpoint working!");
    console.log("✅ Plan ID 298 confirmed!");

  } catch (error) {
    console.error("\n❌ ERICODATA test failed");

    console.error("Message:", error.message);
    console.error("Status:", error.statusCode);
    console.error("Code:", error.code);

    if (error.providerResponse) {
      console.error(
        "Provider response:",
        JSON.stringify(error.providerResponse, null, 2)
      );
    }

    process.exit(1);
  }
}

test();