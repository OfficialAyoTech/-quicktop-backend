const Joi = require("joi");

const submitKycSchema = Joi.object({

    bvn: Joi.string()
        .trim()
        .length(11)
        .optional()
        .allow(null, ""),

    nin: Joi.string()
        .trim()
        .length(11)
        .optional()
        .allow(null, ""),

    address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required(),

    id_type: Joi.string()
        .valid(
            "NIN",
            "BVN",
            "DRIVERS_LICENSE",
            "INTERNATIONAL_PASSPORT",
            "VOTERS_CARD"
        )
        .required(),

    id_number: Joi.string()
        .trim()
        .min(5)
        .max(50)
        .required()

});

module.exports = {
    submitKycSchema
};