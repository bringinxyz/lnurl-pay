# Publishing Guide for @bringin/lnurl-pay

This guide explains how to publish the `@bringin/lnurl-pay` package to NPM.

## Prerequisites

1. **NPM Account**: You must have access to the `@bringin` organization on NPM
2. **Authentication**: Be logged in to NPM with the Bringin account
3. **Permissions**: Have publish access to the `@bringin` scope

## Publishing Steps

### 1. Login to NPM

```bash
# Login with Bringin account credentials
npm login

# Verify you're logged in as the correct user
npm whoami
```

### 2. Verify Package Configuration

Ensure the package.json has the correct scoped configuration:

```json
{
  "name": "@bringin/lnurl-pay",
  "publishConfig": {
    "access": "public"
  }
}
```

### 3. Run Tests

```bash
# Run all tests to ensure everything works
npm test

# Run examples to verify functionality
npm run example:basic
npm run example:pos
npm run example:comparison
```

### 4. Check Package Contents

```bash
# Preview what will be published
npm pack --dry-run
```

This should show:
- `index.js` (main library)
- `index.d.ts` (TypeScript definitions)
- `README.md` (documentation)
- `LICENSE` (MIT license)
- `examples/` (working examples)
- `docs/` (API documentation)

### 5. Publish the Package

```bash
# Publish with public access (required for scoped packages)
npm publish --access public
```

**Important**: The `--access public` flag is required for scoped packages to be publicly available.

### 6. Verify Publication

```bash
# Check the published package
npm info @bringin/lnurl-pay

# View package on NPM
open https://www.npmjs.com/package/@bringin/lnurl-pay
```

## Version Management

### Semantic Versioning

Follow semantic versioning for releases:

- **Patch** (1.0.x): Bug fixes and minor improvements
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

### Updating Version

```bash
# Update version (choose one)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Or manually edit package.json and run
npm version
```

## Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Examples work correctly
- [ ] Documentation is up to date
- [ ] Version number is correct
- [ ] Package name is `@bringin/lnurl-pay`
- [ ] `publishConfig.access` is set to `"public"`
- [ ] All files are included in the package
- [ ] No sensitive information is exposed

## Troubleshooting

### Common Issues

1. **Access Denied**
   ```bash
   npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@bringin/lnurl-pay
   ```
   - Ensure you're logged in with the correct account
   - Verify you have publish permissions to `@bringin` scope

2. **Package Already Exists**
   ```bash
   npm ERR! 409 Conflict - PUT https://registry.npmjs.org/@bringin/lnurl-pay
   ```
   - Update the version number before publishing

3. **Invalid Package Name**
   ```bash
   npm ERR! 400 Bad Request - PUT https://registry.npmjs.org/@bringin/lnurl-pay
   ```
   - Ensure package.json has the correct scoped name

### Getting Help

- **NPM Documentation**: https://docs.npmjs.com/
- **Scoped Packages**: https://docs.npmjs.com/about-scoped-packages
- **Publishing**: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry

## Post-Publication

After successful publication:

1. **Update Repository**: Push changes to GitHub
2. **Create Release**: Tag the release on GitHub
3. **Announce**: Share with the team and community
4. **Monitor**: Watch for any issues or feedback

## Security Considerations

- Never commit API keys or secrets
- Use `.npmignore` to exclude sensitive files
- Review package contents before publishing
- Keep dependencies updated

---

**Note**: This package is published under the `@bringin` scope, making it an official Bringin library. Ensure all changes meet Bringin's quality standards before publishing. 