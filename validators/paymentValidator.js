const Joi = require("joi");

/**
 * Initialize Payment
 */
const initializePaymentSchema = Joi.object({
    amount: Joi.number()
        .positive()
        .required(),

    callback_url: Joi.string()
        .uri()
        .optional()
});

/**
 * Verify Payment
 */
const verifyPaymentSchema = Joi.object({
    reference: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Payment reference is required.",
            "any.required": "Payment reference is required."
        })
});

module.exports = {
    initializePaymentSchema,
    verifyPaymentSchema
};