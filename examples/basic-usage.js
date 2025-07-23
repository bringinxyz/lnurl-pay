/**
 * Basic Usage Example
 *
 * This example demonstrates that @bringinxyz/lnurl-pay works exactly like lnurl-pay
 * for standard usage - it's a true drop-in replacement!
 */

const lnurlPay = require("@bringinxyz/lnurl-pay");

async function basicUsage() {
  console.log("=== Basic Usage Example ===\n");

  try {
    // Standard usage - exactly same as lnurl-pay
    const invoice = await lnurlPay.requestInvoice({
      lnUrlOrAddress: "merchant@bringin.xyz",
      tokens: 25000, // Standard amount above 22k minimum
    });

    console.log("✅ Standard invoice generated successfully!");
    console.log("Amount:", 25000, "sats");
    console.log("Invoice:", invoice.invoice.substring(0, 50) + "...");
    console.log("Description:", invoice.params.description);

    if (invoice.successAction) {
      console.log("Success message:", invoice.successAction.message);
    }

    console.log("\n🎉 Works exactly like lnurl-pay - no changes needed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the example
if (require.main === module) {
  basicUsage().catch(console.error);
}

module.exports = basicUsage;
