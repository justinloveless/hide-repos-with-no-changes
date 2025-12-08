# Publishing Guide for Hide Repos with No Changes Extension

This guide walks you through the steps to publish your VS Code extension to the Visual Studio Code Marketplace.

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

## Resources

- [VS Code Extension Publishing Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Marketplace](https://marketplace.visualstudio.com/)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)

## Support

If you encounter issues during publishing:
1. Check the [vsce GitHub issues](https://github.com/microsoft/vscode-vsce/issues)
2. Review the [VS Code Extension API documentation](https://code.visualstudio.com/api)
3. Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/visual-studio-code) with the `visual-studio-code` tag

