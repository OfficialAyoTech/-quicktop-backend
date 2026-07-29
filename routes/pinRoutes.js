const express = require("express");

const router = express.Router();

const authenticateUser =
    require("../middleware/auth");

const PinController =
    require("../controllers/pinController");

router.post(
    "/create",
    authenticateUser,
    PinController.createPin
);

router.post(
    "/verify",
    authenticateUser,
    PinController.verifyPin
);

router.patch(
    "/change",
    authenticateUser,
    PinController.changePin
);

router.get(
    "/status",
    authenticateUser,
    PinController.getStatus
);

module.exports = router;