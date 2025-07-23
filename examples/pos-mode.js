/**
 * POS Mode Example
 *
 * This example demonstrates the power of POS mode for micro-payments
 * that would be impossible with standard lnurl-pay!
 */

const lnurlPay = require("@bringinxyz/lnurl-pay");

async function posModeExample() {
  console.log("=== POS Mode Example ===\n");

  try {
    // Micro-payment that would be impossible with standard mode
    console.log("Requesting micro-payment invoice...");
    const microInvoice = await lnurlPay.requestInvoice({
      lnUrlOrAddress: "merchant@bringin.xyz",
      tokens: 50, // 50 sats vs 22,000 sats minimum!
      posMode: true, // This makes it possible
      comment: "Small tip",
    });

    console.log("✅ Micro-payment invoice generated!");
    console.log("Amount:", 50, "sats (impossible with standard mode)");
    console.log("Invoice:", microInvoice.invoice.substring(0, 50) + "...");
    console.log("Description:", microInvoice.params.description);

    if (microInvoice.successAction) {
      console.log("Success message:", microInvoice.successAction.message);
    }

    console.log("\n🚀 POS mode enables micro-payments!");
    console.log("Standard minimum: 22,000+ sats");
    console.log("POS minimum: 20+ sats");
    console.log("Reduction: 99.9% lower minimums!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the example
if (require.main === module) {
  posModeExample().catch(console.error);
}

module.exports = posModeExample;
