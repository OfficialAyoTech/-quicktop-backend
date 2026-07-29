const UserModel = require("../models/userModel");
const PinService = require("./pinService");
const NotFoundError = require("../errors/NotFoundError");

class ProfileService {

    /**
     * Get user profile
     */
    static async getProfile(userId) {

        const user = await UserModel.findById(userId);

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        const pinStatus = await PinService.getStatus(userId);

        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
            security: pinStatus
        };

    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, payload) {

        const user = await UserModel.findById(userId);

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        const updatedUser =
            await UserModel.updateProfile(
                userId,
                payload
            );

        return {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            is_verified: updatedUser.is_verified,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
        };

    }

}

module.exports = ProfileService;