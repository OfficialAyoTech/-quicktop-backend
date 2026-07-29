const Joi = require("joi");

const updateProfileSchema = Joi.object({

    full_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            "string.pattern.base":
                "Phone number must contain only digits and be between 10 and 15 digits."
        })

});

module.exports = {
    updateProfileSchema
};