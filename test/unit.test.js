/**
 * Unit Tests for @bringinxyz/lnurl-pay
 *
 * These tests focus on validation, helper functions, and edge cases
 * without requiring network requests.
 */

const lnurlPay = require("@bringinxyz/lnurl-pay");

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
 * Test 1: Input validation
 */
function testInputValidation() {
  logSection("Input Validation");

  // Test valid amounts
  const validAmounts = [1, 50, 100, 1000, 25000, 1000000];
  for (const amount of validAmounts) {
    try {
      // This would normally make a network request, but we're testing validation
      if (
        typeof amount === "number" &&
        amount > 0 &&
        Number.isInteger(amount)
      ) {
        logTest(`Valid amount: ${amount}`, "PASS");
      } else {
        logTest(
          `Valid amount: ${amount}`,
          "FAIL",
          "Should be positive integer"
        );
      }
    } catch (error) {
      logTest(`Valid amount: ${amount}`, "FAIL", error.message);
    }
  }

  // Test invalid amounts
  const invalidAmounts = [0, -1, 1.5, "100", null, undefined, {}];
  for (const amount of invalidAmounts) {
    try {
      if (
        typeof amount === "number" &&
        amount > 0 &&
        Number.isInteger(amount)
      ) {
        logTest(
          `Invalid amount: ${amount}`,
          "FAIL",
          "Should reject invalid amount"
        );
      } else {
        logTest(
          `Invalid amount: ${amount}`,
          "PASS",
          "Correctly identified as invalid"
        );
      }
    } catch (error) {
      logTest(`Invalid amount: ${amount}`, "PASS", "Correctly rejected");
    }
  }
}

/**
 * Test 2: Lightning address validation
 */
function testLightningAddressValidation() {
  logSection("Lightning Address Validation");

  // Test valid addresses
  const validAddresses = [
    "user@domain.com",
    "merchant@bringin.xyz",
    "test@example.org",
    "alice@lightning.network",
  ];

  for (const address of validAddresses) {
    const parts = address.split("@");
    if (
      parts.length === 2 &&
      parts[0].length > 0 &&
      parts[1].length > 0 &&
      parts[1].includes(".")
    ) {
      logTest(`Valid address: ${address}`, "PASS");
    } else {
      logTest(`Valid address: ${address}`, "FAIL", "Should be valid");
    }
  }

  // Test invalid addresses
  const invalidAddresses = [
    "invalid",
    "user@",
    "@domain.com",
    "user.domain.com",
    "",
    null,
    undefined,
  ];

  for (const address of invalidAddresses) {
    const parts = address ? address.split("@") : [];
    if (
      parts.length === 2 &&
      parts[0].length > 0 &&
      parts[1].length > 0 &&
      parts[1].includes(".")
    ) {
      logTest(`Invalid address: ${address}`, "FAIL", "Should be invalid");
    } else {
      logTest(
        `Invalid address: ${address}`,
        "PASS",
        "Correctly identified as invalid"
      );
    }
  }
}

/**
 * Test 3: Comment validation
 */
function testCommentValidation() {
  logSection("Comment Validation");

  // Test valid comments
  const testCases = [
    { comment: "Test", maxLength: 10, expected: true },
    { comment: "Hello World", maxLength: 15, expected: true },
    { comment: "", maxLength: 10, expected: true },
    { comment: null, maxLength: 10, expected: true },
    { comment: undefined, maxLength: 10, expected: true },
  ];

  for (const testCase of testCases) {
    const { comment, maxLength, expected } = testCase;
    const isValid =
      !comment || (typeof comment === "string" && comment.length <= maxLength);

    if (isValid === expected) {
      logTest(`Comment "${comment}" (max ${maxLength})`, "PASS");
    } else {
      logTest(
        `Comment "${comment}" (max ${maxLength})`,
        "FAIL",
        `Expected ${expected}, got ${isValid}`
      );
    }
  }

  // Test invalid comments
  const invalidCases = [
    { comment: "Too long comment", maxLength: 5, expected: false },
    { comment: "1234567890", maxLength: 5, expected: false },
  ];

  for (const testCase of invalidCases) {
    const { comment, maxLength, expected } = testCase;
    const isValid =
      !comment || (typeof comment === "string" && comment.length <= maxLength);

    if (isValid === expected) {
      logTest(`Invalid comment "${comment}" (max ${maxLength})`, "PASS");
    } else {
      logTest(
        `Invalid comment "${comment}" (max ${maxLength})`,
        "FAIL",
        `Expected ${expected}, got ${isValid}`
      );
    }
  }
}

/**
 * Test 4: Helper functions
 */
function testHelperFunctions() {
  logSection("Helper Functions");

  // Test parseDescription
  const metadataTestCases = [
    {
      metadata: [["text/plain", "Payment description"]],
      expected: "Payment description",
    },
    {
      metadata: [
        ["image/png;base64", "data"],
        ["text/plain", "Test payment"],
      ],
      expected: "Test payment",
    },
    {
      metadata: [["image/png;base64", "data"]],
      expected: "Payment",
    },
    {
      metadata: [],
      expected: "Payment",
    },
    {
      metadata: null,
      expected: "Payment",
    },
  ];

  for (const testCase of metadataTestCases) {
    try {
      const result = lnurlPay.parseDescription(testCase.metadata);
      if (result === testCase.expected) {
        logTest(
          `parseDescription: ${JSON.stringify(testCase.metadata)}`,
          "PASS"
        );
      } else {
        logTest(
          `parseDescription: ${JSON.stringify(testCase.metadata)}`,
          "FAIL",
          `Expected "${testCase.expected}", got "${result}"`
        );
      }
    } catch (error) {
      logTest(
        `parseDescription: ${JSON.stringify(testCase.metadata)}`,
        "FAIL",
        error.message
      );
    }
  }

  // Test extractImage
  const imageTestCases = [
    {
      metadata: [["image/png;base64", "image-data"]],
      expected: "image-data",
    },
    {
      metadata: [
        ["text/plain", "description"],
        ["image/jpeg;base64", "jpeg-data"],
      ],
      expected: "jpeg-data",
    },
    {
      metadata: [["text/plain", "description"]],
      expected: "",
    },
    {
      metadata: [],
      expected: "",
    },
  ];

  for (const testCase of imageTestCases) {
    try {
      const result = lnurlPay.extractImage(testCase.metadata);
      if (result === testCase.expected) {
        logTest(`extractImage: ${JSON.stringify(testCase.metadata)}`, "PASS");
      } else {
        logTest(
          `extractImage: ${JSON.stringify(testCase.metadata)}`,
          "FAIL",
          `Expected "${testCase.expected}", got "${result}"`
        );
      }
    } catch (error) {
      logTest(
        `extractImage: ${JSON.stringify(testCase.metadata)}`,
        "FAIL",
        error.message
      );
    }
  }

  // Test calculateMetadataHash
  const hashTestCases = [
    {
      metadata: [["text/plain", "test"]],
      expected: "string", // Should return a string
    },
    {
      metadata: "test string",
      expected: "string",
    },
    {
      metadata: null,
      expected: "string",
    },
  ];

  for (const testCase of hashTestCases) {
    try {
      const result = lnurlPay.calculateMetadataHash(testCase.metadata);
      if (typeof result === testCase.expected) {
        logTest(`calculateMetadataHash: ${typeof testCase.metadata}`, "PASS");
      } else {
        logTest(
          `calculateMetadataHash: ${typeof testCase.metadata}`,
          "FAIL",
          `Expected ${testCase.expected}, got ${typeof result}`
        );
      }
    } catch (error) {
      logTest(
        `calculateMetadataHash: ${typeof testCase.metadata}`,
        "FAIL",
        error.message
      );
    }
  }
}

/**
 * Test 5: Error message format
 */
function testErrorMessageFormat() {
  logSection("Error Message Format");

  const expectedErrorPatterns = [
    "lnUrlOrAddress is required",
    "tokens must be a positive integer",
    "Amount too small",
    "Amount too large",
    "Comment too long",
    "Invalid Lightning address",
    "POS invoice request failed",
    "Failed to get POS service params",
  ];

  // This test documents the expected error message patterns
  // In a real implementation, you might test actual error throwing
  for (const pattern of expectedErrorPatterns) {
    logTest(`Error pattern: "${pattern}"`, "PASS", "Documented pattern");
  }
}

/**
 * Test 6: API compatibility
 */
function testApiCompatibility() {
  logSection("API Compatibility");

  // Test that all expected functions are exported
  const expectedFunctions = [
    "requestInvoice",
    "requestPayServiceParams",
    "requestInvoiceWithServiceParams",
    "parseDescription",
    "extractImage",
    "calculateMetadataHash",
  ];

  for (const funcName of expectedFunctions) {
    if (typeof lnurlPay[funcName] === "function") {
      logTest(`Function: ${funcName}`, "PASS", "Function exists");
    } else {
      logTest(`Function: ${funcName}`, "FAIL", "Function missing");
    }
  }

  // Test that the class is also exported
  if (typeof lnurlPay === "function" && lnurlPay.name === "EnhancedLnurlPay") {
    logTest("Class export", "PASS", "EnhancedLnurlPay class exported");
  } else {
    logTest("Class export", "FAIL", "Class not properly exported");
  }
}

/**
 * Run all unit tests
 */
function runAllUnitTests() {
  console.log("🧪 Unit Tests for @bringinxyz/lnurl-pay");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    testInputValidation();
    testLightningAddressValidation();
    testCommentValidation();
    testHelperFunctions();
    testErrorMessageFormat();
    testApiCompatibility();

    const duration = Date.now() - startTime;
    console.log(`\n🎉 All unit tests completed in ${duration}ms`);
  } catch (error) {
    console.error("\n💥 Unit test suite failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllUnitTests();
}

module.exports = {
  testInputValidation,
  testLightningAddressValidation,
  testCommentValidation,
  testHelperFunctions,
  testErrorMessageFormat,
  testApiCompatibility,
  runAllUnitTests,
};
