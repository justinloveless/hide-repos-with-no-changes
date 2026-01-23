# Quick Reference: Repository Visibility Rules

## When is a repository VISIBLE? ✅

A repository will be **visible** (not hidden) when:

1. **It has uncommitted changes**
   - Modified files
   - Staged files
   - Merge conflicts
   
2. **It has commits ready to push**
   - Local commits not yet pushed to remote
   
3. **It has commits to pull** (configurable)
   - Default: Repos with pending pulls stay visible
   - When `hideReposWithPendingPulls` is enabled: Repos with only pending pulls can be hidden

4. **It's a workspace root directory**
   - Workspace roots are NEVER hidden

## When is a repository HIDDEN? 👁️‍🗨️

A repository will be **hidden** when ALL of these are true:

- ❌ No uncommitted changes
- ❌ No commits to push
- ❌ No commits to pull (or setting allows hiding them)
- ❌ Not a workspace root directory
- ✅ Hiding is enabled (eye icon clicked)

## Priority Order (Most Important to Least)

1. **Workspace Root** → Always visible (highest priority)
2. **Uncommitted Changes** → Always visible
3. **Commits to Push** → Always visible
4. **Commits to Pull** → Depends on setting
   - Setting OFF (default): Visible
   - Setting ON: Can be hidden

## Configuration

### Setting: `hideReposWithNoChanges.hideReposWithPendingPulls`

**Default**: `false` (repos with pending pulls stay visible)

**When to use `true`**:
- You work with many repos that frequently have updates
- You only want to see repos you're actively working on
- You prefer to handle pulls separately/manually

**When to use `false`** (default):
- You want to be notified of available updates
- You work in a collaborative environment with frequent changes
- You prefer to see everything that needs attention

## Examples

### Example 1: Clean Repository
```
Status:
- No uncommitted changes
- No commits to push
- No commits to pull
- Not a workspace root

Result: HIDDEN ❌
```

### Example 2: Ready to Push
```
Status:
- No uncommitted changes
- 3 commits to push ✓
- No commits to pull

Result: VISIBLE ✅ (has commits to push)
```

### Example 3: Behind Remote (Default Setting)
```
Status:
- No uncommitted changes
- No commits to push
- 5 commits to pull ✓
- hideReposWithPendingPulls: false

Result: VISIBLE ✅ (has commits to pull, setting allows visibility)
```

### Example 4: Behind Remote (Setting Enabled)
```
Status:
- No uncommitted changes
- No commits to push
- 5 commits to pull ✓
- hideReposWithPendingPulls: true

Result: HIDDEN ❌ (only has pulls, setting allows hiding)
```

### Example 5: Active Development
```
Status:
- 3 modified files ✓
- 2 commits to push ✓
- 1 commit to pull ✓

Result: VISIBLE ✅ (has uncommitted changes)
```

### Example 6: Workspace Root (Any Status)
```
Status:
- No changes of any kind
- Is a workspace root folder ✓

Result: VISIBLE ✅ (workspace roots never hide)
```

## Toggle Control

**Icon in Source Control Panel:**
- 👁️ (Eye Open) = Hiding disabled, all repos visible
- 👁️‍🗨️ (Eye Closed) = Hiding enabled, clean repos hidden

**Command Palette:**
- "Toggle Hide Repos with No Changes"

## Tips

1. **Use the default setting** if you're unsure - it's safer and keeps you informed
2. **Enable the setting** if you have 10+ repos and want to focus on active work
3. **Workspace roots never hide** - your main projects always stay visible
4. **The eye icon shows current state** - click to toggle instantly
5. **Status updates automatically** - make a change and the repo reappears

