const { SERVICES } = require("./constants");

const notificationTemplates = {

    [SERVICES.WALLET_FUNDING]: {

        SUCCESS: ({ amount }) => ({
            title: "💰 Wallet Funded",
            message: `Your wallet has been credited with ₦${amount}.`
        })

    },

    [SERVICES.AIRTIME]: {

        SUCCESS: ({ amount, phone, network }) => ({
            title: "📱 Airtime Purchase Successful",
            message: `₦${amount} ${network} airtime was successfully sent to ${phone}.`
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Airtime Purchase Failed",
            message: `Your airtime purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    [SERVICES.DATA]: {

        SUCCESS: ({ phone, network }) => ({
            title: "📶 Data Purchase Successful",
            message: `Your ${network} data subscription for ${phone} was completed successfully.`
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Data Purchase Failed",
            message: `Your data purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    [SERVICES.ELECTRICITY]: {

        SUCCESS: () => ({
            title: "⚡ Electricity Purchase Successful",
            message: "Your electricity token purchase was completed successfully."
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Electricity Purchase Failed",
            message: `Your electricity purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    [SERVICES.CABLE_TV]: {

        SUCCESS: () => ({
            title: "📺 Cable Subscription Successful",
            message: "Your cable subscription has been activated successfully."
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Cable Subscription Failed",
            message: `Your cable subscription failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    [SERVICES.WAEC]: {

        SUCCESS: () => ({
            title: "🎓 WAEC PIN Purchase Successful",
            message: "Your WAEC Result Checker PIN has been generated successfully."
        }),

        FAILED: ({ amount }) => ({
            title: "❌ WAEC PIN Purchase Failed",
            message: `Your WAEC PIN purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    }

};

module.exports = notificationTemplates;