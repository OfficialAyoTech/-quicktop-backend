class ProviderResponse {

    static airtime(payload, providerResponse, reference) {

        console.log("✅ NEW ProviderResponse.airtime() is running");

        return {
            reference,
            service: "AIRTIME",
            provider: "ClubKonnect",
            network: payload.network,
            phone: payload.phone,
            amount: Number(payload.amount),
            status: "PENDING"
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
            status: "PENDING"
        };

    }

static electricity(payload, providerResponse, reference) {

    return {
        reference,
        service: "ELECTRICITY",
        provider: "ClubKonnect",
        electricCompany: payload.electricCompany,
        meterType: payload.meterType,
        meterNo: payload.meterNo,
        amount: Number(payload.amount),
        phone: payload.phone,
        status: "PENDING"
    };

}

static cable(payload, providerResponse, reference) {

    return {
        reference,
        service: "CABLE_TV",
        provider: "ClubKonnect",
        cableTv: payload.cableTv,
        package: payload.package,
        smartCardNo: payload.smartCardNo,
        amount: Number(payload.amount),
        phone: payload.phone,
        status: "PENDING"
    };

}

}

module.exports = ProviderResponse;