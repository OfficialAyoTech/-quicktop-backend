module.exports = (req, res, next) => {

    const {
        cableTv,
        package,
        smartCardNo,
        amount,
        phone
    } = req.body;

    if (
        !cableTv ||
        !package ||
        !smartCardNo ||
        !amount ||
        !phone
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }

    next();

};