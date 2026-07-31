const crypto = require("crypto");

const UserModel = require("../models/userModel");
const ReferralModel = require("../models/referralModel");
const NotFoundError = require("../errors/NotFoundError");

class ReferralService {

    /**
     * Generate unique referral code
     */
    static async generateReferralCode(userId) {

        let code;
        let exists;

        do {

            code =
                "QT" +
                crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase();

            exists =
                await UserModel.findByReferralCode(code);

        } while (exists);

        await UserModel.updateReferralCode(
            userId,
            code
        );

        return code;

    }

    /**
     * Get referral dashboard
     */
    static async getReferralDashboard(userId) {

        const user =
            await UserModel.findById(userId);

        if (!user) {
            throw new NotFoundError(
                "User not found."
            );
        }

        let referralCode =
            user.referral_code;

        if (!referralCode) {

            referralCode =
                await this.generateReferralCode(
                    userId
                );

        }

        const referrals =
            await ReferralModel.findByReferrer(
                userId
            );

        const totalReferrals =
            await ReferralModel.count(
                userId
            );

        return {

            referral_code:
                referralCode,

            referral_link:
                `https://quicktop.app/signup?ref=${referralCode}`,

            total_referrals:
                totalReferrals,

            total_earnings:
                Number(
                    user.referral_earnings || 0
                ),

            referrals

        };

    }

}

module.exports = ReferralService;