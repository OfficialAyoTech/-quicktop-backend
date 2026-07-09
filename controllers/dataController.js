const buyData = async (req, res) => {
    const { network, phone, plan } = req.body;

    if (!network || !phone || !plan) {
        return res.status(400).json({
            success: false,
            message: "Please provide network, phone and plan."
        });
    }

    res.json({
        success: true,
        message: "Data purchase request received successfully.",
        user: req.user.email,
        data: {
            network,
            phone,
            plan
        }
    });
};

module.exports = {
    buyData
};