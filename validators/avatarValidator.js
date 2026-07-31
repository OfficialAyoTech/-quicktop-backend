const Joi = require("joi");

const avatarSchema = Joi.object({

    avatar_url: Joi.string()
        .uri()
        .pattern(
            /^https:\/\/firebasestorage\.googleapis\.com\/.*/
        )
        .required()
        .messages({
            "string.uri":
                "Avatar URL must be a valid URL.",
            "string.pattern.base":
                "Avatar must be uploaded to Firebase Storage."
        })

});

module.exports = {
    avatarSchema
};