# Open VSX Documentation Update

This document summarizes the updates made to add Open VSX publishing instructions to the project documentation.

## What Changed

The documentation has been updated to include comprehensive instructions for publishing the extension to Open VSX Registry in addition to the VS Code Marketplace.

### Files Updated

1. **PUBLISHING.md** - Main publishing guide
   - Updated title to mention both marketplaces
   - Added complete "Publishing to Open VSX Registry" section with:
     - Prerequisites
     - Step-by-step account setup
     - Namespace (publisher) creation
     - Personal Access Token creation
     - Installation of `ovsx` CLI tool
     - Publishing instructions
     - Instructions for publishing to both marketplaces
     - Checklist for Open VSX publishing
     - Comparison table between VS Code Marketplace and Open VSX
     - Troubleshooting section for Open VSX
     - Updated resources section with Open VSX links
     - Sample GitHub Actions workflow for automated publishing to both platforms

2. **READY_TO_PUBLISH.md** - Quick start publishing guide
   - Reorganized publishing steps into separate sections:
     - "Publishing to VS Code Marketplace"
     - "Publishing to Open VSX Registry"
     - "Publishing to Both Marketplaces"
   - Added Open VSX account setup steps
   - Added namespace creation instructions
   - Added `ovsx` CLI installation
   - Updated "What's Next?" section to include both marketplaces
   - Added URLs for both marketplace listings

3. **README.md** - User-facing documentation
   - Added "Installation" section mentioning both marketplaces
   - Listed which editors use which marketplace:
     - VS Code Marketplace: VS Code and Cursor
     - Open VSX: VSCodium, Gitpod, and other compatible editors

## What is Open VSX?

[Open VSX](https://open-vsx.org/) is an open-source, vendor-neutral registry for VS Code extensions maintained by the Eclipse Foundation. It's used by:

- **VSCodium** - Open source binaries of VS Code
- **Gitpod** - Cloud development environments
- **Eclipse Theia** - Cloud & Desktop IDE platform
- **Eclipse IDE** - With VS Code extension support
- Other VS Code-compatible editors

## Why Publish to Open VSX?

1. **Wider Reach** - Makes your extension available to users of VSCodium and other editors
2. **Open Source** - Supports the open-source ecosystem
3. **No Microsoft Account Required** - Uses GitHub or Eclipse Foundation accounts
4. **Free** - No cost to publish
5. **Easy** - Simple CLI tool similar to `vsce`

## Quick Publishing to Open VSX

```bash
# Install the CLI tool
npm install -g ovsx

# Package your extension (if not already done)
vsce package

# Publish to Open VSX
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_OVSX_TOKEN
```

## Getting Started with Open VSX

1. Create an account at https://open-vsx.org/ (use GitHub)
2. Create a namespace at https://open-vsx.org/user-settings/namespaces
3. Create an access token at https://open-vsx.org/user-settings/tokens
4. Install `ovsx`: `npm install -g ovsx`
5. Publish: `ovsx publish your-extension.vsix -p YOUR_TOKEN`

## Documentation Links

For complete details, see:
- **PUBLISHING.md** - Full step-by-step guide for both marketplaces
- **READY_TO_PUBLISH.md** - Quick reference guide
- [Open VSX Publishing Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)

---

*Updated: December 9, 2025*

