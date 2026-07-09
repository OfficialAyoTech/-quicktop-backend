const Joi = require("joi");

const buyDataSchema = Joi.object({
    network: Joi.string()
        .valid("MTN", "AIRTEL", "GLO", "9MOBILE")
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{11}$/)
        .required(),

    plan: Joi.string()
        .required()
});

module.exports = {
    buyDataSchema,
};