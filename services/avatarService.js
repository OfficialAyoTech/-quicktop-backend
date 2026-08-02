const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

class AvatarService {

    /**
     * Upload avatar to Cloudinary
     */
    static async upload(buffer, userId) {

        return new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "quicktop/avatars",
                    public_id: `user-${userId}`,
                    overwrite: true,
                    resource_type: "image"
                },
                (error, result) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(result);

                }
            );

            streamifier
                .createReadStream(buffer)
                .pipe(uploadStream);

        });

    }

}

module.exports = AvatarService;