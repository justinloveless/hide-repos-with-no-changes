# PR Comment Monitor

The PR Comment Monitor is a powerful tool that automatically monitors GitHub Pull Requests for new comments and spawns background agents to address them.

## Overview

This feature polls GitHub CLI for comments on configured PRs at regular intervals. When new comments are detected:
1. A notification is shown to the user
2. A background agent is automatically spawned with context about the comment
3. The background agent can make code changes, respond to questions, or provide clarifications
4. Comment state is tracked to avoid duplicate processing

## Prerequisites

### GitHub CLI Installation
You must have GitHub CLI installed and authenticated:

```bash
# Install GitHub CLI
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# See: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate
gh auth login
```

Verify your installation:
```bash
gh --version
gh auth status
```

## Configuration

### Configuration File Location
`.vscode/pr-monitor-config.yaml` in your workspace root

### Configuration Format

```yaml
# List of PRs to monitor
prs:
  # Each PR requires owner, repo, and pr_number
  - owner: justinloveless
    repo: hide-repos-with-no-changes
    pr_number: 123
    
  - owner: microsoft
    repo: vscode
    pr_number: 456

# Polling interval in seconds (default: 300 = 5 minutes)
# Minimum recommended: 60 seconds to avoid rate limiting
polling_interval: 300

# Whether to automatically start monitoring on extension activation
# Default: false
auto_start: false
```

### Creating Configuration

1. Run command: **"PR Monitor: Open Configuration File"**
2. If the file doesn't exist, you'll be prompted to create it from the example
3. Edit the file to add your PRs
4. Save the file

## Usage

### Starting the Monitor

**Command:** `PR Monitor: Start Monitoring Comments`

This will:
- Load your configuration
- Verify GitHub CLI is available and authenticated
- Perform an initial check of all configured PRs
- Set up periodic polling based on your configured interval
- Show the output channel with monitoring logs

### Stopping the Monitor

**Command:** `PR Monitor: Stop Monitoring Comments`

This stops the periodic polling. Comment state is preserved.

### Manual Check

**Command:** `PR Monitor: Check for New Comments Now`

Forces an immediate check of all configured PRs without waiting for the next polling interval.

### Resetting State

**Command:** `PR Monitor: Reset Comment State`

Clears all tracked comment IDs. On the next check, all comments will be treated as new. This is useful if you want to reprocess comments or if you suspect the state is incorrect.

## How It Works

### Comment Detection

The monitor fetches two types of comments:
1. **Issue Comments** - General comments on the PR
2. **Review Comments** - Inline code comments on specific lines

Each comment is identified by a unique ID provided by GitHub.

### State Tracking

Comment state is stored in VS Code's global storage:
- Location: `.globalStorage/<extension-id>/pr-monitor-state.json`
- Contains: Last check time and seen comment IDs for each PR
- Persists across VS Code sessions

### Background Agent Spawning

When a new comment is detected, a background agent is spawned with:
- Comment author
- Comment timestamp
- Comment body/content
- File and line (for review comments)
- Direct link to the comment

The background agent receives a task to:
- Review the comment
- Address any questions or concerns
- Make necessary code changes
- Provide clarifications

### Notifications

When new comments are found:
1. A VS Code notification appears with comment details
2. Options to "View Comment" (opens in browser) or "Dismiss"
3. Output channel logs all activity

## API Endpoints Used

The monitor uses GitHub's REST API via GitHub CLI:
- `/repos/{owner}/{repo}/issues/{pr_number}/comments` - Fetch issue comments
- `/repos/{owner}/{repo}/pulls/{pr_number}/comments` - Fetch review comments

## Rate Limiting

GitHub API has rate limits:
- Authenticated: 5,000 requests/hour
- Each PR check uses 2 API calls

With default settings (5-minute intervals):
- Checks per hour: 12
- API calls per PR per hour: 24
- Max PRs at 5-minute intervals: ~208 PRs

**Recommendation:** Keep polling interval ≥ 60 seconds for safety.

## Troubleshooting

### "GitHub CLI (gh) is not installed or not in PATH"
- Install GitHub CLI: https://cli.github.com/
- Verify: `gh --version`
- Make sure it's in your PATH

### "Failed to load PR monitor configuration"
- Check that `.vscode/pr-monitor-config.yaml` exists
- Verify YAML syntax is correct
- Ensure at least one PR is configured

### No comments detected
- Verify PR numbers are correct
- Check GitHub CLI authentication: `gh auth status`
- Manually test: `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`
- Try resetting state: `PR Monitor: Reset Comment State`

### Background agent not spawning
- This feature requires Cursor IDE's background agent API
- In standard VS Code, notifications will still appear but auto-spawning may not work
- You can still view comments via notifications

## Examples

### Example 1: Monitor a Single PR
```yaml
prs:
  - owner: facebook
    repo: react
    pr_number: 28000

polling_interval: 300
auto_start: false
```

### Example 2: Monitor Multiple PRs with Auto-start
```yaml
prs:
  - owner: microsoft
    repo: vscode
    pr_number: 12345
  - owner: microsoft
    repo: typescript
    pr_number: 54321
  - owner: torvalds
    repo: linux
    pr_number: 98765

polling_interval: 180  # 3 minutes
auto_start: true        # Start automatically when VS Code opens
```

### Example 3: High-frequency Monitoring
```yaml
prs:
  - owner: urgent-org
    repo: critical-project
    pr_number: 999

polling_interval: 60  # 1 minute for urgent monitoring
auto_start: true
```

## Security Considerations

- Configuration file may contain PR information
- `.vscode/pr-monitor-config.yaml` is gitignored by default
- Only `.vscode/pr-monitor-config.example.yaml` should be committed
- State file is stored in VS Code's global storage (not in workspace)
- GitHub CLI uses your authenticated credentials

## Architecture

```
┌─────────────────────────────────────────┐
│  VS Code Extension Activation           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  PRCommentMonitor Instance              │
│  - Loads config from YAML               │
│  - Loads previous state                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Periodic Polling (setInterval)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  For Each PR:                           │
│  1. Fetch issue comments via gh CLI    │
│  2. Fetch review comments via gh CLI   │
│  3. Compare with seen comment IDs       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  New Comment Found?                     │
└──────────────┬──────────────────────────┘
               │ Yes
               ▼
┌─────────────────────────────────────────┐
│  1. Show notification                   │
│  2. Spawn background agent              │
│  3. Mark comment as seen                │
│  4. Save state                          │
└─────────────────────────────────────────┘
```

## Future Enhancements

Possible future improvements:
- Support for GitHub webhooks instead of polling
- Configurable filters (e.g., only comments from specific users)
- Integration with PR review workflows
- Custom background agent prompts per PR
- Support for multiple git hosting providers (GitLab, Bitbucket)
- Comment response templates
- Automatic PR status updates
