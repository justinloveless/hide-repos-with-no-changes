# Hide Repos with No Changes

This extension helps you manage multi-repository workspaces by hiding repositories that have no changes in the Source Control panel.

## Features

- Toggle command to hide/show repositories with no changes
- Works with workspaces containing multiple Git repositories
- Toolbar button in the Source Control panel for quick access
- Visual indicator showing whether hiding is enabled (eye icon changes)
- Simple one-command toggle via Command Palette or toolbar button
- Badge count on Source Control panel showing number of uncommitted changes per repository (mimics VS Code default behavior that Cursor is missing)

## Usage

### Via Toolbar Button (Recommended)
1. Open the Source Control panel (View → SCM)
2. Look for the eye icon button in the toolbar at the top of the panel
3. Click the button to toggle hiding repositories with no changes
4. The icon will change:
   - Eye-closed icon (👁️‍🗨️): Hiding is enabled - repos with no changes are hidden
   - Eye icon (👁️): Hiding is disabled - all repos are visible

### Via Command Palette
1. Open the Command Palette (Cmd+Shift+P on macOS, Ctrl+Shift+P on Windows/Linux)
2. Run the command: "Toggle Hide Repos with No Changes"
3. Repositories without changes will be hidden from the Source Control panel
4. Run the command again to show all repositories

## Requirements

This extension requires the built-in Git extension to be enabled.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release of Hide Repos with No Changes extension.

