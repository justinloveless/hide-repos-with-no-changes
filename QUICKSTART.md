# Quick Start Guide

## Installation

### Option 1: Development Mode (Recommended for testing)
1. Open this folder in VS Code or Cursor
2. Press `F5` to launch the Extension Development Host
3. Your multi-repo workspace will open in the new window

### Option 2: Install as VSIX
1. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
2. Install the generated `.vsix` file through VS Code/Cursor

## Usage

### Step 1: Open Command Palette
- **macOS**: `Cmd + Shift + P`
- **Windows/Linux**: `Ctrl + Shift + P`

### Step 2: Run the Command
Type: `Toggle Hide Repos with No Changes`

### Step 3: View Results
- Check the Source Control panel
- Only repos with changes will be visible when the feature is enabled
- Run the command again to show all repos

## What Counts as "Changes"?

The extension hides repositories that have:
- ✅ No working tree changes (modified/deleted files)
- ✅ No staged changes (files in the index)
- ✅ No merge conflicts

A repository will remain visible if it has ANY of the above.

## Tips

- **Toggle quickly**: The command shows a notification indicating the current state
- **Automatic updates**: When hiding is enabled, repositories automatically appear/disappear as you make/discard changes
- **Focus on work**: With 47 repos, this helps you focus only on what you're actively working on

## Keyboard Shortcut (Optional)

You can add a keyboard shortcut by:
1. Open Keyboard Shortcuts (`Cmd+K Cmd+S` or `Ctrl+K Ctrl+S`)
2. Search for "Toggle Hide Repos with No Changes"
3. Click the `+` icon and assign your preferred shortcut (e.g., `Cmd+Shift+H`)

