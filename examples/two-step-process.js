/**
 * Two-Step Process Example
 *
 * This example demonstrates the two-step process for requesting invoices,
 * which can be useful for getting service parameters first, then requesting
 * the invoice separately.
 */

const lnurlPay = require("@bringin/lnurl-pay");

async function twoStepProcess() {
  console.log("=== Two-Step Process Example ===\n");

  const address = "merchant@bringin.xyz";

  try {
    // Step 1: Get service parameters
    console.log("Step 1: Getting service parameters...");
    const params = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: address,
      posMode: true,
    });

    console.log("✅ Service parameters retrieved:");
    console.log("   Domain:", params.domain);
    console.log("   Min amount:", params.min, "sats");
    console.log("   Max amount:", params.max, "sats");
    console.log("   Description:", params.description);
    console.log("   Comment allowed:", params.commentAllowed, "characters");

    // Step 2: Request invoice using the parameters
    console.log("\nStep 2: Requesting invoice with service parameters...");
    const invoice = await lnurlPay.requestInvoiceWithServiceParams({
      params: params,
      tokens: 75,
      comment: "Two-step test",
    });

    console.log("✅ Invoice generated successfully!");
    console.log("   Amount:", 75, "sats");
    console.log("   Invoice:", invoice.invoice.substring(0, 50) + "...");

    if (invoice.successAction) {
      console.log("   Success message:", invoice.successAction.message);
    }

    console.log("\n🎉 Two-step process completed successfully!");
    console.log("This approach is useful when you want to:");
    console.log("   • Cache service parameters for multiple invoices");
    console.log("   • Validate amounts before requesting invoices");
    console.log("   • Show payment options to users before payment");
  } catch (error) {
    console.error("❌ Two-step process failed:", error.message);
  }
}

// Run the example
if (require.main === module) {
  twoStepProcess().catch(console.error);
}

module.exports = twoStepProcess;
