const { getDataPlans } = require("./clubKonnectService");

class DataPlansService {

    /**
     * Get all data plans
     */
    static async getPlans(network = null) {

        const plans = await getDataPlans();

        // If no network is provided, return everything
        if (!network) {
            return plans;
        }

        // Filter by network (MTN, AIRTEL, GLO, 9MOBILE)
        return plans.filter(plan =>
            plan.network &&
            plan.network.toUpperCase() === network.toUpperCase()
        );

    }

}

module.exports = DataPlansService;