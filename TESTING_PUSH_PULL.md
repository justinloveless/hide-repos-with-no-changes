# Testing Push/Pull Feature

This guide provides step-by-step instructions for testing the new push/pull status feature.

## Prerequisites

- VS Code or Cursor with the extension installed
- At least 2 Git repositories in your workspace
- Both repositories should have remote upstreams configured

## Test Scenarios

### Test 1: Repository with Commits to Push

**Expected**: Repository should always be visible, never hidden

1. In one of your test repositories, make a commit:
   ```bash
   cd repo1
   echo "test" >> test.txt
   git add test.txt
   git commit -m "Test commit"
   ```

2. Enable hiding via the eye icon in the Source Control panel

3. **Verify**: The repository should remain visible even though it has no uncommitted changes

4. Push the commit:
   ```bash
   git push
   ```

5. **Verify**: The repository should now be hidden (if no other changes)

### Test 2: Repository with Commits to Pull (Default Behavior)

**Expected**: Repository should remain visible by default

1. On another machine/branch or using GitHub directly, create a commit in repo2 and push it

2. In your local workspace, make sure you're behind the remote:
   ```bash
   cd repo2
   git fetch
   # Do NOT pull yet
   ```

3. Enable hiding via the eye icon

4. **Verify**: The repository should remain visible (default: `hideReposWithPendingPulls` is false)

5. Pull the changes:
   ```bash
   git pull
   ```

6. **Verify**: The repository should now be hidden

### Test 3: Hide Repos with Pending Pulls Setting

**Expected**: Repository with only pending pulls can be hidden

1. Set up repo2 to be behind the remote again (see Test 2, steps 1-2)

2. Enable hiding

3. Open VS Code settings (Cmd/Ctrl + ,)

4. Search for "Hide Repos with Pending Pulls"

5. Enable the setting: `hideReposWithNoChanges.hideReposWithPendingPulls`

6. **Verify**: Repo2 should now be hidden (it only has commits to pull)

7. Make a local commit in repo2:
   ```bash
   cd repo2
   echo "local change" >> local.txt
   git add local.txt
   git commit -m "Local commit"
   ```

8. **Verify**: Repo2 should now be visible again (it has commits to push)

### Test 4: Multiple Status Types

**Expected**: Priority order: local changes > push > pull

1. Set up repo1 with uncommitted changes:
   ```bash
   cd repo1
   echo "uncommitted" >> temp.txt
   # Do NOT stage or commit
   ```

2. Enable hiding

3. **Verify**: Repo1 is visible (uncommitted changes)

4. Commit the changes:
   ```bash
   git add temp.txt
   git commit -m "Committed"
   ```

5. **Verify**: Repo1 is still visible (commits to push)

6. Push the changes:
   ```bash
   git push
   ```

7. **Verify**: Repo1 is now hidden (assuming no other changes)

### Test 5: Repository Without Upstream

**Expected**: Gracefully handled, treated as no push/pull

1. Create a new repository without pushing to remote:
   ```bash
   mkdir repo3
   cd repo3
   git init
   echo "test" > file.txt
   git add file.txt
   git commit -m "Initial commit"
   # Do NOT add remote or push
   ```

2. Add repo3 to your workspace

3. Enable hiding

4. **Verify**: Repo3 is hidden (no upstream, no changes)

5. Make an uncommitted change:
   ```bash
   echo "change" >> file.txt
   ```

6. **Verify**: Repo3 becomes visible

## Quick Test Checklist

- [ ] Repo with uncommitted changes → Always visible
- [ ] Repo with commits to push → Always visible
- [ ] Repo with commits to pull (default setting) → Visible
- [ ] Repo with commits to pull (hideReposWithPendingPulls = true) → Hidden
- [ ] Repo with no changes, push, or pull → Hidden
- [ ] Workspace root repositories → Never hidden
- [ ] Repository without upstream → Works without errors

## Debugging

If something doesn't work as expected:

1. Check the VS Code Developer Console (Help → Toggle Developer Tools)
2. Look for any error messages related to git commands
3. Verify that all repositories have proper git configurations:
   ```bash
   git config --get remote.origin.url
   git config --get branch.main.remote
   ```

4. Try the "Rescan Repositories" command from the Command Palette

