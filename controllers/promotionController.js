const PromotionService = require("../services/promotionService");
const PromotionClaimService = require("../services/promotionClaimService");
const RewardLedgerService = require("../services/rewardLedgerService");
const ApiResponse = require("../helpers/apiResponse");

// ADMIN

const createPromotion = async (req, res) => {
    try {
        const result = await PromotionService.create(req.body, req.user.email);
        return ApiResponse.success(res, "Promotion created successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const updatePromotion = async (req, res) => {
    try {
        const result = await PromotionService.update(req.params.id, req.body);
        return ApiResponse.success(res, "Promotion updated successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const togglePromotionActive = async (req, res) => {
    try {
        const result = await PromotionService.setActive(req.params.id, req.body.is_active);
        return ApiResponse.success(res, `Promotion ${result.is_active ? "activated" : "deactivated"} successfully.`, result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const deletePromotion = async (req, res) => {
    try {
        const result = await PromotionService.delete(req.params.id);
        return ApiResponse.success(res, result.message);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const getPromotionsAdmin = async (req, res) => {
    try {
        const result = await PromotionService.listForAdmin(req.query);
        return ApiResponse.success(res, "Promotions retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const getPromotionByIdAdmin = async (req, res) => {
    try {
        const result = await PromotionService.findById(req.params.id);
        return ApiResponse.success(res, "Promotion retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 404);
    }
};

const getRecentClaimsAdmin = async (req, res) => {
    try {
        const result = await RewardLedgerService.getRecentClaims(req.query);
        return ApiResponse.success(res, "Recent claims retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const getClaimStatsAdmin = async (req, res) => {
    try {
        const result = await RewardLedgerService.getClaimStats();
        return ApiResponse.success(res, "Claim stats retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

// PUBLIC / USER-FACING

const listActivePromotions = async (req, res) => {
    try {
        const result = await PromotionService.listActive();
        return ApiResponse.success(res, "Active promotions retrieved successfully.", result);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

const claimPromotion = async (req, res) => {
    try {
        const result = await PromotionClaimService.claim(req.user.id, req.params.id);
        return ApiResponse.success(res, result.message, result.claim);
    } catch (error) {
        return ApiResponse.error(res, error.message, 400);
    }
};

module.exports = {
    createPromotion, updatePromotion, togglePromotionActive, deletePromotion,
    getPromotionsAdmin, getPromotionByIdAdmin, getRecentClaimsAdmin, getClaimStatsAdmin,
    listActivePromotions, claimPromotion
};