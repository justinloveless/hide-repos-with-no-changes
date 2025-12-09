# Hide Repos with No Changes

This extension helps you manage multi-repository workspaces by hiding repositories that have no changes in the Source Control panel. It also includes a PR comment monitoring tool that can automatically spawn background agents to address PR comments.

## Features

### Repository Management
- Toggle command to hide/show repositories with no changes
- Works with workspaces containing multiple Git repositories
- Toolbar button in the Source Control panel for quick access
- Visual indicator showing whether hiding is enabled (eye icon changes)
- Simple one-command toggle via Command Palette or toolbar button

### PR Comment Monitoring
- Monitor multiple PRs for new comments via GitHub CLI
- Automatically spawn background agents when new comments are detected
- Configure polling interval and PR list via YAML file
- Track comment state to avoid duplicate notifications
- Manual check and state reset commands

## Usage

### Repository Hiding

#### Via Toolbar Button (Recommended)
1. Open the Source Control panel (View → SCM)
2. Look for the eye icon button in the toolbar at the top of the panel
3. Click the button to toggle hiding repositories with no changes
4. The icon will change:
   - Eye-closed icon (👁️‍🗨️): Hiding is enabled - repos with no changes are hidden
   - Eye icon (👁️): Hiding is disabled - all repos are visible

#### Via Command Palette
1. Open the Command Palette (Cmd+Shift+P on macOS, Ctrl+Shift+P on Windows/Linux)
2. Run the command: "Toggle Hide Repos with No Changes"
3. Repositories without changes will be hidden from the Source Control panel
4. Run the command again to show all repositories

### PR Comment Monitoring

#### Setup
1. Open the Command Palette and run: **"PR Monitor: Open Configuration File"**
2. Configure your PRs to monitor in the YAML file:
   ```yaml
   prs:
     - owner: your-org
       repo: your-repo
       pr_number: 123
     - owner: another-org
       repo: another-repo
       pr_number: 456
   
   polling_interval: 300  # seconds (5 minutes)
   auto_start: false      # auto-start monitoring on extension activation
   ```
3. Save the configuration file

#### Start Monitoring
Run the command: **"PR Monitor: Start Monitoring Comments"**

The extension will:
- Check all configured PRs for new comments at the specified interval
- Show notifications when new comments are found
- Spawn background agents to address the comments automatically
- Track which comments have been seen to avoid duplicates

#### Available Commands
- **PR Monitor: Start Monitoring Comments** - Start the monitoring service
- **PR Monitor: Stop Monitoring Comments** - Stop the monitoring service
- **PR Monitor: Check for New Comments Now** - Force an immediate check
- **PR Monitor: Reset Comment State** - Clear all seen comments (treat all as new)
- **PR Monitor: Open Configuration File** - Open/create the configuration file

## Requirements

- The built-in Git extension must be enabled (for repository management)
- GitHub CLI (`gh`) must be installed and authenticated (for PR monitoring)
  - Install: https://cli.github.com/
  - Authenticate: `gh auth login`

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release of Hide Repos with No Changes extension.

