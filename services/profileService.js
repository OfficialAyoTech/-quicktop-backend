const UserModel = require("../models/userModel");
const PinService = require("./pinService");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");

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
            avatar_url: user.avatar_url,
            is_verified: user.is_verified,
            account_status: user.account_status,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_login: user.last_login,
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
            avatar_url: updatedUser.avatar_url,
            is_verified: updatedUser.is_verified,
            account_status: updatedUser.account_status,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at,
            last_login: updatedUser.last_login
        };

    }

    /**
 * Soft delete account
 */
static async deleteAccount(userId) {

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    if (user.account_status === "DELETED") {
        throw new BadRequestError(
            "Account has already been deleted."
        );
    }

    await UserModel.softDelete(userId);

    return {
        success: true,
        message: "Account deleted successfully."
    };

}

    /**
 * Change phone number
 */
static async changePhone(userId, phone) {

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    const existingUser =
    await UserModel.findByPhone(phone);

if (
    existingUser &&
    existingUser.id !== userId
) {
    throw new BadRequestError(
    "Phone number is already in use."
);

}

    const updatedUser =
        await UserModel.updatePhone(
            userId,
            phone
        );

    return {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        is_verified: updatedUser.is_verified,
        account_status: updatedUser.account_status,
        updated_at: updatedUser.updated_at
    };

}

/**
 * Upload avatar
 */
static async uploadAvatar(userId, avatarUrl) {

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    const updatedUser =
        await UserModel.updateAvatar(
            userId,
            avatarUrl
        );

    return {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        is_verified: updatedUser.is_verified,
        updated_at: updatedUser.updated_at
    };

}

}

module.exports = ProfileService;