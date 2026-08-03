const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const PushController = require("../controllers/pushController");

router.post("/subscribe", authenticateUser, PushController.saveSubscription);

module.exports = router;