const KycModel = require("../models/kycModel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

class KycService {

    /**
     * Submit or Update KYC
     */
    static async submit(userId, payload, files) {

        const existing =
            await KycModel.findByUserId(userId);

        let idImageUrl =
            existing?.id_image_url || null;

        let selfieUrl =
            existing?.selfie_url || null;

        // Upload ID Card
        if (files?.id_image?.[0]) {

            idImageUrl =
                await uploadToCloudinary(
    files.id_image[0].buffer,
    `kyc/id-${userId}`
);

        }

        // Upload Selfie
        if (files?.selfie?.[0]) {

            selfieUrl =
                await uploadToCloudinary(
                    files.selfie[0].buffer,
                    `kyc/selfie-${userId}`
                );

        }

        const data = {

            ...payload,

            user_id: userId,

            id_image_url: idImageUrl,

            selfie_url: selfieUrl

        };

        if (!existing) {

            return await KycModel.create(data);

        }

        return await KycModel.update(
            userId,
            data
        );

    }

    /**
     * Get User KYC
     */
    static async get(userId) {

        const kyc =
            await KycModel.findByUserId(userId);

        if (!kyc) {

    throw new Error(
        "KYC record not found."
    );

}

        return kyc;

    }

}

module.exports = KycService;