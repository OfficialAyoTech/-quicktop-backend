const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const { syncUser } = require("../controllers/authController");

router.post("/sync-user", authenticateUser, syncUser);

module.exports = router;