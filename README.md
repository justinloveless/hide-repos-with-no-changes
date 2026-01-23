# Hide Repos with No Changes

This extension helps you manage multi-repository workspaces by hiding repositories that have no changes in the Source Control panel.

## Installation

Install this extension from:
- [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) - for VS Code and Cursor
- [Open VSX Registry](https://open-vsx.org/) - for VSCodium, Gitpod, and other compatible editors

## Features

- Toggle command to hide/show repositories with no changes
- Works with workspaces containing multiple Git repositories
- Toolbar button in the Source Control panel for quick access
- Visual indicator showing whether hiding is enabled (eye icon changes)
- Simple one-command toggle via Command Palette or toolbar button
- Badge count on Source Control activity bar icon showing total number of uncommitted changes across all repositories (mimics VS Code default behavior that Cursor is missing) - allows you to see you have changes even when the panel is closed
- Intelligent handling of push/pull status:
  - **Never hides** repositories with uncommitted changes
  - **Never hides** repositories with commits ready to push
  - **Configurable behavior** for repositories with commits to pull (see Settings below)

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

## Settings

This extension contributes the following settings:

- `hideReposWithNoChanges.hideReposWithPendingPulls`: (default: `false`)
  - When `false`: Repositories with commits to pull from the remote will remain visible, even if they have no local changes or pushable commits
  - When `true`: Repositories with only pending pulls (no local changes or pushable commits) will be hidden

**Note**: Repositories with commits to **push** are always visible, regardless of this setting.

## Requirements

This extension requires the built-in Git extension to be enabled.

## Known Issues

None at this time.

## Release Notes

### 0.0.3

- Added support for checking push/pull status of repositories
- Repositories with commits to push are now always visible
- Added configurable setting to control visibility of repositories with pending pulls
- Improved repository status detection with upstream tracking

### 0.0.2

Bug fixes and improvements.

### 0.0.1

Initial release of Hide Repos with No Changes extension.

