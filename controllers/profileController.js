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

module.exports = {
    getProfile,
    updateProfile
};