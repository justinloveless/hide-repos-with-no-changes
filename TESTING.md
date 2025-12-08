# Testing Guide

## How to Test the Extension

### Prerequisites
1. VS Code (or Cursor) installed
2. A workspace with multiple Git repositories (47 sub-repos as mentioned in your use case)
3. Node.js and npm installed

### Installation Steps

1. **Build the extension:**
   ```bash
   cd /Users/justin.loveless/Code/vscode-ext-hide-repos-with-no-changes
   npm install
   npm run compile
   ```

2. **Run the extension in development mode:**
   - Open this folder in VS Code/Cursor
   - Press `F5` to launch a new Extension Development Host window
   - OR use the "Run Extension" configuration from the Debug panel

### Testing the Functionality

1. **Open your multi-repo workspace** in the Extension Development Host window

2. **Verify initial state:**
   - Open the Source Control panel (View → Source Control or `Ctrl+Shift+G`)
   - You should see all 47 repositories listed

3. **Test the toggle command:**
   - Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
   - Type "Toggle Hide Repos with No Changes"
   - Run the command
   - You should see a notification: "Hiding repositories with no changes"
   - Only repositories with changes should now be visible in the Source Control panel

4. **Test dynamic updates:**
   - With hiding enabled, make a change in a previously hidden repository
   - The repository should automatically appear in the Source Control panel
   - Discard or commit the changes
   - The repository should automatically hide again

5. **Test toggle off:**
   - Run the command again from the Command Palette
   - You should see: "Showing all repositories"
   - All repositories should now be visible again

### Expected Behavior

- **When toggle is ON:**
  - Only repositories with uncommitted changes are visible
  - This includes working tree changes, staged changes, and merge conflicts
  - Visibility updates automatically when you make or discard changes

- **When toggle is OFF:**
  - All repositories are visible (default VS Code behavior)

### Installing the Extension Permanently

If you want to use this extension in your regular Cursor/VS Code instance:

1. **Package the extension:**
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. **Install the .vsix file:**
   - In VS Code/Cursor: Extensions → Views and More Actions (•••) → Install from VSIX
   - Select the generated `hide-repos-with-no-changes-0.0.1.vsix` file

### Troubleshooting

**Issue:** Command doesn't appear in Command Palette
- Solution: Make sure the Git extension is enabled
- Try reloading the window (`Cmd+R` or `Ctrl+R`)

**Issue:** Repositories aren't hiding
- Solution: Check that the repositories actually have no changes
- Look at the console (Help → Toggle Developer Tools) for any error messages

**Issue:** Extension doesn't activate
- Solution: Check that `extensionDependencies` includes "vscode.git"
- Ensure you have at least one Git repository open

