/**
 * Comparison Example
 *
 * This example shows the dramatic difference between standard and POS modes
 * side by side.
 */

const lnurlPay = require("@bringin/lnurl-pay");

async function compareModes() {
  console.log("=== Standard vs POS Mode Comparison ===\n");

  const address = "merchant@bringin.xyz";

  try {
    // Get standard mode parameters
    console.log("1. Getting standard mode parameters...");
    const standard = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: address,
      posMode: false,
    });

    console.log("✅ Standard mode parameters:");
    console.log("   Minimum:", standard.min.toLocaleString(), "sats");
    console.log("   Maximum:", standard.max.toLocaleString(), "sats");
    console.log("   Comment allowed:", standard.commentAllowed, "characters");

    // Get POS mode parameters
    console.log("\n2. Getting POS mode parameters...");
    const pos = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: address,
      posMode: true,
    });

    console.log("✅ POS mode parameters:");
    console.log("   Minimum:", pos.min.toLocaleString(), "sats");
    console.log("   Maximum:", pos.max.toLocaleString(), "sats");
    console.log("   Comment allowed:", pos.commentAllowed, "characters");

    // Calculate improvements
    const minReduction = standard.min - pos.min;
    const maxIncrease = pos.max - standard.max;
    const minReductionPercent = ((minReduction / standard.min) * 100).toFixed(
      1
    );

    console.log("\n📊 Comparison Results:");
    console.log("   Minimum reduction:", minReduction.toLocaleString(), "sats");
    console.log("   Maximum increase:", maxIncrease.toLocaleString(), "sats");
    console.log("   Minimum improvement:", minReductionPercent + "%");

    console.log("\n🎯 Key Benefits:");
    console.log("   • Micro-payments enabled (20+ sats vs 22k+ sats)");
    console.log("   • 99.9% lower minimum payment threshold");
    console.log(
      "   • Perfect for tips, small purchases, and micro-transactions"
    );
    console.log("   • Drop-in compatibility with existing lnurl-pay code");

    // Test micro-payment capability
    console.log("\n3. Testing micro-payment capability...");
    try {
      const microInvoice = await lnurlPay.requestInvoice({
        lnUrlOrAddress: address,
        tokens: 100,
        posMode: true,
        comment: "Test micro",
      });

      console.log("✅ Micro-payment test successful!");
      console.log(
        "   Generated 100 sats invoice (impossible with standard mode)"
      );
      console.log(
        "   Invoice starts with:",
        microInvoice.invoice.substring(0, 30) + "..."
      );
    } catch (error) {
      console.log("❌ Micro-payment test failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Comparison failed:", error.message);
  }
}

// Run the example
if (require.main === module) {
  compareModes().catch(console.error);
}

module.exports = compareModes;
