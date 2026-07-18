const requiredEnv = [
    "DATABASE_URL",
    "FIREBASE_SERVICE_ACCOUNT",
    "PAYSTACK_SECRET_KEY",
    "PAYSTACK_BASE_URL",
    "CK_USER_ID",
    "CK_API_KEY",
    "CK_BASE"
];

function validateEnv() {
    const missing = requiredEnv.filter((key) => !process.env[key]);

    if (missing.length) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((env) => console.error(`- ${env}`));
        process.exit(1);
    }

    console.log("✅ Environment variables validated.");
}

module.exports = validateEnv;