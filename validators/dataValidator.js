const Joi = require("joi");

const buyDataSchema = Joi.object({
    network: Joi.string()
        .valid("MTN", "AIRTEL", "GLO", "9MOBILE")
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{11}$/)
        .required(),

    plan: Joi.string()
        .required(),

    amount: Joi.number()
        .positive()
        .required(),

    pin: Joi.string()
        .pattern(/^\d{4}$/)
        .required()
        .messages({
            "string.pattern.base": "Transaction PIN must be exactly 4 digits.",
            "any.required": "Transaction PIN is required."
        })
});

module.exports = {
    buyDataSchema,
};