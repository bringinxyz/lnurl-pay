# @bringin/lnurl-pay API Documentation

## Overview

`@bringin/lnurl-pay` is a drop-in replacement for the `lnurl-pay` library that adds support for Bringin's POS mode, enabling Lightning micro-payments as low as 20 satoshis instead of the standard 22,000+ satoshis minimum.

## Installation

```bash
npm install @bringin/lnurl-pay
```

**Optional dependency:** If you're using Node.js < 18, install axios for HTTP requests:
```bash
npm install axios
```

## Quick Start

```javascript
const lnurlPay = require('@bringin/lnurl-pay');

// Standard usage (same as lnurl-pay)
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 25000
});

// POS mode for micro-payments
const microInvoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,        // 100 sats vs 22,000 sats minimum!
  posMode: true,      // Enable micro-payments
  comment: 'Coffee tip'
});
```

## API Reference

### `requestInvoice(options)`

Requests a Lightning invoice with optional POS mode support.

**Parameters:**
- `options` (Object):
  - `lnUrlOrAddress` (string, required): Lightning address or LNURL
  - `tokens` (number, required): Amount in satoshis
  - `comment` (string, optional): Optional comment for the payment
  - `posMode` (boolean, optional): Enable POS mode for lower minimums (default: false)
  - `onionAllowed` (boolean, optional): Allow onion URLs (default: false)
  - `fetchGet` (Function, optional): Custom fetch function
  - `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise<InvoiceResponse>

**Example:**
```javascript
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,
  posMode: true,
  comment: 'Micro-payment test',
  timeout: 15000
});

console.log('Invoice:', invoice.invoice);
console.log('Description:', invoice.params.description);
```

### `requestPayServiceParams(options)`

Requests service parameters from a Lightning address or LNURL.

**Parameters:**
- `options` (Object):
  - `lnUrlOrAddress` (string, required): Lightning address or LNURL
  - `posMode` (boolean, optional): Enable POS mode (default: false)
  - `onionAllowed` (boolean, optional): Allow onion URLs (default: false)
  - `fetchGet` (Function, optional): Custom fetch function
  - `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise<PayServiceParams>

**Example:**
```javascript
const params = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  posMode: true
});

console.log('Minimum amount:', params.min, 'sats');
console.log('Maximum amount:', params.max, 'sats');
console.log('Comment allowed:', params.commentAllowed, 'characters');
```

### `requestInvoiceWithServiceParams(options)`

Requests an invoice using pre-fetched service parameters (two-step process).

**Parameters:**
- `options` (Object):
  - `params` (PayServiceParams, required): Service parameters from `requestPayServiceParams`
  - `tokens` (number, required): Amount in satoshis
  - `comment` (string, optional): Optional comment for the payment
  - `timeout` (number, optional): Request timeout in milliseconds (default: 30000)

**Returns:** Promise<InvoiceWithServiceParamsResponse>

**Example:**
```javascript
// Step 1: Get service parameters
const params = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  posMode: true
});

// Step 2: Request invoice
const invoice = await lnurlPay.requestInvoiceWithServiceParams({
  params: params,
  tokens: 75,
  comment: 'Two-step payment'
});
```

## Data Types

### InvoiceResponse

```typescript
interface InvoiceResponse {
  invoice: string;           // Lightning invoice (BOLT11)
  params: PayServiceParams;  // Service parameters
  successAction?: any;       // Success action data
  rawData: any;             // Raw response data
  hasValidAmount: boolean;   // Amount validation status
  hasValidDescriptionHash: boolean; // Description hash validation
  validatePreimage: () => boolean; // Preimage validation function
}
```

### PayServiceParams

```typescript
interface PayServiceParams {
  callback: string;          // Invoice request URL
  fixed: boolean;           // Whether amount is fixed
  min: number;              // Minimum amount in satoshis
  max: number;              // Maximum amount in satoshis
  domain: string;           // Service domain
  metadata: any[];          // Service metadata
  metadataHash: string;     // Metadata hash
  identifier: string;       // Lightning address
  description: string;      // Payment description
  image: string;            // Service image (base64)
  commentAllowed: number;   // Maximum comment length
  rawData?: any;           // Raw response data
}
```

### InvoiceWithServiceParamsResponse

```typescript
interface InvoiceWithServiceParamsResponse {
  invoice: string;          // Lightning invoice (BOLT11)
  successAction?: any;      // Success action data
  rawData: any;            // Raw response data
}
```

## Error Handling

The library throws descriptive errors for various failure scenarios:

```javascript
try {
  const invoice = await lnurlPay.requestInvoice({
    lnUrlOrAddress: 'merchant@bringin.xyz',
    tokens: 10,
    posMode: true
  });
} catch (error) {
  if (error.message.includes('Amount too small')) {
    console.log('Amount is below minimum');
  } else if (error.message.includes('Invalid Lightning address')) {
    console.log('Invalid address format');
  } else if (error.message.includes('Comment too long')) {
    console.log('Comment exceeds maximum length');
  } else {
    console.log('Network or service error:', error.message);
  }
}
```

**Common Error Messages:**
- `"lnUrlOrAddress is required"` - Missing required parameter
- `"tokens must be a positive integer"` - Invalid amount
- `"Amount too small. Minimum: X sats"` - Amount below service minimum
- `"Amount too large. Maximum: X sats"` - Amount above service maximum
- `"Comment too long. Maximum: X characters"` - Comment exceeds limit
- `"Invalid Lightning address format"` - Malformed address
- `"Request timeout after Xms"` - Network timeout
- `"POS invoice request failed: ..."` - POS mode specific errors

## Migration Guide

### From lnurl-pay

`@bringin/lnurl-pay` is a drop-in replacement for `lnurl-pay`. Your existing code will work unchanged:

```javascript
// Before (lnurl-pay)
const lnurlPay = require('lnurl-pay');
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@domain.com',
  tokens: 25000
});

// After (@bringin/lnurl-pay) - NO CHANGES NEEDED!
const lnurlPay = require('@bringin/lnurl-pay');
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@domain.com',
  tokens: 25000
});
```

### Adding POS Mode Support

To enable micro-payments, simply add the `posMode: true` option:

```javascript
// Standard mode (22,000+ sats minimum)
const standardInvoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 25000
});

// POS mode (20+ sats minimum)
const microInvoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,
  posMode: true  // Enable micro-payments
});
```

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```javascript
try {
  const invoice = await lnurlPay.requestInvoice({
    lnUrlOrAddress: address,
    tokens: amount,
    posMode: true
  });
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error.message.includes('Amount too small')) {
    // Show user-friendly message
    showError(`Minimum payment is ${minAmount} sats`);
  } else {
    // Log and show generic error
    console.error('Payment error:', error);
    showError('Payment request failed. Please try again.');
  }
}
```

### 2. Timeout Configuration

Set appropriate timeouts for your use case:

```javascript
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: address,
  tokens: amount,
  posMode: true,
  timeout: 10000  // 10 seconds for faster feedback
});
```

### 3. Two-Step Process

Use the two-step process when you need to show payment options before requesting an invoice:

```javascript
// Step 1: Get service parameters (can be cached)
const params = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: address,
  posMode: true
});

// Show payment options to user
showPaymentOptions(params.min, params.max, params.description);

// Step 2: Request invoice when user confirms
const invoice = await lnurlPay.requestInvoiceWithServiceParams({
  params: params,
  tokens: userSelectedAmount,
  comment: userComment
});
```

### 4. Validation

Validate inputs before making API calls:

```javascript
function validatePaymentRequest(address, amount) {
  if (!address || !address.includes('@')) {
    throw new Error('Invalid Lightning address');
  }
  
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Amount must be a positive integer');
  }
  
  return true;
}

// Usage
validatePaymentRequest(address, amount);
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: address,
  tokens: amount,
  posMode: true
});
```

## Browser Support

For browser environments, the library automatically uses the built-in `fetch` API. For older browsers, you may need to include a fetch polyfill:

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=fetch"></script>
<script src="@bringin/lnurl-pay.js"></script>
```

## Node.js Support

- **Node.js 18+**: Uses built-in `fetch` API
- **Node.js 14-17**: Requires `axios` as a peer dependency
- **Node.js < 14**: Not supported

## Examples

See the `examples/` directory for complete working examples:

- `basic-usage.js` - Drop-in replacement demonstration
- `pos-mode.js` - Micro-payment capabilities
- `comparison.js` - Standard vs POS mode comparison
- `two-step-process.js` - Two-step invoice process

## Support

- **GitHub Issues**: https://github.com/bringinxyz/bringin-lnurl-pay/issues
- **Documentation**: https://github.com/bringinxyz/bringin-lnurl-pay#readme
- **NPM Package**: https://www.npmjs.com/package/@bringin/lnurl-pay
- **Company Website**: https://bringin.xyz 