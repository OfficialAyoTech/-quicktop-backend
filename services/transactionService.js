const TransactionModel = require("../models/transactionModel");
const pool = require("../config/database");
const {
    buyAirtime,
    buyData,
    getWalletBalance,
    queryTransaction,
    buyElectricity,
    verifyMeter,
    verifyCable,
    buyCable
} = require("./clubkonnectService");
const WalletService = require("./walletService");
const ProviderResponse = require("../helpers/providerResponse");
const generateReference = require("../utils/referenceGenerator");
const NETWORKS = require("../utils/networkCodes");
const {
    ELECTRICITY_COMPANIES,
    METER_TYPES
} = require("../utils/electricityCodes");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const DatabaseTransaction = require("../helpers/databaseTransaction");
const TransactionStatusService = require("./transactionStatusService");

const { CABLE_TV } = require("../utils/cableProviders");
const CABLE_PACKAGES = require("../utils/cablePackages");
const NotificationService = require("./notificationService");
const notificationTemplates = require("../utils/notificationTemplates");
const PinService = require("./pinService");
const ServiceStatusService = require("./serviceStatusService");
const { buyWaec } = require("./vtpassService");

const {
    SERVICES,
    TRANSACTION_STATUS,
    PAYMENT_SOURCES
} = require("../utils/constants");

class TransactionService {

    /**
 * Purchase Airtime
 */
static async purchaseAirtime(userId, payload) {

    console.log("🔥 TRANSACTION SERVICE CALLED");
    console.log("🔥 NEW PURCHASE AIRTIME FUNCTION");

    console.log("========== AIRTIME PAYLOAD ==========");
console.log(payload);

const {
    network,
    phone,
    amount,
    pin
} = payload;

console.log("PIN RECEIVED:", pin);

await ServiceStatusService.assertEnabled(SERVICES.AIRTIME);

await PinService.verifyPin(
    userId,
    pin
);

    const networkCode = NETWORKS[network.toUpperCase()];

    if (!networkCode) {
        throw new BadRequestError("Invalid network.");
    }

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

    const updatedWallet = await WalletService.debitWithClient(
        userId,
        {
            amount,
            source: PAYMENT_SOURCES.WALLET,
            service: SERVICES.AIRTIME,
            reference,
            description: `Airtime purchase for ${phone}`
        },
        client
    );

    await TransactionModel.create(
        {
            user_id: userId,
            reference,
            provider: "ClubKonnect",
            service: SERVICES.AIRTIME,
            phone,
            amount,
            status: TRANSACTION_STATUS.PENDING,
            network,
            balance_after: updatedWallet.balance,
            api_response: {}
        },
        client
    );

    try {

    
             const response = await buyAirtime({
                network: networkCode,
                amount,
                phone,
                requestId: reference
            });

            console.log("========== AIRTIME PROVIDER RESPONSE ==========");
console.log(response);

            if (response.status === "INSUFFICIENT_BALANCE") {

    await WalletService.creditWithClient(
        userId,
        {
            amount,
            source: PAYMENT_SOURCES.REFUND,
            service: SERVICES.AIRTIME,
            reference: `${reference}-REFUND`,
            description: "Refund for failed airtime purchase"
        },
        client
    );

    await TransactionModel.updateStatus(
        reference,
        "FAILED",
        response,
        client
    );

    const notification =
    TransactionStatusService.getNotification(
        {
            service: SERVICES.AIRTIME,
            amount,
            phone,
            network,
            reference
        },
        "FAILED"
    );

await NotificationService.notify({
    user_id: userId,
    title: notification.title,
    message: notification.message,
    type: "FAILED",
    category: "purchase",
    metadata: {
        reference,
        amount,
        service: SERVICES.AIRTIME
    }
});

    return {
        success: false,
        reference,
        message:
            "Airtime service is temporarily unavailable. Please try again in a few minutes. If the issue persists, kindly contact support."
    };
}

           await TransactionModel.updateStatus(
    reference,
    TRANSACTION_STATUS.PENDING,
    response,
    client
);

setImmediate(async () => {
    try {
        await TransactionStatusService.check(
            reference,
            userId,
            amount
        );
    } catch (error) {
        console.error("BACKGROUND CHECK FAILED:", error);
    }
});

return {
    success: true,
    message: "Your transaction is being processed.",
    reference,
    wallet: {
        balance: updatedWallet.balance
    },
    response: ProviderResponse.airtime(
        {
            network,
            phone,
            amount
        },
        response,
        reference
    )
};

        } catch (error) {

    console.error(error);

    await WalletService.creditWithClient(
        userId,
        {
            amount,
            source: "REFUND",
            service: "AIRTIME",
            reference: `${reference}-REFUND`,
            description: "Refund for failed airtime purchase"
        },
        client
    );

    await TransactionModel.updateStatus(
        reference,
        "FAILED",
        {
            error: error.response?.data || error.message
        },
        client
    );

    throw error;

}

});

}

        /**
 * Purchase Data
 */
static async purchaseData(userId, payload) {

    const {
        network,
        phone,
        plan,
        pin
    } = payload;

    await ServiceStatusService.assertEnabled(SERVICES.DATA);

    await PinService.verifyPin(
        userId,
        pin
    );

    const networkCode = NETWORKS[network.toUpperCase()];

    if (!networkCode) {
        throw new BadRequestError("Invalid network.");
    }

    // SECURITY: never trust a client-supplied price. Look up the real
    // sell price server-side using the plan code the client sent.
        const planResult = await pool.query(
        `SELECT plan_id, plan_code, cost_price, sell_price, is_active, is_promotional
         FROM data_plans
         WHERE network = $1 AND plan_code = $2`,
        [network.toUpperCase(), plan]
    );

    const planRow = planResult.rows[0];

    if (!planRow || !planRow.is_active) {
        throw new BadRequestError("Invalid or unavailable data plan.");
    }

    const amount = Number(planRow.sell_price);
    const margin = planRow.is_promotional
        ? null
        : Number(planRow.sell_price) - Number(planRow.cost_price);

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

        // Debit wallet
        const updatedWallet = await WalletService.debitWithClient(
            userId,
            {
                amount,
                source: PAYMENT_SOURCES.WALLET,
                service: SERVICES.DATA,
                reference,
                description: `Data purchase for ${phone}`
            },
            client
        );

        // Save pending transaction
                await TransactionModel.create(
            {
                user_id: userId,
                reference,
                provider: "ClubKonnect",
                service: SERVICES.DATA,
                phone,
                amount,
                status: TRANSACTION_STATUS.PENDING,
                network,
                balance_after: updatedWallet.balance,
                api_response: {},
                margin
            },
            client
        );

        try {

            const response = await buyData({
                network: networkCode,
                plan,
                phone,
                requestId: reference
            });

            if (response.status === "INSUFFICIENT_BALANCE") {

    await WalletService.creditWithClient(
        userId,
        {
            amount,
            source: PAYMENT_SOURCES.REFUND,
            service: SERVICES.DATA,
            reference: `${reference}-REFUND`,
            description: "Refund for failed data purchase"
        },
        client
    );

    await TransactionModel.updateStatus(
        reference,
        TRANSACTION_STATUS.FAILED,
        response,
        client
    );

    await NotificationService.notify({
    user_id: userId,
    title: "❌ Data Purchase Failed",
    message:
        `Your data purchase of ₦${amount} could not be completed. Your wallet has been refunded.`,
    type: "FAILED",
    category: "purchase",
    metadata: {
        reference,
        amount,
        service: SERVICES.DATA
    }
});

    return {
        success: false,
        reference,
        message:
            "Data service is temporarily unavailable. Please try again in a few minutes. If the issue persists, kindly contact support."
    };
}

            console.log("========== BUY DATA RESPONSE ==========");
            console.log(response);

            // Provider accepted the request.
// Don't wait for final confirmation.
// Mark as PENDING and return immediately.

await TransactionModel.updateStatus(
    reference,
    TRANSACTION_STATUS.PENDING,
    response,
    client
);

setImmediate(async () => {
    try {
        await TransactionStatusService.check(
            reference,
            userId,
            amount
        );
    } catch (error) {
        console.error(
            "BACKGROUND CHECK FAILED:",
            error
        );
    }
});

return {
    success: true,
    message: "Your transaction is being processed.",
    reference,
    wallet: {
        balance: updatedWallet.balance
    },
    response: ProviderResponse.data(
        {
            network,
            phone,
            plan
        },
        response,
        reference
    )
};

        } catch (error) {

            console.error(error);

            await WalletService.creditWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.REFUND,
                    service: SERVICES.DATA,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed data purchase"
                },
                client
            );

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.FAILED,
                {
                    error: error.response?.data || error.message
                },
                client
            );

            throw error;

        }

    });

}
/**
 * Verify Electricity Meter
 */
static async verifyMeter(payload) {

    const {
        electricCompany,
        meterType,
        meterNo
    } = payload;

    const companyCode =
        ELECTRICITY_COMPANIES[electricCompany.toUpperCase()];

    const meterTypeCode =
        METER_TYPES[meterType.toUpperCase()];

    if (!companyCode) {
        throw new BadRequestError(
            "Invalid electricity company."
        );
    }

    if (!meterTypeCode) {
        throw new BadRequestError(
            "Invalid meter type."
        );
    }

    return await verifyMeter({
        electricCompany: companyCode,
        meterType: meterTypeCode,
        meterNo
    });

}
/**
 * Verify Cable Smart Card
 */
static async verifyCable(payload) {

    const {
        cableTv,
        smartCardNo
    } = payload;

    console.log("========== VERIFY CABLE ==========");
console.log("Payload:", payload);
console.log("CABLE_TV:", CABLE_TV);
console.log("cableTv:", cableTv);

    const cableCode =
        CABLE_TV[cableTv.toUpperCase()];

    if (!cableCode) {
        throw new BadRequestError(
            "Invalid cable TV provider."
        );
    }

    return await verifyCable({
        cableTv: cableCode,
        smartCardNo
    });

}
/**
 * Purchase Electricity
 */
static async purchaseElectricity(userId, payload) {

    const {
        electricCompany,
        meterType,
        meterNo,
        amount,
        phone,
        pin
    } = payload;

    await ServiceStatusService.assertEnabled(SERVICES.ELECTRICITY);

    await PinService.verifyPin(userId, pin);

    const companyCode =
        ELECTRICITY_COMPANIES[electricCompany.toUpperCase()];

    const meterTypeCode =
        METER_TYPES[meterType.toUpperCase()];

    if (!companyCode) {
        throw new BadRequestError("Invalid electricity company.");
    }

    if (!meterTypeCode) {
        throw new BadRequestError("Invalid meter type.");
    }

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

        // Debit wallet
        const updatedWallet =
            await WalletService.debitWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.WALLET,
                    service: SERVICES.ELECTRICITY,
                    reference,
                    description: `Electricity purchase for meter ${meterNo}`
                },
                client
            );

        // Save transaction
        await TransactionModel.create(
            {
                user_id: userId,
                reference,
                provider: "ClubKonnect",
                service: SERVICES.ELECTRICITY,
                phone,
                amount,
                status: TRANSACTION_STATUS.PENDING,
                network: electricCompany,
                balance_after: updatedWallet.balance,
                api_response: {}
            },
            client
        );

        try {

            const response =
                await buyElectricity({

                    electricCompany: companyCode,
                    meterType: meterTypeCode,
                    meterNo,
                    amount,
                    phone,
                    requestId: reference

                });

            if (response.status === "INSUFFICIENT_BALANCE") {

                await WalletService.creditWithClient(
                    userId,
                    {
                        amount,
                        source: PAYMENT_SOURCES.REFUND,
                        service: SERVICES.ELECTRICITY,
                        reference: `${reference}-REFUND`,
                        description: "Refund for failed electricity purchase"
                    },
                    client
                );

                await TransactionModel.updateStatus(
                    reference,
                    TRANSACTION_STATUS.FAILED,
                    response,
                    client
                );

                const notification =
    notificationTemplates[SERVICES.ELECTRICITY].FAILED({
        amount
    });

await NotificationService.notify({
    user_id: userId,
    title: notification.title,
    message: notification.message,
    type: "FAILED",
    category: "purchase",
    metadata: {
        reference,
        amount,
        service: SERVICES.ELECTRICITY
    }
});

                return {
                    success: false,
                    reference,
                    message:
                        "Electricity service is temporarily unavailable. Please try again later."
                };

            }

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.PENDING,
                response,
                client
            );

            setImmediate(async () => {
    try {
        await TransactionStatusService.check(
            reference,
            userId,
            amount
        );
    } catch (error) {
        console.error(
            "BACKGROUND CHECK FAILED:",
            error
        );
    }
});

            return {
    success: true,
    message: "Electricity purchase is being processed.",
    reference,
    wallet: {
        balance: updatedWallet.balance
    },
    response: ProviderResponse.electricity(
        {
            electricCompany,
            meterType,
            meterNo,
            amount,
            phone
        },
        response,
        reference
    )
};

        } catch (error) {

            await WalletService.creditWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.REFUND,
                    service: SERVICES.ELECTRICITY,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed electricity purchase"
                },
                client
            );

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.FAILED,
                {
                    error: error.response?.data || error.message
                },
                client
            );

            throw error;

        }

    });

}
/**
 * Purchase Cable TV
 */
static async purchaseCable(userId, payload) {

    const {
        cableTv,
        package: cablePackage,
        smartCardNo,
        phone,
        pin
    } = payload;

    await ServiceStatusService.assertEnabled(SERVICES.CABLE_TV);

    await PinService.verifyPin(userId, pin);

    const cableCode =
        CABLE_TV[cableTv.toUpperCase()];

    if (!cableCode) {
        throw new BadRequestError(
            "Invalid cable TV provider."
        );
    }

    const packageCode =
        CABLE_PACKAGES[cableTv.toUpperCase()]?.[
            cablePackage.toUpperCase()
        ];

    if (!packageCode) {
        throw new BadRequestError(
            "Invalid cable package."
        );
    }

    // SECURITY: never trust a client-supplied price. Look up the real
    // sell price server-side using the package code Clubkonnect expects.
        const packageResult = await pool.query(
        `SELECT package_code, cost_price, sell_price, is_active, is_promotional
         FROM cable_packages
         WHERE package_code = $1`,
        [packageCode]
    );

    const packageRow = packageResult.rows[0];

    if (!packageRow || !packageRow.is_active) {
        throw new BadRequestError("Invalid or unavailable cable package.");
    }

    const amount = Number(packageRow.sell_price);
    const margin = packageRow.is_promotional
        ? null
        : Number(packageRow.sell_price) - Number(packageRow.cost_price);

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

        // Debit wallet
        const updatedWallet =
            await WalletService.debitWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.WALLET,
                    service: SERVICES.CABLE_TV,
                    reference,
                    description: `Cable subscription for ${smartCardNo}`
                },
                client
            );

        // Save transaction
        await TransactionModel.create(
            {
                user_id: userId,
                reference,
                provider: "ClubKonnect",
                service: SERVICES.CABLE_TV,
                phone,
                amount,
                status: TRANSACTION_STATUS.PENDING,
                network: cableTv,
                balance_after: updatedWallet.balance,
                api_response: {}
            },
            client
        );

        try {

console.log("Provider:", cableTv);
console.log("Package Selected:", cablePackage);
console.log("Package Code:", packageCode);

            const response =
    await buyCable({

        cableTv: cableCode,
        packageCode,
        smartCardNo,
        phone,
        requestId: reference

    });

            if (response.status === "INSUFFICIENT_BALANCE") {

                await WalletService.creditWithClient(
                    userId,
                    {
                        amount,
                        source: PAYMENT_SOURCES.REFUND,
                        service: SERVICES.CABLE_TV,
                        reference: `${reference}-REFUND`,
                        description: "Refund for failed cable purchase"
                    },
                    client
                );

                await TransactionModel.updateStatus(
                    reference,
                    TRANSACTION_STATUS.FAILED,
                    response,
                    client
                );

                const notification =
    notificationTemplates[SERVICES.CABLE_TV].FAILED({
        amount
    });

await NotificationService.notify({
    user_id: userId,
    title: notification.title,
    message: notification.message,
    type: "FAILED",
    category: "purchase",
    metadata: {
        reference,
        amount,
        service: SERVICES.CABLE_TV
    }
});

                return {
                    success: false,
                    reference,
                    message:
                        "Cable TV service is temporarily unavailable."
                };

            }

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.PENDING,
                response,
                client
            );

            setImmediate(async () => {
    try {
        await TransactionStatusService.check(
            reference,
            userId,
            amount
        );
    } catch (error) {
        console.error("BACKGROUND CHECK FAILED:", error);
    }
});

            return {
                success: true,
                message: "Cable subscription is being processed.",
                reference,
                wallet: {
                    balance: updatedWallet.balance
                },
                response: ProviderResponse.cable(
                    {
                        cableTv,
                        package: cablePackage,
                        smartCardNo,
                        amount,
                        phone
                    },
                    response,
                    reference
                )
            };

        } catch (error) {

            await WalletService.creditWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.REFUND,
                    service: SERVICES.CABLE_TV,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed cable purchase"
                },
                client
            );

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.FAILED,
                {
                    error: error.response?.data || error.message
                },
                client
            );

            throw error;

        }

    });

}
/**
 * Purchase WAEC Result Checker PIN
 */
static async purchaseWaec(userId, payload) {

    const {
        phone,
        pin
    } = payload;

    await ServiceStatusService.assertEnabled(SERVICES.WAEC);

    await PinService.verifyPin(userId, pin);

    // SECURITY: never trust a client-supplied price. There's only ever
    // one active WAEC product right now, so just pull the current row.
    const packageResult = await pool.query(
        `SELECT variation_code, sell_price, is_active
         FROM waec_packages
         WHERE is_active = true
         ORDER BY id
         LIMIT 1`
    );

    const packageRow = packageResult.rows[0];

    if (!packageRow) {
        throw new BadRequestError(
            "WAEC Result Checker PIN is currently unavailable."
        );
    }

    const amount = Number(packageRow.sell_price);

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

        // Debit wallet
        const updatedWallet =
            await WalletService.debitWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.WALLET,
                    service: SERVICES.WAEC,
                    reference,
                    description: `WAEC Result Checker PIN for ${phone}`
                },
                client
            );

        // Save transaction
        await TransactionModel.create(
            {
                user_id: userId,
                reference,
                provider: "VTpass",
                service: SERVICES.WAEC,
                phone,
                amount,
                status: TRANSACTION_STATUS.PENDING,
                balance_after: updatedWallet.balance,
                api_response: {}
            },
            client
        );

        try {

            const response = await buyWaec({
                requestId: reference,
                phone,
                variationCode: packageRow.variation_code,
                quantity: 1
            });

            // VTpass's /api/pay for WAEC is synchronous — code "000" plus
            // content.transactions.status tells us the real outcome
            // immediately. There is no shared background requery wired
            // up for VTpass (TransactionStatusService.check only knows
            // how to query ClubKonnect), so success/failure is resolved
            // directly from this response instead of routing through it.
            const txStatus = response?.content?.transactions?.status;
            const delivered = response?.code === "000" && txStatus === "delivered";
            const pending = response?.code === "000" && txStatus === "pending";

            if (!delivered && !pending) {

                await WalletService.creditWithClient(
                    userId,
                    {
                        amount,
                        source: PAYMENT_SOURCES.REFUND,
                        service: SERVICES.WAEC,
                        reference: `${reference}-REFUND`,
                        description: "Refund for failed WAEC purchase"
                    },
                    client
                );

                await TransactionModel.updateStatus(
                    reference,
                    TRANSACTION_STATUS.FAILED,
                    response,
                    client
                );

                const notification =
                    notificationTemplates[SERVICES.WAEC].FAILED({
                        amount
                    });

                await NotificationService.notify({
                    user_id: userId,
                    title: notification.title,
                    message: notification.message,
                    type: "FAILED",
                    category: "purchase",
                    metadata: {
                        reference,
                        amount,
                        service: SERVICES.WAEC
                    }
                });

                return {
                    success: false,
                    reference,
                    message: "WAEC Result Checker PIN purchase failed."
                };

            }

            await TransactionModel.updateStatus(
                reference,
                delivered ? TRANSACTION_STATUS.SUCCESS : TRANSACTION_STATUS.PENDING,
                response,
                client
            );

            if (delivered) {

                const notification =
                    notificationTemplates[SERVICES.WAEC].SUCCESS({
                        amount
                    });

                await NotificationService.notify({
                    user_id: userId,
                    title: notification.title,
                    message: notification.message,
                    type: "SUCCESS",
                    category: "purchase",
                    metadata: {
                        reference,
                        amount,
                        service: SERVICES.WAEC
                    }
                });

            }

            const card = response?.cards?.[0];

            return {
                success: true,
                message: delivered
                    ? "WAEC Result Checker PIN purchased successfully."
                    : "WAEC Result Checker PIN purchase is being processed.",
                reference,
                pin: card ? { serial: card.Serial, pin: card.Pin } : null,
                wallet: {
                    balance: updatedWallet.balance
                }
            };

        } catch (error) {

            await WalletService.creditWithClient(
                userId,
                {
                    amount,
                    source: PAYMENT_SOURCES.REFUND,
                    service: SERVICES.WAEC,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed WAEC purchase"
                },
                client
            );

            await TransactionModel.updateStatus(
                reference,
                TRANSACTION_STATUS.FAILED,
                {
                    error: error.response?.data || error.message
                },
                client
            );

            throw error;

        }

    });

}

    /**
 * Record Wallet Funding Transaction
 */
static async recordWalletFunding(
    userId,
    payload,
    client = null
) {

    console.log("🔥 recordWalletFunding() CALLED");
    
    const transaction = await TransactionModel.create(
        {
            user_id: userId,
            reference: payload.reference,
            provider: PAYMENT_SOURCES.PAYSTACK,
service: SERVICES.WALLET_FUNDING,
phone: null,
amount: payload.amount,
status: TRANSACTION_STATUS.SUCCESS,
            balance_after: payload.balance_after,
            api_response: payload.api_response || {}
        },
        client
    );

    await NotificationService.notify({
        user_id: userId,
        title: "💰 Wallet Funded",
        message: `₦${payload.amount} has been added to your wallet successfully.`,
        type: "SUCCESS",
        category: "wallet",
        metadata: {
            reference: payload.reference,
            amount: payload.amount
        }
    });

    return transaction;

}
        /**
     * Get all transactions
     */
    static async getTransactions(userId, query = {}) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const offset = (page - 1) * limit;

        return await TransactionModel.getTransactions(userId, {
            service: query.service,
            status: query.status,
            limit,
            offset
        });

    }

    /**
 * Query ClubKonnect Transaction
 */
static async queryTransaction(reference) {

    const response = await queryTransaction({
        requestId: reference
    });

    let status = "PENDING";

if (
    response.statuscode === "200" ||
    response.status === "ORDER_COMPLETED"
) {
    status = "SUCCESS";
} else if (
    response.status &&
    (
        response.status.toUpperCase().includes("FAILED") ||
        response.status.toUpperCase().includes("REJECT") ||
        response.status.toUpperCase().includes("CANCEL")
    )
) {
    status = "FAILED";
}

    await TransactionModel.updateStatus(
        reference,
        status,
        response
    );

    return response;

}

    /**
     * Get transaction by reference
     */
    static async getTransaction(userId, reference) {

        const transaction =
            await TransactionModel.findByReference(reference);

        if (!transaction) {
            throw new NotFoundError("Transaction not found.");
        }

        if (String(transaction.user_id) !== String(userId)) {
   throw new ForbiddenError(
       "Unauthorized access to transaction."
   );
}

        return transaction;

    }

}

module.exports = TransactionService;