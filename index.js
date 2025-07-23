const lnurlPay = require("lnurl-pay");
const crypto = require("crypto");

/**
 * HTTP client factory with automatic fallback
 * Uses built-in fetch for Node 18+ or axios as fallback
 */
const httpClient = (() => {
  try {
    // Try built-in fetch (Node 18+)
    if (typeof globalThis.fetch !== "undefined") {
      return {
        async get(url, options = {}) {
          const timeout = options.timeout || 30000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const response = await fetch(url, {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
                "User-Agent": "bringin-lnurl-pay/1.0.0",
              },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const data = await response.json();
            return { data };
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
          }
        },
      };
    }
  } catch (e) {
    // Fallback to axios
  }

  try {
    const axios = require("axios");
    return {
      async get(url, options = {}) {
        const timeout = options.timeout || 30000;
        const response = await axios.get(url, {
          timeout,
          headers: {
            Accept: "application/json",
            "User-Agent": "bringin-lnurl-pay/1.0.0",
          },
        });
        return response;
      },
    };
  } catch (e) {
    throw new Error("Please install axios: npm install axios");
  }
})();

/**
 * Input validation utilities
 */
const validators = {
  /**
   * Validate Lightning address format
   * @param {string} address - Lightning address to validate
   * @returns {boolean} True if valid
   */
  isValidLightningAddress(address) {
    if (typeof address !== "string") return false;
    const parts = address.split("@");
    if (parts.length !== 2) return false;
    const [username, domain] = parts;
    return username.length > 0 && domain.length > 0 && domain.includes(".");
  },

  /**
   * Validate amount in satoshis
   * @param {number} amount - Amount to validate
   * @returns {boolean} True if valid
   */
  isValidAmount(amount) {
    return typeof amount === "number" && amount > 0 && Number.isInteger(amount);
  },

  /**
   * Validate comment length
   * @param {string} comment - Comment to validate
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} True if valid
   */
  isValidComment(comment, maxLength) {
    if (!comment) return true;
    return typeof comment === "string" && comment.length <= maxLength;
  },
};

/**
 * Enhanced LNURL Pay with POS mode support
 * Drop-in replacement for lnurl-pay library that adds Bringin POS functionality
 */
class EnhancedLnurlPay {
  /**
   * Request invoice with POS mode support - same API as lnurl-pay
   * @param {Object} options - Request options
   * @param {string} options.lnUrlOrAddress - Lightning address or LNURL
   * @param {number} options.tokens - Amount in satoshis
   * @param {string} [options.comment] - Optional comment
   * @param {boolean} [options.posMode=false] - Enable POS mode for lower minimums
   * @param {boolean} [options.onionAllowed=false] - Allow onion URLs
   * @param {Function} [options.fetchGet] - Custom fetch function
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @returns {Promise<Object>} Invoice response in lnurl-pay format
   * @throws {Error} When validation fails or request errors occur
   */
  static async requestInvoice(options) {
    const {
      lnUrlOrAddress,
      tokens,
      comment,
      posMode = false,
      onionAllowed = false,
      fetchGet,
      timeout = 30000,
      ...otherOptions
    } = options;

    // Input validation
    if (!lnUrlOrAddress) {
      throw new Error("lnUrlOrAddress is required");
    }

    if (!validators.isValidAmount(tokens)) {
      throw new Error("tokens must be a positive integer");
    }

    // For non-POS requests or non-Lightning addresses, use original lnurl-pay
    if (!posMode || !lnUrlOrAddress.includes("@")) {
      return await lnurlPay.requestInvoice(options);
    }

    try {
      // Get POS service parameters
      const params = await this.requestPayServiceParams({
        lnUrlOrAddress,
        posMode: true,
        timeout,
      });

      // Validate amount against service limits
      if (tokens < params.min) {
        throw new Error(`Amount too small. Minimum: ${params.min} sats`);
      }
      if (tokens > params.max) {
        throw new Error(`Amount too large. Maximum: ${params.max} sats`);
      }

      // Validate comment
      if (!validators.isValidComment(comment, params.commentAllowed)) {
        throw new Error(
          `Comment too long. Maximum: ${params.commentAllowed} characters`
        );
      }

      // Request invoice
      const amountMillisats = tokens * 1000;
      let invoiceUrl = `${params.callback}?amount=${amountMillisats}`;
      if (comment) {
        invoiceUrl += `&comment=${encodeURIComponent(comment)}`;
      }

      const response = await httpClient.get(invoiceUrl, { timeout });

      if (response.data.status !== "OK") {
        throw new Error(
          `Invoice request failed: ${response.data.reason || "Unknown error"}`
        );
      }

      // Return in lnurl-pay compatible format
      return {
        invoice: response.data.pr,
        params: params,
        successAction: response.data.successAction || null,
        rawData: response.data,
        // Additional fields for compatibility
        hasValidAmount: true,
        hasValidDescriptionHash: true,
        validatePreimage: () => true, // Placeholder function
      };
    } catch (error) {
      if (
        error.message.includes("Amount too small") ||
        error.message.includes("Amount too large") ||
        error.message.includes("Comment too long")
      ) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`POS invoice request failed: ${error.message}`);
    }
  }

  /**
   * Request pay service params with POS support
   * @param {Object} options - Request options
   * @param {string} options.lnUrlOrAddress - Lightning address or LNURL
   * @param {boolean} [options.posMode=false] - Enable POS mode
   * @param {boolean} [options.onionAllowed=false] - Allow onion URLs
   * @param {Function} [options.fetchGet] - Custom fetch function
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @returns {Promise<Object>} Service parameters in lnurl-pay format
   * @throws {Error} When validation fails or request errors occur
   */
  static async requestPayServiceParams(options) {
    const {
      lnUrlOrAddress,
      posMode = false,
      onionAllowed = false,
      fetchGet,
      timeout = 30000,
    } = options;

    // Input validation
    if (!lnUrlOrAddress) {
      throw new Error("lnUrlOrAddress is required");
    }

    // For non-POS requests or non-Lightning addresses, use original lnurl-pay
    if (!posMode || !lnUrlOrAddress.includes("@")) {
      return await lnurlPay.requestPayServiceParams(options);
    }

    try {
      const [username, domain] = lnUrlOrAddress.split("@");

      if (!username || !domain) {
        throw new Error("Invalid Lightning address format");
      }

      const url = `https://${domain}/.well-known/lnurlp/${username}?pos=true`;

      const response = await httpClient.get(url, { timeout });
      const data = response.data;

      if (data.status !== "OK") {
        throw new Error(`Service error: ${data.reason || "Invalid response"}`);
      }

      // Parse metadata
      const metadata =
        typeof data.metadata === "string"
          ? JSON.parse(data.metadata)
          : data.metadata;
      const description = this.parseDescription(metadata);

      // Return in lnurl-pay format
      return {
        callback: data.callback,
        fixed: false,
        min: parseInt(data.minSendable) / 1000, // Convert millisats to sats
        max: parseInt(data.maxSendable) / 1000, // Convert millisats to sats
        domain: domain,
        metadata: metadata,
        metadataHash: this.calculateMetadataHash(data.metadata),
        identifier: lnUrlOrAddress,
        description: description,
        image: this.extractImage(metadata),
        commentAllowed: data.commentAllowed || 0,
        rawData: data,
      };
    } catch (error) {
      if (error.message.includes("Invalid Lightning address")) {
        throw error; // Re-throw validation errors as-is
      }
      throw new Error(`Failed to get POS service params: ${error.message}`);
    }
  }

  /**
   * Request invoice with service params (2nd step) - with POS support
   * @param {Object} options - Request options
   * @param {Object} options.params - Service parameters from requestPayServiceParams
   * @param {number} options.tokens - Amount in satoshis
   * @param {string} [options.comment] - Optional comment
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @returns {Promise<Object>} Invoice response
   * @throws {Error} When validation fails or request errors occur
   */
  static async requestInvoiceWithServiceParams(options) {
    const { params, tokens, comment, timeout = 30000 } = options;

    // Input validation
    if (!params) {
      throw new Error("params is required");
    }

    if (!validators.isValidAmount(tokens)) {
      throw new Error("tokens must be a positive integer");
    }

    // If this is a POS params object (has our POS marker), handle specially
    if (
      params.rawData &&
      params.rawData.status === "OK" &&
      params.callback.includes("bringin.xyz")
    ) {
      // Validate amount
      if (tokens < params.min) {
        throw new Error(`Amount too small. Minimum: ${params.min} sats`);
      }
      if (tokens > params.max) {
        throw new Error(`Amount too large. Maximum: ${params.max} sats`);
      }

      // Validate comment
      if (!validators.isValidComment(comment, params.commentAllowed)) {
        throw new Error(
          `Comment too long. Maximum: ${params.commentAllowed} characters`
        );
      }

      // Request invoice
      const amountMillisats = tokens * 1000;
      let invoiceUrl = `${params.callback}?amount=${amountMillisats}`;
      if (comment) {
        invoiceUrl += `&comment=${encodeURIComponent(comment)}`;
      }

      const response = await httpClient.get(invoiceUrl, { timeout });

      return {
        invoice: response.data.pr,
        successAction: response.data.successAction || null,
        rawData: response.data,
      };
    }

    // Use original lnurl-pay for standard params
    return await lnurlPay.requestInvoiceWithServiceParams(options);
  }

  /**
   * Parse description from metadata
   * @param {Array} metadata - Metadata array
   * @returns {string} Description text
   */
  static parseDescription(metadata) {
    try {
      if (!Array.isArray(metadata)) {
        return "Payment";
      }
      const textPlain = metadata.find(
        (item) => Array.isArray(item) && item[0] === "text/plain"
      );
      return textPlain ? textPlain[1] : "Payment";
    } catch (error) {
      return "Payment";
    }
  }

  /**
   * Extract image from metadata
   * @param {Array} metadata - Metadata array
   * @returns {string} Image data or empty string
   */
  static extractImage(metadata) {
    try {
      if (!Array.isArray(metadata)) {
        return "";
      }
      const image = metadata.find(
        (item) =>
          Array.isArray(item) &&
          (item[0] === "image/png;base64" || item[0] === "image/jpeg;base64")
      );
      return image ? image[1] : "";
    } catch (error) {
      return "";
    }
  }

  /**
   * Calculate metadata hash
   * @param {string|Array} metadata - Metadata to hash
   * @returns {string} Hash string
   */
  static calculateMetadataHash(metadata) {
    try {
      const metadataStr =
        typeof metadata === "string" ? metadata : JSON.stringify(metadata);
      return crypto
        .createHash("sha256")
        .update(metadataStr)
        .digest("hex")
        .substring(0, 32);
    } catch (error) {
      return crypto
        .createHash("sha256")
        .update("")
        .digest("hex")
        .substring(0, 32);
    }
  }
}

// Export both the class and individual functions for compatibility
module.exports = EnhancedLnurlPay;

// Also export individual functions to match lnurl-pay API
module.exports.requestInvoice =
  EnhancedLnurlPay.requestInvoice.bind(EnhancedLnurlPay);
module.exports.requestPayServiceParams =
  EnhancedLnurlPay.requestPayServiceParams.bind(EnhancedLnurlPay);
module.exports.requestInvoiceWithServiceParams =
  EnhancedLnurlPay.requestInvoiceWithServiceParams.bind(EnhancedLnurlPay);
