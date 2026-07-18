const DatabaseTransaction = require("../helpers/databaseTransaction");
const UserModel = require("../models/userModel");
const WalletService = require("./walletService");
const TransactionModel = require("../models/transactionModel");
const generateReference = require("../utils/referenceGenerator");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const { SERVICES } = require("../utils/constants");

class TransferService {

    /**
     * Wallet to Wallet Transfer
     */
    static async transfer(senderId, payload) {

        const {
            recipientEmail,
            amount,
            narration
        } = payload;

        if (Number(amount) <= 0) {
            throw new BadRequestError("Invalid transfer amount.");
        }

        const recipient =
            await UserModel.findByEmail(recipientEmail);

        if (!recipient) {
            throw new NotFoundError("Recipient not found.");
        }

        if (recipient.id === senderId) {
            throw new BadRequestError(
                "You cannot transfer money to yourself."
            );
        }

        const reference = generateReference();

        return await DatabaseTransaction.run(async (client) => {

            // Debit sender
            await WalletService.debitWithClient(
                senderId,
                {
                    amount,
                    source: "WALLET",
                    service: SERVICES.TRANSFER,
                    reference: `${reference}-OUT`,
                    description: narration || "Wallet transfer"
                },
                client
            );

            // Credit receiver
            await WalletService.creditWithClient(
                recipient.id,
                {
                    amount,
                    source: "TRANSFER",
                    service: SERVICES.TRANSFER,
                    reference: `${reference}-IN`,
                    description: narration || "Wallet transfer"
                },
                client
            );

            // Sender transaction
            await TransactionModel.create(
                {
                    user_id: senderId,
                    recipient_user_id: recipient.id,
                    reference,
                    provider: "QuickTop",
                    service: "Transfer",
                    phone: null,
                    amount,
                    status: "SUCCESS",
                    transaction_type: "TRANSFER",
                    narration,
                    api_response: {}
                },
                client
            );

            // Receiver transaction
            await TransactionModel.create(
                {
                    user_id: recipient.id,
                    recipient_user_id: senderId,
                    reference: `${reference}-IN`,
                    provider: "QuickTop",
                    service: "Transfer",
                    phone: null,
                    amount,
                    status: "SUCCESS",
                    transaction_type: "TRANSFER",
                    narration,
                    api_response: {}
                },
                client
            );

            return {
                success: true,
                reference,
                amount
            };

        });

    }

}

module.exports = TransferService;