const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profileController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
    updateProfileSchema,
    changePhoneSchema
} = require("../validators/profileValidator");

const {
    avatarSchema
} = require("../validators/avatarValidator");

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     description: Returns the profile information of the currently authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/",
    auth,
    profileController.getProfile
);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     description: Update the user's full name and phone number.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Ayodeji Salami
 *               phone:
 *                 type: string
 *                 example: "07064819881"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 */
router.put(
    "/",
    auth,
    validate(updateProfileSchema),
    profileController.updateProfile
);

/**
 * @swagger
 * /api/profile/avatar:
 *   patch:
 *     summary: Upload profile avatar
 *     description: Save the authenticated user's avatar URL.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar_url
 *             properties:
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 example: https://firebasestorage.googleapis.com/...
 *     responses:
 *       200:
 *         description: Avatar updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 */
router.patch(
    "/avatar",
    auth,
    validate(avatarSchema),
    profileController.uploadAvatar
);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete authenticated user's account
 *     description: Soft deletes the authenticated user's account.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete(
    "/",
    auth,
    profileController.deleteAccount
);

/**
 * @swagger
 * /api/profile/change-phone:
 *   patch:
 *     summary: Change authenticated user's phone number
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "07064819881"
 *     responses:
 *       200:
 *         description: Phone number updated successfully.
 */
router.patch(
    "/change-phone",
    auth,
    validate(changePhoneSchema),
    profileController.changePhone
);

module.exports = router;