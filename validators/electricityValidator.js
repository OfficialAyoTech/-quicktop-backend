const Joi = require("joi");

const schema = Joi.object({
    electricCompany: Joi.string().required(),

    meterType: Joi.string().valid(
        "PREPAID",
        "POSTPAID"
    ).required(),

    meterNo: Joi.string().required(),

    amount: Joi.number().min(1000).max(200000).required(),

    phone: Joi.string().required()
});

module.exports = (req, res, next) => {

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();

};