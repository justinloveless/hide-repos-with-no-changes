import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GitExtension {
    getAPI(version: number): GitAPI;
}

interface GitAPI {
    repositories: Repository[];
    onDidOpenRepository: vscode.Event<Repository>;
    onDidCloseRepository: vscode.Event<Repository>;
}

interface Repository {
    rootUri: vscode.Uri;
    state: RepositoryState;
    ui: RepositoryUI;
    inputBox: vscode.SourceControlInputBox;
    sourceControl: vscode.SourceControl;
}

interface RepositoryState {
    workingTreeChanges: Change[];
    indexChanges: Change[];
    mergeChanges: Change[];
}

interface RepositoryUI {
    selected: boolean;
    onDidChange: vscode.Event<void>;
}

interface Change {
    uri: vscode.Uri;
    status: number;
}

let isHidingEnabled = false;
let gitAPI: GitAPI | undefined;
// Track ALL repos we know about (both open and closed)
let allKnownRepos: Map<string, vscode.Uri> = new Map();
// Track which repos are currently hidden
let currentlyHiddenRepos: Set<string> = new Set();
// File system watcher for detecting changes in closed repos
let fileWatcher: vscode.FileSystemWatcher | undefined;
// Debounce timers for checking hidden repos
let hiddenRepoCheckTimers: Map<string, NodeJS.Timeout> = new Map();

async function scanDirectoryForGitRepos(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<string[]> {
    const repos: string[] = [];
    
    if (currentDepth > maxDepth) {
        return repos;
    }
    
    try {
        // First, check if the directory itself is a git repository
        const gitPath = path.join(dirPath, '.git');
        if (fs.existsSync(gitPath)) {
            repos.push(dirPath);
        }
        
        // Then scan subdirectories
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            
            // Skip node_modules and other common non-repo directories
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) {
                continue;
            }
            
            const fullPath = path.join(dirPath, entry.name);
            
            // Recursively scan subdirectories
            const subRepos = await scanDirectoryForGitRepos(fullPath, maxDepth, currentDepth + 1);
            repos.push(...subRepos);
        }
    } catch (e) {
        // Silently ignore directories we can't access
    }
    
    return repos;
}

async function discoverAllGitRepositories() {
    // Scan all workspace folders
    if (vscode.workspace.workspaceFolders) {
        for (const folder of vscode.workspace.workspaceFolders) {
            const repos = await scanDirectoryForGitRepos(folder.uri.fsPath);
            
            for (const repoPath of repos) {
                if (!allKnownRepos.has(repoPath)) {
                    const repoUri = vscode.Uri.file(repoPath);
                    allKnownRepos.set(repoPath, repoUri);
                }
            }
        }
    }
    
    // Also add any repos that Git extension already knows about
    if (gitAPI) {
        gitAPI.repositories.forEach(repo => {
            if (!allKnownRepos.has(repo.rootUri.fsPath)) {
                allKnownRepos.set(repo.rootUri.fsPath, repo.rootUri);
            }
        });
    }
}

/**
 * Open all workspace root repositories that VS Code might not auto-open.
 * This is especially important for root workspace folders that are git repos,
 * as VS Code with "git.autoRepositoryDetection": "subFolders" won't open them.
 */
async function openWorkspaceRootRepositories() {
    if (!vscode.workspace.workspaceFolders || !gitAPI) {
        return;
    }
    
    for (const folder of vscode.workspace.workspaceFolders) {
        const folderPath = folder.uri.fsPath;
        
        // Check if this workspace folder is a git repository
        if (allKnownRepos.has(folderPath)) {
            // Check if it's already open in the Git extension
            const isAlreadyOpen = gitAPI.repositories.some(
                repo => repo.rootUri.fsPath === folderPath
            );
            
            if (!isAlreadyOpen) {
                try {
                    await vscode.commands.executeCommand('git.openRepository', folderPath);
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    // Silently continue if we can't open a repository
                }
            }
        }
    }
}

/**
 * Check if a repository path is a workspace root folder.
 */
function isWorkspaceRoot(repoPath: string): boolean {
    if (!vscode.workspace.workspaceFolders) {
        return false;
    }
    
    const normalizedRepoPath = path.normalize(repoPath);
    
    for (const folder of vscode.workspace.workspaceFolders) {
        const normalizedFolderPath = path.normalize(folder.uri.fsPath);
        if (normalizedRepoPath === normalizedFolderPath) {
            return true;
        }
    }
    
    return false;
}

/**
 * Find which repository a file belongs to by checking if the file path
 * starts with any of the known repository paths.
 * Returns the most specific (deepest/longest) repo path that contains the file.
 */
function findRepoForFile(filePath: string): string | undefined {
    // Normalize the file path
    const normalizedFilePath = path.normalize(filePath);
    
    let bestMatch: string | undefined = undefined;
    let bestMatchLength = 0;
    
    // Check each known repository to see if this file is inside it
    // Find the most specific (longest matching path) repository
    for (const [repoPath] of allKnownRepos) {
        const normalizedRepoPath = path.normalize(repoPath);
        // Check if the file is within this repo
        if (normalizedFilePath.startsWith(normalizedRepoPath + path.sep) || 
            normalizedFilePath === normalizedRepoPath) {
            // Keep track of the longest (most specific) matching repo path
            if (normalizedRepoPath.length > bestMatchLength) {
                bestMatch = repoPath;
                bestMatchLength = normalizedRepoPath.length;
            }
        }
    }
    
    return bestMatch;
}

/**
 * Check if a repository has any Git changes by running git status --porcelain.
 * This works even if the repo is not currently open in the Git extension.
 */
async function checkRepoHasChanges(repoPath: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync('git status --porcelain', {
            cwd: repoPath,
            timeout: 5000 // 5 second timeout
        });
        
        // If git status --porcelain returns any output, there are changes
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Update the badge count for all repositories to show the number of files with uncommitted changes.
 * This mimics the VS Code default behavior that Cursor is missing.
 */
function updateRepositoryBadges() {
    if (!gitAPI) {
        return;
    }

    gitAPI.repositories.forEach(repo => {
        try {
            // Count total number of files with changes (working tree + index + merge)
            const totalChanges = 
                repo.state.workingTreeChanges.length +
                repo.state.indexChanges.length +
                repo.state.mergeChanges.length;
            
            // Set the badge count on the source control
            if (repo.sourceControl) {
                repo.sourceControl.count = totalChanges;
            }
        } catch (error) {
            // Silently continue if we can't set the badge
        }
    });
}

/**
 * Handle a file change by checking if it belongs to a hidden repo,
 * and if that repo now has changes, reopen it.
 */
async function handleFileChange(uri: vscode.Uri) {
    if (!isHidingEnabled) {
        return;
    }
    
    const filePath = uri.fsPath;
    
    // Find which repo this file belongs to
    const repoPath = findRepoForFile(filePath);
    
    if (!repoPath) {
        return;
    }
    
    // Check if this repo is currently hidden
    if (!currentlyHiddenRepos.has(repoPath)) {
        return;
    }
    
    // Debounce: if there's already a pending check for this repo, clear it
    const existingTimer = hiddenRepoCheckTimers.get(repoPath);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }
    
    // Schedule a check after a short delay to batch multiple file changes
    const timer = setTimeout(async () => {
        hiddenRepoCheckTimers.delete(repoPath);
        
        const hasChanges = await checkRepoHasChanges(repoPath);
        
        if (hasChanges) {
            // Remove from hidden set
            currentlyHiddenRepos.delete(repoPath);
            
            // Reopen the repository
            try {
                const repoUri = allKnownRepos.get(repoPath);
                if (repoUri) {
                    await vscode.commands.executeCommand('git.openRepository', repoUri.fsPath);
                }
            } catch (error) {
                // Silently continue if we can't reopen the repository
            }
        }
    }, 500); // Wait 500ms to batch changes
    
    hiddenRepoCheckTimers.set(repoPath, timer);
}

export function activate(context: vscode.ExtensionContext) {
    // Initialize context for the icon state
    vscode.commands.executeCommand('setContext', 'hideReposWithNoChanges.isHiding', isHidingEnabled);

    // Get the Git extension API
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
    if (gitExtension) {
        const git = gitExtension.exports;
        gitAPI = git.getAPI(1);
        
        // Build initial list of all known repos
        if (gitAPI) {
            gitAPI.repositories.forEach(repo => {
                allKnownRepos.set(repo.rootUri.fsPath, repo.rootUri);
            });
        }
        
        // Scan workspace for all git repositories
        discoverAllGitRepositories().then(async () => {
            // Open workspace root repositories that VS Code might not auto-open
            await openWorkspaceRootRepositories();
        });
    }

    // Set up file watcher to detect changes in workspace
    fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    fileWatcher.onDidChange((uri) => {
        if (isHidingEnabled) {
            // Check if this file belongs to a hidden repo
            handleFileChange(uri);
            // Also debounce the general updates
            setTimeout(() => {
                updateRepositoryVisibility();
                updateRepositoryBadges();
            }, 1000);
        }
    });
    fileWatcher.onDidCreate((uri) => {
        if (isHidingEnabled) {
            // Check if this file belongs to a hidden repo
            handleFileChange(uri);
            // Also debounce the general updates
            setTimeout(() => {
                updateRepositoryVisibility();
                updateRepositoryBadges();
            }, 1000);
        }
    });
    fileWatcher.onDidDelete((uri) => {
        if (isHidingEnabled) {
            // Check if this file belongs to a hidden repo
            handleFileChange(uri);
            // Also debounce the general updates
            setTimeout(() => {
                updateRepositoryVisibility();
                updateRepositoryBadges();
            }, 1000);
        }
    });
    context.subscriptions.push(fileWatcher);

    // Register the toggle command
    let disposable = vscode.commands.registerCommand('hideReposWithNoChanges.toggle', async () => {
        if (!gitAPI) {
            vscode.window.showErrorMessage('Git extension is not available');
            return;
        }

        // Toggle the state
        isHidingEnabled = !isHidingEnabled;
        
        // Update the context for the icon
        vscode.commands.executeCommand('setContext', 'hideReposWithNoChanges.isHiding', isHidingEnabled);

        // If turning off, make sure we rescan to find all repos again
        if (!isHidingEnabled) {
            await discoverAllGitRepositories();
        }

        // Update visibility for all repositories
        await updateRepositoryVisibility();

        // Update badges after visibility changes
        updateRepositoryBadges();

        // Show status message
        const hiddenCount = currentlyHiddenRepos.size;
        const message = isHidingEnabled 
            ? `Hiding ${hiddenCount} ${hiddenCount === 1 ? 'repository' : 'repositories'} with no changes` 
            : `Showing all repositories`;
        vscode.window.showInformationMessage(message);
    });

    context.subscriptions.push(disposable);

    // Register a command to manually rescan repositories
    let rescanDisposable = vscode.commands.registerCommand('hideReposWithNoChanges.rescan', async () => {
        await discoverAllGitRepositories();
        
        if (isHidingEnabled) {
            await updateRepositoryVisibility();
        }
        
        // Update badges after rescan
        updateRepositoryBadges();
        
        vscode.window.showInformationMessage(`Found ${allKnownRepos.size} repositories`);
    });

    context.subscriptions.push(rescanDisposable);

    // Watch for changes in repositories to update visibility dynamically
    if (gitAPI) {
        // Initial badge update
        updateRepositoryBadges();
        
        // Listen for state changes in existing repositories
        gitAPI.repositories.forEach(repo => {
            const changeListener = repo.ui.onDidChange(() => {
                // Update badges whenever repository state changes
                updateRepositoryBadges();
                
                if (isHidingEnabled) {
                    updateRepositoryVisibility();
                }
            });
            context.subscriptions.push(changeListener);
        });

        // Listen for new repositories being opened
        const repoOpenListener = gitAPI.onDidOpenRepository(repo => {
            // Add to known repos
            allKnownRepos.set(repo.rootUri.fsPath, repo.rootUri);
            
            // Update badges for the new repository
            updateRepositoryBadges();
            
            const changeListener = repo.ui.onDidChange(() => {
                // Update badges whenever repository state changes
                updateRepositoryBadges();
                
                if (isHidingEnabled) {
                    updateRepositoryVisibility();
                }
            });
            context.subscriptions.push(changeListener);
            
            // If hiding is enabled, check if this new repo should be hidden
            if (isHidingEnabled) {
                setTimeout(() => updateRepositoryVisibility(), 500);
            }
        });
        context.subscriptions.push(repoOpenListener);

        // Listen for repositories being closed
        const repoCloseListener = gitAPI.onDidCloseRepository(repo => {
            // Keep in known repos but note it was closed
            // Update badges after closing
            updateRepositoryBadges();
        });
        context.subscriptions.push(repoCloseListener);
    }
}

async function updateRepositoryVisibility() {
    if (!gitAPI) {
        return;
    }

    if (isHidingEnabled) {
        // Check which repos should be hidden
        const reposToHide: Repository[] = [];
        const reposToShow: Repository[] = [];
        
        gitAPI.repositories.forEach(repo => {
            const repoPath = repo.rootUri.fsPath;
            
            // Never hide workspace root repositories
            if (isWorkspaceRoot(repoPath)) {
                return;
            }
            
            // Check if the repository has any changes
            const hasChanges = 
                repo.state.workingTreeChanges.length > 0 ||
                repo.state.indexChanges.length > 0 ||
                repo.state.mergeChanges.length > 0;
            
            if (!hasChanges && !currentlyHiddenRepos.has(repoPath)) {
                reposToHide.push(repo);
            } else if (hasChanges && currentlyHiddenRepos.has(repoPath)) {
                // This repo now has changes and should be shown
                reposToShow.push(repo);
            }
        });

        // Show repos that now have changes by using git.close and git.openRepository
        for (const repo of reposToShow) {
            currentlyHiddenRepos.delete(repo.rootUri.fsPath);
            // First close it, then reopen it to make it visible
            try {
                await vscode.commands.executeCommand('git.close', repo.rootUri);
                await new Promise(resolve => setTimeout(resolve, 50));
                await vscode.commands.executeCommand('git.openRepository', repo.rootUri.fsPath);
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                // Silently continue if we can't reopen a repository
            }
        }

        // Hide repos without changes
        for (const repo of reposToHide) {
            try {
                await vscode.commands.executeCommand('git.close', repo.rootUri);
                currentlyHiddenRepos.add(repo.rootUri.fsPath);
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                // Silently continue if we can't close a repository
            }
        }
    } else {
        // Show all repositories - use git.openRepository for all known repos
        
        // First, trigger a rescan to make sure Git knows about all repos
        await discoverAllGitRepositories();
        
        currentlyHiddenRepos.clear();
        
        // Open all known repositories
        for (const [path, uri] of allKnownRepos.entries()) {
            try {
                await vscode.commands.executeCommand('git.openRepository', uri.fsPath);
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                // Silently continue if we can't open a repository
            }
        }
    }
}

export function deactivate() {}

