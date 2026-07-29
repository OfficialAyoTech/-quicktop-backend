const notificationTemplates = {

    "Wallet Funding": {

        SUCCESS: ({ amount }) => ({
            title: "💰 Wallet Funded",
            message: `Your wallet has been credited with ₦${amount}.`
        })

    },

    "Airtime": {

        SUCCESS: ({ amount, phone, network }) => ({
            title: "📱 Airtime Purchase Successful",
            message: `₦${amount} ${network} airtime was successfully sent to ${phone}.`
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Airtime Purchase Failed",
            message: `Your airtime purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    "Data": {

        SUCCESS: ({ phone, network }) => ({
            title: "📶 Data Purchase Successful",
            message: `Your ${network} data subscription for ${phone} was completed successfully.`
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Data Purchase Failed",
            message: `Your data purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    "Electricity": {

        SUCCESS: () => ({
            title: "⚡ Electricity Purchase Successful",
            message: "Your electricity token purchase was completed successfully."
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Electricity Purchase Failed",
            message: `Your electricity purchase failed. ₦${amount} has been refunded to your wallet.`
        })

    },

    "Cable TV": {

        SUCCESS: () => ({
            title: "📺 Cable Subscription Successful",
            message: "Your cable subscription has been activated successfully."
        }),

        FAILED: ({ amount }) => ({
            title: "❌ Cable Subscription Failed",
            message: `Your cable subscription failed. ₦${amount} has been been refunded to your wallet.`
        })

    }

};

module.exports = notificationTemplates;