const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");

const {
    verifyCable,
    purchaseCable
} = require("../controllers/cableController");

const validateCable =
    require("../validators/cableValidator");

router.post(
    "/verify",
    authenticateUser,
    verifyCable
);

router.post(
    "/purchase",
    authenticateUser,
    validateCable,
    purchaseCable
);

router.get(
    "/plans/:provider",
    authenticateUser,
    getCablePlans
);

module.exports = router;