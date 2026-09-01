const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const advertisementController = require("../controllers/advertisementController");

/**
 * ADMIN — Advertisement Management
 */
router.post("/admin/advertisements", auth, admin, upload.single("image"), advertisementController.createAdvertisement);
router.get("/admin/advertisements", auth, admin, advertisementController.getAdvertisementsAdmin);
router.get("/admin/advertisements/:id", auth, admin, advertisementController.getAdvertisementByIdAdmin);
router.patch("/admin/advertisements/:id", auth, admin, upload.single("image"), advertisementController.updateAdvertisement);
router.patch("/admin/advertisements/:id/active", auth, admin, advertisementController.toggleAdvertisementActive);
router.delete("/admin/advertisements/:id", auth, admin, advertisementController.deleteAdvertisement);

/**
 * PUBLIC / USER-FACING — Homepage Carousel
 */
router.get("/advertisements/active", auth, advertisementController.listActiveAdvertisements);
router.post("/advertisements/:id/impression", auth, advertisementController.trackAdvertisementImpression);
router.post("/advertisements/:id/click", auth, advertisementController.trackAdvertisementClick);

module.exports = router;