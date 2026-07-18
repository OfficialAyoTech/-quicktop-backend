const requiredEnv = [
    "DATABASE_URL",

    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",

    "PAYSTACK_SECRET_KEY",
    "PAYSTACK_BASE_URL",

    "CK_USER_ID",
    "CK_API_KEY",
    "CK_BASE"
];

function validateEnv() {

    const missing = requiredEnv.filter(
        (key) => !process.env[key]
    );

    if (missing.length > 0) {

        console.error("");
        console.error("❌ Missing required environment variables:");
        console.error("");

        missing.forEach((env) => {
            console.error(`   - ${env}`);
        });

        console.error("");

        process.exit(1);

    }

    console.log("✅ Environment variables validated.");

}

module.exports = validateEnv;