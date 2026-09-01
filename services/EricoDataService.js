const axios = require("axios");

class EricoDataService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.ERICODATA_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Agent-Key": process.env.ERICODATA_API_KEY,
      },
    });
  }

  /**
   * Get available data plans
   * @param {string} network - mtn | glo | airtel | 9mobile
   */
  async getPlans(network) {
    try {
      const response = await this.client.get("/plans", {
        params: {
          network: network.toLowerCase(),
        },
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Purchase data
   */
  async buyData({ network, phone, planId }) {
    try {
      const response = await this.client.post("/order", {
        service: "data",
        network: network.toLowerCase(),
        phone,
        plan_id: Number(planId),
      });

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Get ERICODATA wallet balance
   */
  async getBalance() {
    try {
      const response = await this.client.get("/balance");

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  normalizeError(error) {
    if (error.response) {
      const providerError = new Error(
        error.response.data?.message ||
        "ERICODATA provider request failed"
      );

      providerError.statusCode =
        error.response.data?.data?.status ||
        error.response.status;

      providerError.provider = "ERICODATA";
      providerError.code = error.response.data?.code;

      providerError.providerResponse = error.response.data;

      return providerError;
    }

    if (error.request) {
      const providerError = new Error(
        "ERICODATA provider did not respond"
      );

      providerError.statusCode = 503;
      providerError.provider = "ERICODATA";
      providerError.code = "PROVIDER_TIMEOUT";

      return providerError;
    }

    return error;
  }
}

module.exports = new EricoDataService();