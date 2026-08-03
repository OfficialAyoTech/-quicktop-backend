const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, publicId) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktop",
                public_id: publicId,
                overwrite: true,
                resource_type: "image"
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result.secure_url);

            }
        );

        streamifier.createReadStream(buffer).pipe(stream);

    });

};

module.exports = uploadToCloudinary;