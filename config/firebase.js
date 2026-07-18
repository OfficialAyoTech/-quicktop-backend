const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

module.exports = getAuth();