const {
    getWalletBalance,
} = require("../services/clubkonnectService");

const walletBalance = async (req, res) => {
    try {

        const balance = await getWalletBalance();

        return res.json({
            success: true,
            provider: "ClubKonnect",
            data: balance,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    walletBalance,
};