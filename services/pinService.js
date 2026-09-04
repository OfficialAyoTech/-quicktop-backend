const bcrypt = require("bcrypt");

const PinModel = require("../models/pinModel");

const BadRequestError = require("../errors/BadRequestError");
const UnauthorizedError = require("../errors/UnauthorizedError");

class PinService {

    /**
     * Create Transaction PIN
     */
    static async createPin(userId, pin) {

        const user =
            await PinModel.findByUserId(userId);

        if (!user) {
            throw new BadRequestError("User not found.");
        }

        if (user.transaction_pin_created) {
            throw new BadRequestError(
                "Transaction PIN already exists."
            );
        }

        const hashedPin =
            await bcrypt.hash(pin, 10);

        await PinModel.createPin(
            userId,
            hashedPin
        );

        return {
            success: true,
            message: "Transaction PIN created successfully."
        };

    }

    /**
     * Verify Transaction PIN
     */
    static async verifyPin(userId, pin) {

        const user =
            await PinModel.findByUserId(userId);

        if (!user) {
            throw new BadRequestError("User not found.");
        }

        if (!user.transaction_pin_created) {
            throw new BadRequestError(
                "Please create your transaction PIN first."
            );
        }

        if (
            user.pin_locked_until &&
            new Date(user.pin_locked_until) > new Date()
        ) {
            throw new UnauthorizedError(
                "Transaction PIN is temporarily locked. Please try again later."
            );
        }

        const valid =
            await bcrypt.compare(
                pin,
                user.transaction_pin
            );

        if (!valid) {

            const attempts =
                (user.pin_attempts || 0) + 1;

            if (attempts >= 5) {

                const lockedUntil =
                    new Date(
                        Date.now() + (5 * 60 * 1000)
                    );

                await PinModel.lockPin(
                    userId,
                    lockedUntil
                );

                throw new UnauthorizedError(
                    "Too many incorrect PIN attempts. PIN locked for 5 minutes."
                );

            }

            await PinModel.incrementAttempts(
                userId,
                attempts
            );

            throw new UnauthorizedError(
                "Invalid transaction PIN."
            );

        }

        await PinModel.resetAttempts(userId);

        return true;

    }

    /**
     * Change Transaction PIN
     */
    static async changePin(
        userId,
        oldPin,
        newPin
    ) {

        await this.verifyPin(
            userId,
            oldPin
        );

        const hashedPin =
            await bcrypt.hash(
                newPin,
                10
            );

        await PinModel.updatePin(
            userId,
            hashedPin
        );

        return {
            success: true,
            message: "Transaction PIN changed successfully."
        };

    }

    /**
     * Check PIN Status
     */
    static async getStatus(userId) {

        const user =
            await PinModel.findByUserId(userId);

        return {
            hasPin:
                Boolean(
                    user?.transaction_pin_created
                )
        };

    }

}

module.exports = PinService;