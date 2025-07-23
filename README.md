# @bringinxyz/lnurl-pay

Enhanced LNURL Pay with Bringin POS mode support for Lightning micro-payments

[![npm version](https://badge.fury.io/js/%40bringinxyz%2Flnurl-pay.svg)](https://www.npmjs.com/package/@bringinxyz/lnurl-pay)
[![Downloads](https://img.shields.io/npm/dm/@bringinxyz/lnurl-pay.svg)](https://www.npmjs.com/package/@bringinxyz/lnurl-pay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Official Bringin library for Lightning Network micro-payments**

## ⚡ Micro-Payments Enabled!

| Mode | Minimum Payment | Use Case |
|------|----------------|----------|
| **Standard** | 22,000+ sats (~$6-10) | Manual wallet payments |
| **POS Mode** | 20+ sats (~$0.01) | Micro-transactions, tips, small purchases |

**21,980 sats reduction = 99.9% lower minimums!**

### Quick Start

```javascript
const lnurlPay = require('@bringinxyz/lnurl-pay');

// ❌ This would fail with standard mode (below 22k sats minimum)
// ✅ This works with POS mode!
const microPayment = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,        // Just 100 sats! 
  posMode: true,      // Enable micro-payments
  comment: 'Coffee tip'
});

console.log('Micro-payment invoice:', microPayment.invoice);
```

## 🚀 Features

- **Drop-in Compatibility**: Works exactly like `lnurl-pay` - no code changes needed
- **Micro-Payment Support**: Enable payments as low as 20 sats vs 22,000+ sats
- **Smart HTTP Client**: Auto-detects fetch vs axios for optimal performance
- **TypeScript Support**: Full type definitions included
- **Production Ready**: Comprehensive error handling and validation
- **Real-World Tested**: Successfully tested with live Bringin endpoints

## 📦 Installation

```bash
# For Node 18+ (built-in fetch)
npm install @bringinxyz/lnurl-pay

# For older Node versions
npm install @bringinxyz/lnurl-pay axios
```

## 🔄 Migration from lnurl-pay

Migrating from `lnurl-pay` to `@bringinxyz/lnurl-pay` is seamless:

### Before (lnurl-pay)
```javascript
const lnurlPay = require('lnurl-pay');

const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 25000
});
```

### After (@bringinxyz/lnurl-pay)
```javascript
const lnurlPay = require('@bringinxyz/lnurl-pay');

// Same code works + new POS mode capability!
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,        // Now possible with posMode!
  posMode: true       // NEW: Enable micro-payments
});
```

**That's it!** Just change the require statement and optionally add `posMode: true` for micro-payments.

## 📖 Usage Examples

### Basic Usage (Drop-in Replacement)

```javascript
const lnurlPay = require('@bringinxyz/lnurl-pay');

// Standard usage - exactly same as lnurl-pay
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 25000
});

console.log('Works exactly like lnurl-pay:', invoice.invoice);
```

### Micro-Payments with POS Mode

```javascript
// Micro-payment that would be impossible with standard mode
const microInvoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 50,         // 50 sats vs 22,000 sats minimum!
  posMode: true,      // This makes it possible
  comment: 'Small tip'
});

console.log('Micro-payment invoice:', microInvoice.invoice);
```

### Side-by-Side Comparison

```javascript
// Get standard mode parameters
const standard = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  posMode: false
});

// Get POS mode parameters  
const pos = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  posMode: true
});

console.log('Standard minimum:', standard.min, 'sats');
console.log('POS minimum:', pos.min, 'sats');
console.log('Reduction:', standard.min - pos.min, 'sats');
console.log('Percentage improvement:', 
  ((standard.min - pos.min) / standard.min * 100).toFixed(1) + '%');
```

### Two-Step Process

```javascript
// Step 1: Get service parameters
const params = await lnurlPay.requestPayServiceParams({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  posMode: true
});

// Step 2: Request invoice using the parameters
const invoice = await lnurlPay.requestInvoiceWithServiceParams({
  params: params,
  tokens: 75
});
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run integration tests
npm test

# Run examples
npm run example:basic
npm run example:pos
npm run example:comparison
```

## 📚 API Documentation

See [docs/API.md](docs/API.md) for complete API documentation including:

- Full function reference
- Data types and interfaces
- Error handling guide
- Best practices
- Migration examples

## 🔧 Configuration

### HTTP Client Selection

The library automatically chooses the best HTTP client:

- **Node.js 18+**: Uses built-in `fetch` API
- **Node.js 14-17**: Uses `axios` (if installed)
- **Browser**: Uses built-in `fetch` API

### Timeout Configuration

```javascript
const invoice = await lnurlPay.requestInvoice({
  lnUrlOrAddress: 'merchant@bringin.xyz',
  tokens: 100,
  posMode: true,
  timeout: 15000  // 15 second timeout
});
```

## 🛡️ Error Handling

The library provides clear, actionable error messages:

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
  } else {
    console.log('Network or service error:', error.message);
  }
}
```

## 🌟 Key Benefits

### For Developers
- **Zero Migration Cost**: Existing `lnurl-pay` code works unchanged
- **Enhanced Capabilities**: Add micro-payment support with one parameter
- **TypeScript Ready**: Full type definitions for better development experience
- **Production Quality**: Comprehensive error handling and validation

### For Users
- **Micro-Payments**: Pay as little as 20 sats instead of 22,000+ sats
- **Lower Barriers**: Enable tips, small purchases, and micro-transactions
- **Same Experience**: Works with existing Lightning wallets and apps

### For Merchants
- **New Revenue Streams**: Accept micro-payments for digital content
- **Better UX**: No minimum payment barriers for small purchases
- **Lightning Fast**: Instant settlement for micro-transactions

## 🏢 Professional Branding

As an official Bringin package, `@bringinxyz/lnurl-pay` provides:

- **Guaranteed Quality**: Official Bringin development standards
- **Long-term Support**: Backed by the Bringin team
- **Package Discovery**: Easy to find under `@bringinxyz` namespace
- **Trust Factor**: Users know it's the official Bringin package
- **Future Growth**: Part of the Bringin ecosystem

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: https://github.com/bringinxyz/lnurl-pay/issues
- **Documentation**: https://github.com/bringinxyz/lnurl-pay#readme
- **NPM Package**: https://www.npmjs.com/package/@bringinxyz/lnurl-pay
- **Company Website**: https://bringin.xyz

## 🙏 Acknowledgments

- Built on top of the excellent `lnurl-pay` library
- Powered by Bringin's POS mode technology
- Community feedback and testing

---

**Ready to enable micro-payments?** Install `@bringinxyz/lnurl-pay` today and unlock 99.9% lower minimum payments! ⚡
