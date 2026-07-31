const FavoriteModel = require("../models/favoriteModel");
const NotFoundError = require("../errors/NotFoundError");
const AppError = require("../helpers/AppError");

const ALLOWED_SERVICES = ["airtime", "data", "cable", "electricity"];

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class FavoriteService {

    /**
     * Create Favorite
     */
    static async createFavorite(userId, payload) {

        const { nickname, service, account_number, provider, metadata } = payload;

        if (!nickname || !nickname.trim()) {
            throw new ValidationError("Nickname is required.");
        }

        if (!service || !ALLOWED_SERVICES.includes(service)) {
            throw new ValidationError(
                `Service must be one of: ${ALLOWED_SERVICES.join(", ")}.`
            );
        }

        if (!account_number || !account_number.trim()) {
            throw new ValidationError("Account number is required.");
        }

        const duplicate = await FavoriteModel.findDuplicate(
            userId,
            service,
            account_number
        );

        if (duplicate) {
            throw new ValidationError(
                "You already have a favorite saved with this number."
            );
        }

        return await FavoriteModel.create({
            user_id: userId,
            nickname: nickname.trim(),
            service,
            account_number: account_number.trim(),
            provider,
            metadata: metadata || {}
        });

    }

    /**
     * Get All Favorites
     */
    static async getFavorites(userId, query = {}) {

        return await FavoriteModel.findByUser(
            userId,
            query.service || null
        );

    }

    /**
     * Get One Favorite
     */
    static async getFavorite(userId, favoriteId) {

        const favorite = await FavoriteModel.findById(
            favoriteId,
            userId
        );

        if (!favorite) {
            throw new NotFoundError(
                "Favorite not found."
            );
        }

        return favorite;

    }

    /**
     * Update Favorite
     */
    static async updateFavorite(userId, favoriteId, payload) {

        const existing = await FavoriteModel.findById(favoriteId, userId);

        if (!existing) {
            throw new NotFoundError("Favorite not found.");
        }

        const { nickname, account_number, metadata } = payload;

        if (nickname !== undefined && !nickname.trim()) {
            throw new ValidationError("Nickname cannot be empty.");
        }

        if (account_number !== undefined && !account_number.trim()) {
            throw new ValidationError("Account number cannot be empty.");
        }

        const updated = await FavoriteModel.update(favoriteId, userId, {
            nickname: nickname !== undefined ? nickname.trim() : undefined,
            account_number: account_number !== undefined ? account_number.trim() : undefined,
            metadata
        });

        return updated;

    }

    /**
     * Delete Favorite
     */
    static async deleteFavorite(userId, favoriteId) {

        const favorite = await FavoriteModel.delete(
            favoriteId,
            userId
        );

        if (!favorite) {
            throw new NotFoundError(
                "Favorite not found."
            );
        }

        return {
            message: "Favorite deleted successfully."
        };

    }

}

module.exports = FavoriteService;