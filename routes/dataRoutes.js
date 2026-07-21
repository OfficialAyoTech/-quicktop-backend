const express = require("express");
console.log("✅ dataRoutes loaded");

const router = express.Router();

const authenticateUser = require("../middleware/auth");
const validate = require("../middleware/validate");

const { buyDataSchema } = require("../validators/dataValidator");

const {
    buyData,
} = require("../controllers/dataController");

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Data route works!"
    });
});

router.post(
    "/buy-data",
    authenticateUser,
    validate(buyDataSchema),
    buyData
);

module.exports = router;
