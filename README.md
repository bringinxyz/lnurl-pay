# @bringinxyz/lnurl-pay

[![npm version](https://badge.fury.io/js/%40bringinxyz%2Flnurl-pay.svg)](https://badge.fury.io/js/%40bringinxyz%2Flnurl-pay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/bringinxyz/bringin-lnurl-pay/actions/workflows/node.js.yml/badge.svg)](https://github.com/bringinxyz/bringin-lnurl-pay/actions/workflows/node.js.yml)

Enhanced LNURL Pay library with Bringin POS mode support. A drop-in replacement for `lnurl-pay` that enables micro-payments down to 20 satoshis.

## Features

- **Drop-in Compatibility**: Works exactly like `lnurl-pay` for standard usage
- **POS Mode**: Enable micro-payments with 99.9% lower minimums (20 sats vs 22,000+ sats)
- **Zero Breaking Changes**: Existing code continues to work without modification
- **Enhanced Validation**: Better error messages and input validation
- **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install @bringinxyz/lnurl-pay
```

## Quick Start

### Standard Usage (Same as lnurl-pay)

```javascript
const lnurlPay = require('@bringinxyz/lnurl-pay');

// Standard usage - works exactly like lnurl-pay
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 25000
});

console.log('Invoice:', invoice.invoice);
```

### POS Mode for Micro-Payments

```javascript
// Enable POS mode for micro-payments
const microInvoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 50,        // 50 sats vs 22,000 sats minimum!
  posMode: true,     // This makes it possible
  comment: 'Small tip'
});

console.log('Micro-payment invoice:', microInvoice.invoice);
```

## API Reference

### `requestInvoice(options)`

Request a Lightning invoice with optional POS mode support.

**Parameters:**
- `lnUrlOrAddress` (string, required): Lightning address or LNURL
- `tokens` (number, required): Amount in satoshis
- `comment` (string, optional): Payment comment
- `posMode` (boolean, optional): Enable POS mode for lower minimums (default: false)
- `onionAllowed` (boolean, optional): Allow onion URLs (default: false)
- `fetchGet` (function, optional): Custom fetch function
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise resolving to invoice response object

**Example:**
```javascript
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,
  posMode: true,
  comment: 'Test payment'
});
```

### `requestPayServiceParams(options)`

Get service parameters for a Lightning address.

**Parameters:**
- `lnUrlOrAddress` (string, required): Lightning address or LNURL
- `posMode` (boolean, optional): Enable POS mode (default: false)
- `onionAllowed` (boolean, optional): Allow onion URLs (default: false)
- `fetchGet` (function, optional): Custom fetch function
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise resolving to service parameters object

### `requestInvoiceWithServiceParams(options)`

Request invoice using pre-fetched service parameters (two-step process).

**Parameters:**
- `params` (object, required): Service parameters from `requestPayServiceParams`
- `tokens` (number, required): Amount in satoshis
- `comment` (string, optional): Payment comment
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise resolving to invoice response object

### Helper Functions

- `parseDescription(metadata)`: Extract description from metadata
- `extractImage(metadata)`: Extract image data from metadata
- `calculateMetadataHash(metadata)`: Calculate metadata hash

## Migration from lnurl-pay

This package is a drop-in replacement for `lnurl-pay`. Simply update your import:

```javascript
// Before
const lnurlPay = require('lnurl-pay');

// After
const lnurlPay = require('@bringinxyz/lnurl-pay');
```

All existing code will continue to work exactly as before. To enable POS mode for micro-payments, add `posMode: true` to your requests.

## Examples

### Basic Usage

```javascript
const lnurlPay = require('@bringinxyz/lnurl-pay');

async function basicExample() {
  const invoice = await lnurlPay.requestInvoice({
    lnUrlOrAddress: 'merchant@bringin.xyz',
    tokens: 25000
  });
  
  console.log('Invoice:', invoice.invoice);
  console.log('Description:', invoice.params.description);
}
```

### POS Mode for Micro-Payments

```javascript
async function posModeExample() {
  const microInvoice = await lnurlPay.requestInvoice({
    lnUrlOrAddress: 'merchant@bringin.xyz',
    tokens: 50,        // 50 sats - impossible with standard mode!
    posMode: true,     // Enable POS mode
    comment: 'Small tip'
  });
  
  console.log('Micro-payment invoice:', microInvoice.invoice);
}
```

### Two-Step Process

```javascript
async function twoStepExample() {
  // Step 1: Get service parameters
  const params = await lnurlPay.requestPayServiceParams({
    lnUrlOrAddress: 'merchant@bringin.xyz',
    posMode: true
  });
  
  // Step 2: Request invoice
  const invoice = await lnurlPay.requestInvoiceWithServiceParams({
    params: params,
    tokens: 75,
    comment: 'Two-step test'
  });
  
  console.log('Invoice:', invoice.invoice);
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run examples:

```bash
# Basic usage
node examples/basic-usage.js

# POS mode
node examples/pos-mode.js

# Comparison
node examples/comparison.js

# Two-step process
node examples/two-step-process.js
```

## POS Mode Benefits

- **Micro-payments**: Enable payments as low as 20 satoshis
- **99.9% Lower Minimums**: From 22,000+ sats to 20+ sats
- **Perfect for Tips**: Small amounts for content creators
- **Testing**: Low-cost testing of payment flows
- **Small Purchases**: Micro-transactions for digital goods

## Error Handling

The library provides clear error messages for common issues:

```javascript
try {
  const invoice = await lnurlPay.requestInvoice({
    lnUrlOrAddress: 'invalid-address',
    tokens: 10,
    posMode: false
  });
} catch (error) {
  console.log('Error:', error.message);
  // Examples:
  // "Invalid Lightning address format"
  // "Amount too small. Minimum: 22000 sats"
  // "Comment too long. Maximum: 144 characters"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [API Reference](docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/bringinxyz/bringin-lnurl-pay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bringinxyz/bringin-lnurl-pay/discussions)
- **Email**: support@bringin.xyz

## Changelog

### v1.0.0
- Initial release
- Drop-in compatibility with lnurl-pay
- POS mode for micro-payments
- Enhanced validation and error handling
- Full TypeScript support

---

**Made with [HEART] by Bringin** - Enabling micro-payments on the Lightning Network
