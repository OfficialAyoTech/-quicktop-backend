const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const promotionController = require("../controllers/promotionController");

/**
 * ADMIN — Coupons & Rewards Management
 */
router.post("/admin/promotions", auth, admin, promotionController.createPromotion);
router.get("/admin/promotions", auth, admin, promotionController.getPromotionsAdmin);
router.get("/admin/promotions/:id", auth, admin, promotionController.getPromotionByIdAdmin);
router.patch("/admin/promotions/:id", auth, admin, promotionController.updatePromotion);
router.patch("/admin/promotions/:id/active", auth, admin, promotionController.togglePromotionActive);
router.delete("/admin/promotions/:id", auth, admin, promotionController.deletePromotion);
router.get("/admin/promotions-claims/recent", auth, admin, promotionController.getRecentClaimsAdmin);
router.get("/admin/promotions-claims/stats", auth, admin, promotionController.getClaimStatsAdmin);

/**
 * PUBLIC / USER-FACING — Coupons & Rewards
 */
router.get("/promotions/active", auth, promotionController.listActivePromotions);
router.post("/promotions/:id/claim", auth, promotionController.claimPromotion);

module.exports = router;