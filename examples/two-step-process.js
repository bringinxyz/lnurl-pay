/**
 * Two-Step Process Example
 *
 * This example demonstrates the two-step LNURL Pay process:
 * 1. Get service parameters
 * 2. Request invoice with those parameters
 *
 * This is useful for advanced integrations and custom UI flows.
 */

const lnurlPay = require("../index.js");

async function twoStepProcessExample() {
  console.log("[EXAMPLE] Two-Step LNURL Pay Process");
  console.log("=".repeat(60));

  try {
    // Step 1: Get service parameters
    console.log("[STEP 1] Getting service parameters...");
    console.log("-".repeat(40));

    const params = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: "merchant@bringin.xyz",
      posMode: true, // Enable POS mode for lower minimums
    });

    console.log("[SUCCESS] Service parameters retrieved!");
    console.log("Domain:", params.domain);
    console.log("Min amount:", params.min.toLocaleString(), "sats");
    console.log("Max amount:", params.max.toLocaleString(), "sats");
    console.log("Description:", params.description);
    console.log("Comment allowed:", params.commentAllowed, "characters");

    if (params.image) {
      console.log("Has image: Yes");
    }

    // Step 2: Request invoice with parameters
    console.log("\n[STEP 2] Requesting invoice...");
    console.log("-".repeat(40));

    const invoice = await lnurlPay.requestInvoiceWithServiceParams({
      params: params,
      tokens: 75, // Amount in satoshis
      comment: "Two-step test",
    });

    console.log("[SUCCESS] Invoice generated!");
    console.log("Amount:", 75, "sats");
    console.log("Invoice:", invoice.invoice.substring(0, 50) + "...");

    if (invoice.successAction) {
      console.log("Success action:", invoice.successAction.tag);
      if (invoice.successAction.message) {
        console.log("Success message:", invoice.successAction.message);
      }
    }

    // Step 3: Show the complete response
    console.log("\n[STEP 3] Complete Response");
    console.log("-".repeat(40));

    console.log("Full invoice response:");
    console.log(JSON.stringify(invoice, null, 2));

    console.log("\n[INFO] Two-step process completed successfully!");
    console.log("This approach gives you more control over the payment flow.");
    console.log(
      "Useful for: Custom UIs, payment validation, advanced integrations"
    );
  } catch (error) {
    console.error("[ERROR] Two-step process failed:", error.message);

    if (error.message.includes("Amount too small")) {
      console.log("[HINT] Try increasing the amount or using POS mode");
    } else if (error.message.includes("Invalid Lightning address")) {
      console.log("[HINT] Check the Lightning address format");
    }
  }
}

// Run the example
if (require.main === module) {
  twoStepProcessExample().catch(console.error);
}

module.exports = twoStepProcessExample;
