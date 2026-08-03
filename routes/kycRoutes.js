const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const {
    submitKycSchema
} = require("../validators/kycValidator");

const {
    submitKyc,
    getKyc
} = require("../controllers/kycController");

router.get(
    "/",
    auth,
    getKyc
);

router.post(
    "/",
    auth,

    upload.fields([
        {
            name: "id_image",
            maxCount: 1
        },
        {
            name: "selfie",
            maxCount: 1
        }
    ]),

    validate(submitKycSchema),

    submitKyc
);

module.exports = router;