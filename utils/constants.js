const TRANSACTION_STATUS = {
    PENDING: "pending",
    SUCCESS: "successful",
    FAILED: "failed",
    REVERSED: "reversed"
};

const WALLET_TYPES = {
    CREDIT: "credit",
    DEBIT: "debit"
};

const PAYMENT_SOURCES = {
    PAYSTACK: "PAYSTACK",
    WALLET: "WALLET",
    REFUND: "REFUND"
};

const SERVICES = {
    WALLET_FUNDING: "WALLET_FUNDING",
    AIRTIME: "AIRTIME",
    DATA: "DATA",
    TRANSFER: "TRANSFER"
};

module.exports = {
    TRANSACTION_STATUS,
    WALLET_TYPES,
    PAYMENT_SOURCES,
    SERVICES
};