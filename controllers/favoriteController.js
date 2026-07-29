const asyncHandler = require("../helpers/asyncHandler");
const ApiResponse = require("../helpers/apiResponse");

const FavoriteService = require("../services/favoriteService");

/**
 * Create Favorite
 * POST /api/favorites
 */
exports.createFavorite = asyncHandler(async (req, res) => {

    const favorite = await FavoriteService.createFavorite(
        req.user.id,
        req.body
    );

    return ApiResponse.success(
        res,
        "Favorite saved successfully.",
        favorite
    );

});

/**
 * Get Favorites
 * GET /api/favorites
 */
exports.getFavorites = asyncHandler(async (req, res) => {

    const favorites = await FavoriteService.getFavorites(
        req.user.id,
        req.query
    );

    return ApiResponse.success(
        res,
        "Favorites retrieved successfully.",
        favorites
    );

});

/**
 * Get One Favorite
 * GET /api/favorites/:id
 */
exports.getFavorite = asyncHandler(async (req, res) => {

    const favorite = await FavoriteService.getFavorite(
        req.user.id,
        req.params.id
    );

    return ApiResponse.success(
        res,
        "Favorite retrieved successfully.",
        favorite
    );

});

/**
 * Delete Favorite
 * DELETE /api/favorites/:id
 */
exports.deleteFavorite = asyncHandler(async (req, res) => {

    const result = await FavoriteService.deleteFavorite(
        req.user.id,
        req.params.id
    );

    return ApiResponse.success(
        res,
        result.message
    );

});