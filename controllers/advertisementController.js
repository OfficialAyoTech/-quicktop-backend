const cloudinary = require("../config/cloudinary");
const AdvertisementService = require("../services/advertisementService");
const ApiResponse = require("../helpers/apiResponse");

function uploadBufferToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktop/advertisements",
                public_id: publicId,
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

const createAdvertisement = async (req, res) => {
    try {
        if (!req.file) {
            return ApiResponse.error(res, "An image file is required.", 400);
        }

        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, `ad-${Date.now()}`);
        const result = await AdvertisementService.create(req.body, uploadResult.secure_url, req.user.email);

        return ApiResponse.success(res, "Advertisement created successfully.", result);
    } catch (error) {
        console.error(error);
        return ApiResponse.error(res, error.message, 400);
    }
};

const updateAdvertisement = async (req, res) => {
    try {
        let imageUrl = null;

        if (req.file) {
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, `ad-${req.params.id}-${Date.now()}`);
            imageUrl = uploadResult.secure_url;
        }

        const result = await AdvertisementService.update(req.params.id, req.body, imageUrl);
        return ApiResponse.success(res, "Advertisement updated successfully.", result);
    } catch (error) {
        console.error(error);
        return ApiResponse.error(res, error.message, 400);
    }
};

const toggleAdvertisementActive = async (req, res) => {
    try {
        const result = await AdvertisementService.setActive(req.params.id, req.body.is_active);
        return ApiResponse.success(res, `Advertisement ${result.is_active ? "activated" : "deactivated"} successfully.`, result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const deleteAdvertisement = async (req, res) => {
    try {
        const result = await AdvertisementService.delete(req.params.id);
        return ApiResponse.success(res, result.message);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const getAdvertisementsAdmin = async (req, res) => {
    try {
        const result = await AdvertisementService.listForAdmin(req.query);
        return ApiResponse.success(res, "Advertisements retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const getAdvertisementByIdAdmin = async (req, res) => {
    try {
        const result = await AdvertisementService.findById(req.params.id);
        return ApiResponse.success(res, "Advertisement retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 404);
    }
};

const listActiveAdvertisements = async (req, res) => {
    try {
        const result = await AdvertisementService.listActive(req.user.id);
        return ApiResponse.success(res, "Active advertisements retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const trackAdvertisementImpression = async (req, res) => {
    try {
        const result = await AdvertisementService.incrementImpression(req.params.id);
        return ApiResponse.success(res, "Impression recorded.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const trackAdvertisementClick = async (req, res) => {
    try {
        const result = await AdvertisementService.incrementClick(req.params.id);
        return ApiResponse.success(res, "Click recorded.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

module.exports = {
    createAdvertisement, updateAdvertisement, toggleAdvertisementActive, deleteAdvertisement,
    getAdvertisementsAdmin, getAdvertisementByIdAdmin, listActiveAdvertisements,
    trackAdvertisementImpression, trackAdvertisementClick
};