const { getDataPlans } = require("./clubkonnectService");

class DataPlansService {

    static async getPlans(network = null) {

        const response = await getDataPlans();

        const networks = response.MOBILE_NETWORK;

        let plans = [];

        for (const networkName in networks) {

            const products = networks[networkName][0].PRODUCT;

            products.forEach(product => {

                plans.push({
                    network: networkName.toUpperCase(),
                    planId: product.PRODUCT_ID,
                    name: product.PRODUCT_NAME,
                    amount: Number(product.PRODUCT_AMOUNT),
                    code: product.PRODUCT_CODE
                });

            });

        }

        if (network) {

            plans = plans.filter(
                p => p.network.toUpperCase() === network.toUpperCase()
            );

        }

        return plans;

    }

}

module.exports = DataPlansService;