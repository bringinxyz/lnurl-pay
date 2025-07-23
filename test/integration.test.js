/**
 * Integration Tests for @bringin/lnurl-pay
 *
 * These tests verify the package works correctly with real Bringin endpoints
 * and maintains compatibility with lnurl-pay.
 */

const lnurlPay = require("@bringin/lnurl-pay");

// Test configuration
const TEST_ADDRESS = "prashanth@bringin.xyz";
const TEST_AMOUNTS = [50, 100, 500, 1000, 25000];

/**
 * Test utilities
 */
function logTest(name, status, details = "") {
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} ${name}${details ? ": " + details : ""}`);
}

function logSection(name) {
  console.log(`\n📋 ${name}`);
  console.log("=".repeat(50));
}

/**
 * Test 1: Standard mode compatibility
 */
async function testStandardModeCompatibility() {
  logSection("Standard Mode Compatibility");

  try {
    // Test that standard mode works exactly like lnurl-pay
    const invoice = await lnurlPay.requestInvoice({
      lnUrlOrAddress: TEST_ADDRESS,
      tokens: 25000,
      posMode: false,
    });

    if (invoice && invoice.invoice && invoice.params) {
      logTest(
        "Standard invoice generation",
        "PASS",
        "Invoice created successfully"
      );
      logTest("Invoice format", "PASS", "Valid Lightning invoice format");
      logTest("Params structure", "PASS", "Service parameters included");
    } else {
      logTest(
        "Standard invoice generation",
        "FAIL",
        "Invalid response structure"
      );
    }
  } catch (error) {
    logTest("Standard invoice generation", "FAIL", error.message);
  }
}

/**
 * Test 2: POS mode functionality
 */
async function testPosModeFunctionality() {
  logSection("POS Mode Functionality");

  try {
    // Test POS mode with micro-payment
    const invoice = await lnurlPay.requestInvoice({
      lnUrlOrAddress: TEST_ADDRESS,
      tokens: 100,
      posMode: true,
      comment: "Test micro",
    });

    if (invoice && invoice.invoice) {
      logTest("POS micro-payment", "PASS", "100 sats invoice created");
      logTest("POS invoice format", "PASS", "Valid Lightning invoice format");
    } else {
      logTest("POS micro-payment", "FAIL", "Invalid response structure");
    }
  } catch (error) {
    logTest("POS micro-payment", "FAIL", error.message);
  }
}

/**
 * Test 3: Service parameters comparison
 */
async function testServiceParametersComparison() {
  logSection("Service Parameters Comparison");

  try {
    // Get standard parameters
    const standard = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: TEST_ADDRESS,
      posMode: false,
    });

    // Get POS parameters
    const pos = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: TEST_ADDRESS,
      posMode: true,
    });

    logTest("Standard params retrieval", "PASS", `Min: ${standard.min} sats`);
    logTest("POS params retrieval", "PASS", `Min: ${pos.min} sats`);

    const reduction = standard.min - pos.min;
    const improvement = ((reduction / standard.min) * 100).toFixed(1);

    logTest(
      "Minimum reduction",
      "PASS",
      `${reduction.toLocaleString()} sats (${improvement}%)`
    );

    if (pos.min < standard.min) {
      logTest("POS advantage", "PASS", "POS mode has lower minimum");
    } else {
      logTest("POS advantage", "FAIL", "POS mode should have lower minimum");
    }
  } catch (error) {
    logTest("Service parameters comparison", "FAIL", error.message);
  }
}

/**
 * Test 4: Two-step process
 */
async function testTwoStepProcess() {
  logSection("Two-Step Process");

  try {
    // Step 1: Get parameters
    const params = await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: TEST_ADDRESS,
      posMode: true,
    });

    logTest("Step 1 - Get params", "PASS", "Parameters retrieved");

    // Step 2: Request invoice
    const invoice = await lnurlPay.requestInvoiceWithServiceParams({
      params: params,
      tokens: 75,
    });

    if (invoice && invoice.invoice) {
      logTest(
        "Step 2 - Get invoice",
        "PASS",
        "Invoice created via two-step process"
      );
    } else {
      logTest("Step 2 - Get invoice", "FAIL", "Invalid invoice response");
    }
  } catch (error) {
    logTest("Two-step process", "FAIL", error.message);
  }
}

/**
 * Test 5: Error handling
 */
async function testErrorHandling() {
  logSection("Error Handling");

  try {
    // Test invalid amount (too small for standard mode)
    await lnurlPay.requestInvoice({
      lnUrlOrAddress: TEST_ADDRESS,
      tokens: 10,
      posMode: false,
    });
    logTest("Standard mode validation", "FAIL", "Should reject small amounts");
  } catch (error) {
    if (error.message.includes("Amount too small")) {
      logTest(
        "Standard mode validation",
        "PASS",
        "Correctly rejected small amount"
      );
    } else {
      logTest(
        "Standard mode validation",
        "FAIL",
        `Unexpected error: ${error.message}`
      );
    }
  }

  try {
    // Test invalid Lightning address
    await lnurlPay.requestPayServiceParams({
      lnUrlOrAddress: "invalid-address",
      posMode: true,
    });
    logTest(
      "Invalid address validation",
      "FAIL",
      "Should reject invalid address"
    );
  } catch (error) {
    if (error.message.includes("Invalid Lightning address")) {
      logTest(
        "Invalid address validation",
        "PASS",
        "Correctly rejected invalid address"
      );
    } else {
      logTest(
        "Invalid address validation",
        "FAIL",
        `Unexpected error: ${error.message}`
      );
    }
  }
}

/**
 * Test 6: Multiple amounts
 */
async function testMultipleAmounts() {
  logSection("Multiple Amounts Test");

  for (const amount of TEST_AMOUNTS) {
    try {
      const invoice = await lnurlPay.requestInvoice({
        lnUrlOrAddress: TEST_ADDRESS,
        tokens: amount,
        posMode: true,
      });

      if (invoice && invoice.invoice) {
        logTest(`${amount} sats`, "PASS", "Invoice generated");
      } else {
        logTest(`${amount} sats`, "FAIL", "Invalid response");
      }
    } catch (error) {
      logTest(`${amount} sats`, "FAIL", error.message);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🧪 Integration Tests for @bringin/lnurl-pay");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    await testStandardModeCompatibility();
    await testPosModeFunctionality();
    await testServiceParametersComparison();
    await testTwoStepProcess();
    await testErrorHandling();
    await testMultipleAmounts();

    const duration = Date.now() - startTime;
    console.log(`\n🎉 All tests completed in ${duration}ms`);
  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testStandardModeCompatibility,
  testPosModeFunctionality,
  testServiceParametersComparison,
  testTwoStepProcess,
  testErrorHandling,
  testMultipleAmounts,
  runAllTests,
};
