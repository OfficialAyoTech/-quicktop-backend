const ApiResponse = require("../helpers/apiResponse");
const pool = require("../config/database");

const LEGAL_DOC_KEYS = ["privacy_policy", "terms_of_service"];

/**
 * Public: get a single published legal document.
 * No auth — this must be readable before signup/login.
 * Deliberately filters is_draft = false so a doc the admin is mid-editing
 * (or has explicitly marked "not shown to users") can never leak here,
 * even though it already exists in the admin-only getLegalDocs response.
 */
const getPublicLegalDoc = async (req, res) => {

    try {

        const { docKey } = req.params;

        if (!LEGAL_DOC_KEYS.includes(docKey)) {
            throw new Error("Unknown legal document key.");
        }

        const result = await pool.query(
            `SELECT content, updated_at
             FROM legal_docs
             WHERE doc_key = $1 AND is_draft = false`,
            [docKey]
        );

        if (result.rows.length === 0) {
            throw new Error("This document has not been published yet.");
        }

        return ApiResponse.success(
            res,
            "Document retrieved successfully.",
            result.rows[0]
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            404
        );

    }

};

module.exports = { getPublicLegalDoc };