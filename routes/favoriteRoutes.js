const express = require("express");

const router = express.Router();

const favoriteController = require("../controllers/favoriteController");
const auth = require("../middleware/auth");

// Create favorite
router.post(
    "/",
    auth,
    favoriteController.createFavorite
);

// Get all favorites
router.get(
    "/",
    auth,
    favoriteController.getFavorites
);

// Update favorite
router.put(
    "/:id",
    auth,
    favoriteController.updateFavorite
);

// Get one favorite
router.get(
    "/:id",
    auth,
    favoriteController.getFavorite
);

// Delete favorite
router.delete(
    "/:id",
    auth,
    favoriteController.deleteFavorite
);

module.exports = router;