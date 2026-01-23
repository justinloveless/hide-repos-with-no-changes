# Summary of Changes - Version 0.0.3

## Overview
Added push/pull status checking functionality to the extension. Repositories are now evaluated based on uncommitted changes, commits to push, and commits to pull.

## Files Modified

### 1. `src/extension.ts`

#### New Function: `checkRepoStatus()`
- Replaces and extends `checkRepoHasChanges()`
- Returns an object with three boolean properties:
  - `hasChanges`: Uncommitted changes (working tree, staged, merge)
  - `hasPush`: Commits that can be pushed to remote
  - `hasPull`: Commits that can be pulled from remote
- Uses Git commands:
  - `git status --porcelain` - check for uncommitted changes
  - `git branch --show-current` - get current branch
  - `git rev-parse --abbrev-ref <branch>@{upstream}` - get upstream branch
  - `git rev-list <upstream>..<local> --count` - count commits to push
  - `git rev-list <local>..<upstream> --count` - count commits to pull
- Gracefully handles repositories without upstream branches
- All operations have 5-second timeout

#### Updated Function: `updateRepositoryVisibility()`
- Now reads the `hideReposWithPendingPulls` configuration setting
- Calls `checkRepoStatus()` for each repository
- Implements new visibility logic:
  - **Always visible**: repos with local changes OR commits to push
  - **Conditionally visible**: repos with commits to pull (depends on setting)
  - **Hidden**: repos with none of the above

#### Updated Function: `handleFileChange()`
- Uses `checkRepoStatus()` instead of `checkRepoHasChanges()`
- Respects the `hideReposWithPendingPulls` setting
- Properly reopens repositories when they gain push/pull status

#### Deprecated Function: `checkRepoHasChanges()`
- Marked as deprecated with JSDoc tag
- Now wraps `checkRepoStatus()` for backward compatibility
- Returns only the `hasChanges` boolean

### 2. `package.json`

#### Version Update
- Updated version from `0.0.2` to `0.0.3`

#### New Configuration Section
Added a new `configuration` section with:
- **Setting ID**: `hideReposWithNoChanges.hideReposWithPendingPulls`
- **Type**: Boolean
- **Default**: `false`
- **Description**: "Hide repositories that have commits to pull from the remote (but no local changes or pushable commits)"

### 3. `README.md`

#### Updated Features Section
- Added three new bullet points explaining push/pull behavior:
  - Never hides repos with uncommitted changes
  - Never hides repos with commits to push
  - Configurable behavior for repos with commits to pull

#### New Settings Section
- Documented the `hideReposWithPendingPulls` setting
- Explained the `false` (default) and `true` behaviors
- Added note about push commits always being visible

#### Updated Release Notes
- Added section for version 0.0.3
- Listed all new features and improvements

### 4. `CHANGELOG.md`

#### New Version Entry
- Added `[0.0.3] - 2025-12-11` section
- Documented:
  - Push/pull status checking
  - New configuration setting
  - Improved repository status detection
  - Changes to visibility logic

### 5. New Documentation Files

#### `PUSH_PULL_FEATURE.md`
- Comprehensive feature documentation
- Behavior description with all scenarios
- Implementation details
- Technical notes about Git operations
- Testing guidelines

#### `TESTING_PUSH_PULL.md`
- Step-by-step testing instructions
- 5 complete test scenarios
- Quick test checklist
- Debugging tips

## Visibility Decision Logic

```
Repository is visible if:
  hasLocalChanges (uncommitted) 
  OR hasPush (commits to push)
  OR (hasPull AND NOT hideReposWithPendingPulls)

Repository is hidden if:
  NOT visible (as above)
  AND NOT a workspace root directory
```

## Default Behavior Changes

### Before (v0.0.2)
- Repos visible only if they had uncommitted changes
- Push/pull status was ignored

### After (v0.0.3)
- Repos visible if uncommitted changes OR commits to push OR commits to pull (by default)
- User can configure whether to hide repos with only pending pulls

## Breaking Changes

None. The default behavior is backward compatible:
- Repos with uncommitted changes remain visible (same as before)
- Repos with push/pull status are now also visible (new feature, not breaking)
- The new setting defaults to `false`, which is the more conservative option

## Performance Considerations

- Git status checks are run for each repository during visibility updates
- All Git commands have 5-second timeouts
- File change debouncing (500ms) reduces unnecessary checks
- Checks are only performed when hiding is enabled

## Error Handling

- All Git command failures are caught and handled gracefully
- Missing upstream branches don't cause errors
- Repositories without remotes are treated as having no push/pull status
- Timeouts prevent hanging on slow Git operations

## Next Steps

1. Test the feature with real repositories
2. Monitor for any performance issues with large numbers of repositories
3. Consider adding user notification when repos become visible due to pull status
4. Potentially add fetch command integration to update remote status automatically

