# Publishing Guide for Hide Repos with No Changes Extension

This guide walks you through the steps to publish your VS Code extension to both the Visual Studio Code Marketplace and Open VSX Registry.

## Prerequisites

Before you can publish, you need:
1. A Microsoft/Azure account
2. An Azure DevOps organization
3. A Personal Access Token (PAT)
4. The `vsce` tool installed

## Step-by-Step Publishing Instructions

### Step 1: Update Package.json Metadata

Before publishing, update the following fields in `package.json`:

1. **publisher**: Replace `"your-publisher-name"` with your actual publisher name
   - You'll create this publisher ID on the marketplace
   
2. **repository.url**: Replace with your actual GitHub repository URL
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/YOUR-USERNAME/hide-repos-with-no-changes.git"
   }
   ```

3. **bugs.url**: Update with your GitHub issues URL
   ```json
   "bugs": {
     "url": "https://github.com/YOUR-USERNAME/hide-repos-with-no-changes/issues"
   }
   ```

4. **homepage**: Update with your GitHub homepage
   ```json
   "homepage": "https://github.com/YOUR-USERNAME/hide-repos-with-no-changes#readme"
   ```

### Step 2: Create a Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft account
3. Click "Create Publisher"
4. Fill in the details:
   - **ID**: This will be your publisher name (must be unique, lowercase, no spaces)
   - **Display Name**: Your public-facing publisher name
   - **Description**: Brief description of you or your organization
5. Save the publisher

### Step 3: Create a Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Create an organization if you don't have one:
   - Click "New organization"
   - Follow the prompts
3. Click on "User Settings" (top right) → "Personal access tokens"
4. Click "+ New Token"
5. Configure the token:
   - **Name**: "VS Code Extension Publishing" (or similar)
   - **Organization**: Select your organization
   - **Expiration**: Choose an appropriate duration
   - **Scopes**: Select "Custom defined" and check **"Marketplace (Manage)"**
6. Click "Create" and **COPY THE TOKEN** (you won't be able to see it again!)

### Step 4: Install vsce Tool

Install the Visual Studio Code Extension Manager globally:

```bash
npm install -g @vscode/vsce
```

### Step 5: Login with vsce

Use the PAT you created to login:

```bash
vsce login YOUR-PUBLISHER-NAME
```

When prompted, paste your Personal Access Token.

### Step 6: Package the Extension (Optional)

Before publishing, you can test packaging locally:

```bash
vsce package
```

This creates a `.vsix` file that you can:
- Install locally to test: Extensions → Install from VSIX
- Share with others
- Upload manually to the marketplace

### Step 7: Publish the Extension

When you're ready to publish:

```bash
vsce publish
```

This will:
1. Run `npm run vscode:prepublish` (compiles TypeScript)
2. Package the extension
3. Upload it to the marketplace

**Alternative**: Publish with a version bump:
```bash
vsce publish patch  # Bumps 0.0.1 → 0.0.2
vsce publish minor  # Bumps 0.0.1 → 0.1.0
vsce publish major  # Bumps 0.0.1 → 1.0.0
```

### Step 8: Verify Publication

1. Go to https://marketplace.visualstudio.com/manage/publishers/YOUR-PUBLISHER-NAME
2. You should see your extension listed
3. It may take a few minutes to appear in the marketplace search
4. Visit your extension's page: `https://marketplace.visualstudio.com/items?itemName=YOUR-PUBLISHER-NAME.hide-repos-with-no-changes`

## Updating Your Extension

When you want to publish an update:

1. Update the code
2. Update `CHANGELOG.md` with changes
3. Update version in `package.json` (or use `vsce publish patch/minor/major`)
4. Commit and push to GitHub
5. Run `vsce publish` (or `vsce publish patch`)

## Publishing Checklist

Before publishing, ensure:

- [ ] All console.log debug statements removed ✅
- [ ] Extension compiles without errors (`npm run compile`) ✅
- [ ] Extension tested in development mode (F5) ✅
- [ ] README.md is complete and user-friendly ✅
- [ ] CHANGELOG.md is updated ✅
- [ ] LICENSE file exists ✅
- [ ] package.json metadata is correct (publisher, repository, etc.)
- [ ] .vscodeignore excludes development files ✅
- [ ] Version number is appropriate (use semantic versioning)
- [ ] Extension icon added (optional, but recommended)

## Optional Enhancements

### Add an Extension Icon

1. Create a 128x128 PNG icon
2. Save it as `icon.png` in the root directory
3. Add to `package.json`:
   ```json
   "icon": "icon.png"
   ```

### Add a Badge

Add marketplace badges to your README.md:

```markdown
[![Version](https://img.shields.io/visual-studio-marketplace/v/YOUR-PUBLISHER.hide-repos-with-no-changes)](https://marketplace.visualstudio.com/items?itemName=YOUR-PUBLISHER.hide-repos-with-no-changes)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/YOUR-PUBLISHER.hide-repos-with-no-changes)](https://marketplace.visualstudio.com/items?itemName=YOUR-PUBLISHER.hide-repos-with-no-changes)
```

## Troubleshooting

### Error: "Publisher 'your-publisher-name' is not a valid publisher"
- You need to update the `publisher` field in `package.json` with your actual publisher ID

### Error: "Failed to authenticate"
- Your PAT may have expired or lacks the correct scope (Marketplace - Manage)
- Create a new token and login again with `vsce login`

### Error: "Extension validation failed"
- Check that all required fields in `package.json` are filled out
- Ensure your extension compiles successfully
- Review the error message for specific issues

### Extension not appearing in marketplace search
- Wait 5-10 minutes after publishing
- Clear your browser cache
- Check your publisher dashboard to ensure it's published

---

# Publishing to Open VSX Registry

[Open VSX](https://open-vsx.org/) is an open-source registry for VS Code extensions, used by editors like VSCodium, Gitpod, Eclipse Theia, and others. Publishing to Open VSX ensures your extension is available to users of these editors.

## Prerequisites

Before you can publish to Open VSX, you need:
1. An Open VSX account
2. A Personal Access Token (PAT) for Open VSX
3. The `ovsx` tool installed
4. Your extension packaged as a `.vsix` file

## Step-by-Step Open VSX Publishing Instructions

### Step 1: Create an Open VSX Account

1. Go to https://open-vsx.org/
2. Click "Sign In" in the top right
3. Sign in using one of these providers:
   - GitHub (recommended)
   - Eclipse Foundation account
4. Complete your profile

### Step 2: Create a Namespace (Publisher)

In Open VSX, your publisher is called a "namespace":

1. Go to https://open-vsx.org/user-settings/namespaces
2. Click "Create Namespace"
3. Enter your namespace name:
   - Must be unique
   - Should match your VS Code Marketplace publisher name if possible
   - Lowercase, no spaces
4. Save the namespace

### Step 3: Create a Personal Access Token

1. Go to https://open-vsx.org/user-settings/tokens
2. Click "Create Access Token"
3. Configure the token:
   - **Description**: "Extension Publishing" (or similar)
   - **Expiration**: Choose an appropriate duration (or no expiration)
4. Click "Create" and **COPY THE TOKEN** (you won't be able to see it again!)

### Step 4: Install ovsx Tool

Install the Open VSX CLI tool globally:

```bash
npm install -g ovsx
```

### Step 5: Package Your Extension

If you haven't already packaged your extension:

```bash
vsce package
```

This creates a `.vsix` file (e.g., `hide-repos-with-no-changes-0.0.1.vsix`).

### Step 6: Publish to Open VSX

Publish using the `ovsx` CLI:

```bash
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_ACCESS_TOKEN
```

Or set the token as an environment variable:

```bash
export OVSX_PAT=YOUR_ACCESS_TOKEN
ovsx publish hide-repos-with-no-changes-0.0.1.vsix
```

### Step 7: Verify Publication

1. Go to https://open-vsx.org/
2. Search for your extension name
3. Visit your extension's page: `https://open-vsx.org/extension/YOUR-NAMESPACE/hide-repos-with-no-changes`
4. Verify all information is correct

## Publishing to Both Marketplaces

To publish to both VS Code Marketplace and Open VSX:

```bash
# Compile and package
npm run compile
vsce package

# Publish to VS Code Marketplace
vsce publish

# Publish to Open VSX
ovsx publish hide-repos-with-no-changes-0.0.1.vsix -p YOUR_OVSX_TOKEN
```

**Pro tip**: You can automate this in your CI/CD pipeline (GitHub Actions, etc.)

## Updating Your Extension on Open VSX

When you want to publish an update to Open VSX:

1. Update your code and version number
2. Package the new version: `vsce package`
3. Publish to Open VSX: `ovsx publish hide-repos-with-no-changes-X.X.X.vsix -p YOUR_TOKEN`

## Open VSX Publishing Checklist

Before publishing to Open VSX, ensure:

- [ ] Extension is already packaged as a `.vsix` file
- [ ] You have an Open VSX account
- [ ] You've created a namespace (publisher)
- [ ] You have a valid Personal Access Token
- [ ] The `ovsx` tool is installed
- [ ] Your extension works in other VS Code-compatible editors (optional but recommended)

## Differences Between VS Code Marketplace and Open VSX

| Feature | VS Code Marketplace | Open VSX |
|---------|-------------------|----------|
| **Account Provider** | Microsoft/Azure | GitHub/Eclipse |
| **CLI Tool** | `vsce` | `ovsx` |
| **Used By** | VS Code, Cursor | VSCodium, Gitpod, Theia, Eclipse IDE |
| **Token Scope** | Azure DevOps Marketplace | Open VSX Access Token |
| **Approval Process** | Automatic (with validation) | Automatic |
| **Cost** | Free | Free |

## Troubleshooting Open VSX

### Error: "Extension ... could not be found"
- Make sure you've created a namespace that matches your extension's publisher name
- Verify the namespace is active in your account settings

### Error: "Authentication failed"
- Your PAT may have expired
- Ensure you're using the correct token from https://open-vsx.org/user-settings/tokens

### Error: "Extension validation failed"
- Ensure your `.vsix` file is valid (test it with `vsce package` first)
- Check that all required fields in `package.json` are filled out correctly

### Extension not appearing in Open VSX search
- Wait a few minutes after publishing
- Clear your browser cache
- Verify the extension appears in your namespace dashboard

## Resources

**VS Code Marketplace:**
- [VS Code Extension Publishing Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Marketplace](https://marketplace.visualstudio.com/)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)

**Open VSX:**
- [Open VSX Registry](https://open-vsx.org/)
- [Open VSX Publishing Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [ovsx CLI Reference](https://github.com/eclipse/openvsx/tree/master/cli)
- [Open VSX FAQ](https://github.com/eclipse/openvsx/wiki)

## Automation with CI/CD

You can automate publishing to both marketplaces using GitHub Actions. Here's a sample workflow:

```yaml
name: Publish Extension

on:
  release:
    types: [published]

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
        run: npm ci
      
      - name: Compile
        run: npm run compile
      
      - name: Install vsce and ovsx
        run: npm install -g @vscode/vsce ovsx
      
      - name: Publish to VS Code Marketplace
        run: vsce publish -p ${{ secrets.VSCE_TOKEN }}
      
      - name: Publish to Open VSX
        run: ovsx publish -p ${{ secrets.OVSX_TOKEN }}
```

Store your tokens as secrets in GitHub:
- `VSCE_TOKEN`: Your Azure DevOps PAT
- `OVSX_TOKEN`: Your Open VSX PAT

## Support

If you encounter issues during publishing:

**VS Code Marketplace:**
1. Check the [vsce GitHub issues](https://github.com/microsoft/vscode-vsce/issues)
2. Review the [VS Code Extension API documentation](https://code.visualstudio.com/api)

**Open VSX:**
1. Check the [Open VSX GitHub issues](https://github.com/eclipse/openvsx/issues)
2. Review the [Open VSX wiki](https://github.com/eclipse/openvsx/wiki)

**General:**
3. Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/visual-studio-code) with the `visual-studio-code` tag

