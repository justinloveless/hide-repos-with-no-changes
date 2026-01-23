# Change Log

All notable changes to the "hide-repos-with-no-changes" extension will be documented in this file.

## [Unreleased]

## [0.0.4] - 2026-01-23

### Changed
- Renamed configuration setting from `hideReposWithPendingPulls` to `showReposWithPendingPulls` for clarity
  - New setting: `hideReposWithNoChanges.showReposWithPendingPulls`
  - Default: `false` (repos behind remote are hidden by default)
  - When enabled: repos with commits to pull remain visible
- Clarified visibility behavior:
  - Repos with uncommitted changes: always visible
  - Repos ahead of remote (commits to push): always visible
  - Repos behind remote (commits to pull): visible only if `showReposWithPendingPulls` is enabled

## [0.0.3] - 2025-12-11

### Added
- Push/pull status checking for repositories
- Repositories with commits to push are now always visible (never hidden)
- New configuration setting: `hideReposWithNoChanges.hideReposWithPendingPulls`
  - Controls whether to hide repositories that only have commits to pull
  - Default: `false` (repos with pending pulls remain visible)
- Improved repository status detection with upstream branch tracking

### Changed
- Repository visibility logic now considers push/pull status in addition to local changes
- Enhanced `checkRepoStatus` function to provide detailed status information

## [0.0.2] - 2025-12-08

### Added
- Badge count on Source Control activity bar icon showing total number of uncommitted changes
- Displays aggregate count across all repositories on the Source Control icon (the icon you click to open the panel)
- Allows you to see you have changes even when the Source Control panel is closed
- Mimics VS Code default behavior that Cursor is missing

## [0.0.1] - 2025-12-08

### Added
- Initial release
- Toggle command to hide/show repositories with no changes
- Automatic visibility updates when repository state changes
- Support for workspaces with multiple Git repositories

