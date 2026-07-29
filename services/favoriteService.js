const FavoriteModel = require("../models/favoriteModel");
const NotFoundError = require("../errors/NotFoundError");

class FavoriteService {

    /**
     * Create Favorite
     */
    static async createFavorite(userId, payload) {

        return await FavoriteModel.create({
            user_id: userId,
            nickname: payload.nickname,
            service: payload.service,
            account_number: payload.account_number,
            provider: payload.provider,
            metadata: payload.metadata || {}
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