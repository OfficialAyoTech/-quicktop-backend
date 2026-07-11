const TransactionService = require("../services/transactionService");

const purchaseAirtime = async (req, res) => {
  try {
    const { network, phone, amount } = req.body;

    // Basic validation
    if (!network || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Network, phone and amount are required.",
      });
    }

    // Delegate the entire purchase flow to the service layer
    const result = await TransactionService.purchaseAirtime(req.user.uid, {
      network,
      phone,
      amount,
    });

    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.success
        ? "Airtime purchased successfully."
        : "Airtime purchase failed.",
      reference: result.reference,
      data: result.response,
    });
  } catch (error) {
    console.error("AIRTIME PURCHASE ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Airtime purchase failed.",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  purchaseAirtime,
};