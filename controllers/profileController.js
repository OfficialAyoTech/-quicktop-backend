const ProfileService = require("../services/profileService");
const ApiResponse = require("../helpers/apiResponse");

/**
 * Get Profile
 */
const getProfile = async (req, res) => {

    try {

        const profile =
            await ProfileService.getProfile(
                req.user.id
            );

        return ApiResponse.success(
            res,
            "Profile retrieved successfully.",
            profile
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Update Profile
 */
const updateProfile = async (req, res) => {

    try {

        const profile =
            await ProfileService.updateProfile(
                req.user.id,
                req.body
            );

        return ApiResponse.success(
            res,
            "Profile updated successfully.",
            profile
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Delete Account
 */
const deleteAccount = async (req, res) => {

    try {

        const result =
            await ProfileService.deleteAccount(
                req.user.id
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Change Phone Number
 */
const changePhone = async (req, res) => {

    try {

        const result =
            await ProfileService.changePhone(
                req.user.id,
                req.body.phone
            );

        return ApiResponse.success(
            res,
            "Phone number updated successfully.",
            result
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Upload Avatar
 */
const uploadAvatar = async (req, res) => {

    try {

        const profile =
            await ProfileService.uploadAvatar(
                req.user.id,
                req.body.avatar_url
            );

        return ApiResponse.success(
            res,
            "Avatar updated successfully.",
            profile
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

module.exports = {
    getProfile,
    updateProfile,
    changePhone,
    uploadAvatar,
    deleteAccount
};