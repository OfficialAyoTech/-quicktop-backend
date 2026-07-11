const crypto = require("crypto");

function generateReference(prefix = "QT") {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `${prefix}-${year}${month}${day}-${random}`;
}

module.exports = generateReference;