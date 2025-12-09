# Publishing to Open VSX Registry (for Cursor and other VS Code alternatives)

This guide walks you through publishing your extension to Open VSX Registry, which is used by **Cursor, VSCodium, Gitpod**, and other VS Code alternatives.

## Why Open VSX?

- **Microsoft's VS Code Marketplace** is only available for official VS Code
- **Open VSX Registry** (https://open-vsx.org/) is an open-source alternative
- Cursor and many VS Code forks use Open VSX instead of Microsoft's marketplace

## Prerequisites

You need:
1. An Open VSX account (free)
2. A Personal Access Token from Open VSX
3. The `ovsx` CLI tool installed (✅ already installed)
4. Your extension packaged as a `.vsix` file (✅ you have `hide-repos-with-no-changes-0.0.1.vsix`)

## Step-by-Step Instructions

### Step 1: Create an Open VSX Account

1. Go to https://open-vsx.org/
2. Click **"Sign In"** in the top right
3. Sign in with GitHub (recommended) or Eclipse account
4. Complete the registration

### Step 2: Create a Personal Access Token

1. After signing in, go to https://open-vsx.org/user-settings/tokens
2. Click **"New Access Token"**
3. Give it a name like "Publishing Token"
4. Click **"Create new token"**
5. **COPY THE TOKEN** immediately - you won't be able to see it again!

### Step 3: Create a Namespace (Publisher)

Open VSX uses "namespaces" instead of "publishers":

1. Go to https://open-vsx.org/user-settings/namespaces
2. Click **"Create namespace"**
3. Enter a namespace name (this should match your `publisher` field in `package.json`)
   - For your extension, you're using `"jloveless"`
4. Click **"Create"**

**Note**: If the namespace name doesn't match exactly, you can either:
- Update your `package.json` publisher field to match, OR
- Request access to an existing namespace that matches

### Step 4: Publish Your Extension

Now you can publish using the `.vsix` file you already have:

```bash
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_ACCESS_TOKEN
```

**Alternative**: Store the token to avoid typing it each time:
```bash
# Set the token as an environment variable
export OVSX_PAT=YOUR_ACCESS_TOKEN

# Then publish without specifying it
ovsx publish hide-repos-with-no-changes-0.0.1.vsix
```

### Step 5: Verify Publication

1. Go to https://open-vsx.org/extension/jloveless/hide-repos-with-no-changes
2. Your extension should appear within a few minutes
3. Test in Cursor:
   - Open Cursor
   - Go to Extensions (Cmd+Shift+X)
   - Search for "Hide Repos with No Changes"
   - You should see your extension!

## Publishing to BOTH Marketplaces

You can (and should) publish to both marketplaces for maximum reach:

### For VS Code (Microsoft Marketplace)
```bash
vsce publish
```

### For Cursor and alternatives (Open VSX)
```bash
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_OVSX_TOKEN
```

## Updating Your Extension

When you release a new version:

1. Update your code
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Package the extension:
   ```bash
   vsce package
   ```
5. Publish to both marketplaces:
   ```bash
   # VS Code Marketplace
   vsce publish
   
   # Open VSX Registry
   ovsx publish hide-repos-with-no-changes-0.0.2.vsix -p YOUR_OVSX_TOKEN
   ```

## Automated Publishing (CI/CD)

You can automate publishing to both marketplaces using GitHub Actions. Here's a sample workflow:

```yaml
# .github/workflows/publish.yml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install vsce and ovsx
        run: |
          npm install -g @vscode/vsce
          npm install -g ovsx
      
      - name: Package extension
        run: vsce package
      
      - name: Publish to VS Code Marketplace
        run: vsce publish -p ${{ secrets.VSCE_PAT }}
      
      - name: Publish to Open VSX
        run: ovsx publish *.vsix -p ${{ secrets.OVSX_PAT }}
```

Then add `VSCE_PAT` and `OVSX_PAT` as secrets in your GitHub repository settings.

## Quick Commands Reference

```bash
# Install tools (if needed)
npm install -g @vscode/vsce  # For VS Code Marketplace
npm install -g ovsx          # For Open VSX Registry

# Package extension
vsce package

# Publish to VS Code Marketplace
vsce publish
# or with version bump
vsce publish patch  # 0.0.1 → 0.0.2

# Publish to Open VSX Registry
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_TOKEN

# Set token as environment variable (to avoid typing it each time)
export OVSX_PAT=YOUR_TOKEN
ovsx publish hide-repos-with-no-changes-0.0.1.vsix
```

## Troubleshooting

### Error: "Namespace 'jloveless' does not exist"
- You need to create the namespace on Open VSX first (Step 3)
- The namespace must match the `publisher` field in your `package.json`

### Error: "Insufficient access rights"
- Your access token might not have the right permissions
- Create a new token with publishing rights

### Extension not appearing in Cursor
- Wait 5-10 minutes after publishing
- Try restarting Cursor
- Clear Cursor's extension cache
- Verify the extension is visible on https://open-vsx.org

### Error: "Extension validation failed"
- Ensure your `.vsix` file is valid (you can test install it locally first)
- Check that all required fields in `package.json` are filled out

## Resources

- [Open VSX Registry](https://open-vsx.org/)
- [Open VSX CLI Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [Open VSX Publishing Wiki](https://github.com/eclipse/openvsx/wiki)
- [Cursor Documentation](https://cursor.sh/)

## Important Notes

1. **Two separate marketplaces**: VS Code Marketplace and Open VSX are completely independent. Publishing to one does NOT publish to the other.

2. **Same extension, two homes**: Your extension code doesn't need to change - you just publish the same `.vsix` file to both places.

3. **Version synchronization**: Try to keep versions synchronized between both marketplaces to avoid user confusion.

4. **Different URLs**: 
   - VS Code: `https://marketplace.visualstudio.com/items?itemName=jloveless.hide-repos-with-no-changes`
   - Open VSX: `https://open-vsx.org/extension/jloveless/hide-repos-with-no-changes`

## Next Steps

Now that you know how to publish to Open VSX:

1. Create your Open VSX account at https://open-vsx.org/
2. Create an access token
3. Create the `jloveless` namespace
4. Run: `ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_TOKEN`
5. Test in Cursor!

Your extension will then be available in both VS Code AND Cursor! 🎉


