const Joi = require("joi");

/**
 * PIN must be exactly 4 digits
 */
const pin = Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
        "string.pattern.base":
            "Transaction PIN must be exactly 4 digits."
    });

const createPinSchema = Joi.object({
    pin
});

const verifyPinSchema = Joi.object({
    pin
});

const changePinSchema = Joi.object({
    oldPin: pin,
    newPin: pin
});

module.exports = {
    createPinSchema,
    verifyPinSchema,
    changePinSchema
};