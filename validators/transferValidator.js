const Joi = require("joi");

const transferSchema = Joi.object({
    recipientEmail: Joi.string()
        .email()
        .required(),

    amount: Joi.number()
        .positive()
        .precision(2)
        .required(),

    narration: Joi.string()
        .max(150)
        .allow("")
        .optional()
});

module.exports = transferSchema;