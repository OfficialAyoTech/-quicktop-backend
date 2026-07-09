const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");
const validate = require("../middleware/validate");

const { buyDataSchema } = require("../validators/dataValidator");

const {
    buyData,
} = require("../controllers/dataController");

router.post(
    "/buy-data",
    authenticateUser,
    validate(buyDataSchema),
    buyData
);

module.exports = router;
