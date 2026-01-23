# Push/Pull Status Feature

## Overview

This document describes the new push/pull status checking feature added in version 0.0.3.

## Feature Description

The extension now checks for pending push and pull operations in addition to uncommitted changes when determining repository visibility.

## Behavior

### Always Visible (Never Hidden)

Repositories are **always kept visible** if they have:
1. **Uncommitted changes** (working tree, staged, or merge changes)
2. **Commits to push** to the remote

### Configurable Visibility

Repositories with **only commits to pull** (no local changes or pushable commits) can be:
- **Visible** (default): When `hideReposWithNoChanges.hideReposWithPendingPulls` is `false`
- **Hidden**: When `hideReposWithNoChanges.hideReposWithPendingPulls` is `true`

### Always Hidden

Repositories are hidden only when:
- No uncommitted changes
- No commits to push
- No commits to pull (OR the setting allows hiding repos with pending pulls)
- Not a workspace root directory

## Implementation Details

### New Function: `checkRepoStatus()`

```typescript
async function checkRepoStatus(repoPath: string): Promise<{
    hasChanges: boolean;
    hasPush: boolean;
    hasPull: boolean;
}>
```

This function performs the following Git operations:
1. `git status --porcelain` - checks for uncommitted changes
2. `git branch --show-current` - gets the current branch
3. `git rev-parse --abbrev-ref <branch>@{upstream}` - gets the upstream branch
4. `git rev-list <upstream>..<local> --count` - counts commits to push
5. `git rev-list <local>..<upstream> --count` - counts commits to pull

### Configuration Setting

- **Setting Name**: `hideReposWithNoChanges.hideReposWithPendingPulls`
- **Type**: Boolean
- **Default**: `false`
- **Description**: "Hide repositories that have commits to pull from the remote (but no local changes or pushable commits)"

### Updated Functions

1. **`updateRepositoryVisibility()`**
   - Now calls `checkRepoStatus()` for each repository
   - Considers push/pull status when determining visibility
   - Respects the `hideReposWithPendingPulls` setting

2. **`handleFileChange()`**
   - Updated to use `checkRepoStatus()`
   - Properly handles the new visibility logic with push/pull checks

## Use Cases

### Developer Working on Multiple Projects

**Scenario**: You have 10 repositories in your workspace. 8 are up-to-date, 1 has local changes, and 1 has commits ready to push.

**Result**: With hiding enabled, only 2 repositories are visible (the one with changes and the one ready to push).

### Team Collaboration with Frequent Updates

**Scenario**: Your team frequently pushes updates. Several repositories have commits you haven't pulled yet, but you haven't worked on them.

**Result**:
- **Default behavior** (`hideReposWithPendingPulls: false`): These repos remain visible so you don't miss important updates
- **Alternative** (`hideReposWithPendingPulls: true`): These repos are hidden until you're actively working on them

## Technical Notes

- All Git operations have a 5-second timeout to prevent hanging
- The extension gracefully handles repositories without upstream branches
- Debouncing is used to batch multiple file changes for better performance
- Push/pull checks work even for repositories not currently open in VS Code's Git extension

## Testing

To test this feature:

1. Create a test repository with an upstream remote
2. Make some commits locally without pushing
3. Enable hiding - the repository should remain visible
4. Push the commits
5. On another machine/branch, make commits and push them
6. Pull to get behind the remote
7. The repository should remain visible by default
8. Enable `hideReposWithPendingPulls` setting
9. The repository should now be hidden (if no local changes or pushable commits)

