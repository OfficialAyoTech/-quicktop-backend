const asyncHandler = require("../helpers/asyncHandler");
const ApiResponse = require("../helpers/apiResponse");

const PaymentService = require("../services/paymentService");

const {
  verifyPaymentSchema,
} = require("../validators/paymentValidator");

/**
 * Initialize Paystack Payment
 * POST /api/payments/initialize
 */
exports.initializePayment = asyncHandler(async (req, res) => {
  const result = await PaymentService.initializePayment(
    req.user,
    req.body
  );

  return ApiResponse.success(
    res,
    result.message,
    result.data
  );
});

/**
 * Verify Paystack Payment
 * POST /api/payments/verify
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { error } = verifyPaymentSchema.validate(req.body);

  if (error) {
    return ApiResponse.badRequest(
      res,
      error.details[0].message
    );
  }

  const result = await PaymentService.verifyPayment(
    req.user,
    req.body.reference
  );

  return ApiResponse.success(
    res,
    result.message,
    result.data
  );
});