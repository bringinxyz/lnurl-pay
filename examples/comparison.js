/**
 * Comparison Example
 *
 * This example shows the difference between standard and POS modes
 * side by side for the same Lightning address.
 */

const lnurlPay = require("../index.js");

async function comparisonExample() {
  console.log("[EXAMPLE] Standard vs POS Mode Comparison");
  console.log("=".repeat(60));

  const testAmount = 100; // 100 sats - too small for standard mode

  try {
    // Test 1: Standard mode (should fail)
    console.log("\n[TEST 1] Standard Mode (should fail)");
    console.log("-".repeat(40));

    try {
      const standardInvoice = await lnurlPay.requestInvoice({
        lnUrlOrAddress: "merchant@bringin.xyz",
        tokens: testAmount,
        posMode: false, // Standard mode
      });

      console.log("[UNEXPECTED] Standard mode succeeded!");
      console.log("Amount:", testAmount, "sats");
      console.log("Invoice:", standardInvoice.invoice.substring(0, 50) + "...");
    } catch (error) {
      console.log("[EXPECTED] Standard mode failed as expected");
      console.log("Error:", error.message);
      console.log("Reason: Amount too small for standard mode");
    }

    // Test 2: POS mode (should succeed)
    console.log("\n[TEST 2] POS Mode (should succeed)");
    console.log("-".repeat(40));

    try {
      const posInvoice = await lnurlPay.requestInvoice({
        lnUrlOrAddress: "merchant@bringin.xyz",
        tokens: testAmount,
        posMode: true, // POS mode
      });

      console.log("[SUCCESS] POS mode succeeded!");
      console.log("Amount:", testAmount, "sats");
      console.log("Invoice:", posInvoice.invoice.substring(0, 50) + "...");
      console.log("Description:", posInvoice.params.description);
    } catch (error) {
      console.log("[ERROR] POS mode failed unexpectedly");
      console.log("Error:", error.message);
    }

    // Test 3: Service parameters comparison
    console.log("\n[TEST 3] Service Parameters Comparison");
    console.log("-".repeat(40));

    try {
      // Get standard parameters
      const standardParams = await lnurlPay.requestPayServiceParams({
        lnUrlOrAddress: "merchant@bringin.xyz",
        posMode: false,
      });

      // Get POS parameters
      const posParams = await lnurlPay.requestPayServiceParams({
        lnUrlOrAddress: "merchant@bringin.xyz",
        posMode: true,
      });

      console.log("[SUCCESS] Parameters retrieved successfully");
      console.log("\nStandard Mode:");
      console.log("  Min amount:", standardParams.min.toLocaleString(), "sats");
      console.log("  Max amount:", standardParams.max.toLocaleString(), "sats");
      console.log("  Description:", standardParams.description);

      console.log("\nPOS Mode:");
      console.log("  Min amount:", posParams.min.toLocaleString(), "sats");
      console.log("  Max amount:", posParams.max.toLocaleString(), "sats");
      console.log("  Description:", posParams.description);

      const reduction = standardParams.min - posParams.min;
      const improvement = ((reduction / standardParams.min) * 100).toFixed(1);

      console.log("\n[COMPARISON]");
      console.log("Minimum reduction:", reduction.toLocaleString(), "sats");
      console.log("Percentage improvement:", improvement + "%");
    } catch (error) {
      console.log("[ERROR] Failed to get parameters");
      console.log("Error:", error.message);
    }

    console.log("\n[SUMMARY]");
    console.log("Standard mode: High minimums, traditional limits");
    console.log("POS mode: Low minimums, micro-payment enabled");
    console.log("Use POS mode for: Tips, small purchases, testing");
    console.log("Use standard mode: Large payments, compatibility");
  } catch (error) {
    console.error("[ERROR] Comparison failed:", error.message);
  }
}

// Run the example
if (require.main === module) {
  comparisonExample().catch(console.error);
}

module.exports = comparisonExample;
