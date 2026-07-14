class ProviderResponse {

    static airtime(payload, providerResponse, reference) {

        return {
            reference,
            service: "AIRTIME",
            provider: "ClubKonnect",
            network: payload.network,
            phone: payload.phone,
            amount: Number(payload.amount),
            status:
                providerResponse.statuscode === "100"
                    ? "SUCCESS"
                    : "FAILED"
        };

    }

    static data(payload, providerResponse, reference) {

        return {
            reference,
            service: "DATA",
            provider: "ClubKonnect",
            network: payload.network,
            phone: payload.phone,
            plan: payload.plan,
            status:
                providerResponse.statuscode === "100"
                    ? "SUCCESS"
                    : "FAILED"
        };

    }

}

module.exports = ProviderResponse;