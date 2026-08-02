const cloudinary = require("../config/cloudinary");
const ProfileService = require("../services/profileService");
const ApiResponse = require("../helpers/apiResponse");

/**
 * Upload a buffer (from Multer memoryStorage) to Cloudinary via a stream,
 * since there's no file path on disk to upload from.
 */
function uploadBufferToCloudinary(buffer, userId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktop/avatars",
                public_id: `user-${userId}`,
                overwrite: true,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
}

/**
 * Upload Avatar
 */
const uploadAvatar = async (req, res) => {

    try {

        if (!req.file) {
            return ApiResponse.error(
                res,
                "No image file was uploaded.",
                400
            );
        }

        const result = await uploadBufferToCloudinary(
            req.file.buffer,
            req.user.id
        );

        const profile = await ProfileService.uploadAvatar(
            req.user.id,
            result.secure_url
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
    uploadAvatar
};