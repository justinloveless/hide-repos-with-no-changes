import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);

interface PRConfig {
    owner: string;
    repo: string;
    pr_number: number;
}

interface MonitorConfig {
    prs: PRConfig[];
    polling_interval?: number;
    auto_start?: boolean;
}

interface PRComment {
    id: number;
    user: string;
    body: string;
    created_at: string;
    updated_at: string;
    html_url: string;
    path?: string;
    line?: number;
}

interface PRCommentState {
    owner: string;
    repo: string;
    pr_number: number;
    last_checked: string;
    seen_comment_ids: Set<number>;
}

export class PRCommentMonitor {
    private config: MonitorConfig | null = null;
    private isMonitoring: boolean = false;
    private monitorInterval: NodeJS.Timeout | null = null;
    private commentStates: Map<string, PRCommentState> = new Map();
    private stateFilePath: string;
    private outputChannel: vscode.OutputChannel;

    constructor(
        private context: vscode.ExtensionContext,
        private configPath: string
    ) {
        this.stateFilePath = path.join(context.globalStorageUri.fsPath, 'pr-monitor-state.json');
        this.outputChannel = vscode.window.createOutputChannel('PR Comment Monitor');
        
        // Ensure global storage directory exists
        if (!fs.existsSync(context.globalStorageUri.fsPath)) {
            fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
        }
        
        this.loadState();
    }

    /**
     * Load the monitoring configuration from YAML file
     */
    private async loadConfig(): Promise<boolean> {
        try {
            if (!fs.existsSync(this.configPath)) {
                this.outputChannel.appendLine(`Config file not found: ${this.configPath}`);
                return false;
            }

            const fileContents = fs.readFileSync(this.configPath, 'utf8');
            this.config = yaml.load(fileContents) as MonitorConfig;
            
            if (!this.config || !this.config.prs || this.config.prs.length === 0) {
                this.outputChannel.appendLine('No PRs configured for monitoring');
                return false;
            }

            this.outputChannel.appendLine(`Loaded config with ${this.config.prs.length} PRs to monitor`);
            return true;
        } catch (error) {
            this.outputChannel.appendLine(`Error loading config: ${error}`);
            return false;
        }
    }

    /**
     * Load the state of previously seen comments
     */
    private loadState(): void {
        try {
            if (fs.existsSync(this.stateFilePath)) {
                const stateData = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
                
                for (const [key, value] of Object.entries(stateData)) {
                    const state = value as any;
                    this.commentStates.set(key, {
                        owner: state.owner,
                        repo: state.repo,
                        pr_number: state.pr_number,
                        last_checked: state.last_checked,
                        seen_comment_ids: new Set(state.seen_comment_ids)
                    });
                }
                
                this.outputChannel.appendLine('Loaded previous comment state');
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error loading state: ${error}`);
        }
    }

    /**
     * Save the current state of seen comments
     */
    private saveState(): void {
        try {
            const stateData: any = {};
            
            for (const [key, value] of this.commentStates.entries()) {
                stateData[key] = {
                    owner: value.owner,
                    repo: value.repo,
                    pr_number: value.pr_number,
                    last_checked: value.last_checked,
                    seen_comment_ids: Array.from(value.seen_comment_ids)
                };
            }
            
            fs.writeFileSync(this.stateFilePath, JSON.stringify(stateData, null, 2));
        } catch (error) {
            this.outputChannel.appendLine(`Error saving state: ${error}`);
        }
    }

    /**
     * Get the state key for a PR
     */
    private getStateKey(owner: string, repo: string, pr_number: number): string {
        return `${owner}/${repo}#${pr_number}`;
    }

    /**
     * Get or create state for a PR
     */
    private getOrCreateState(owner: string, repo: string, pr_number: number): PRCommentState {
        const key = this.getStateKey(owner, repo, pr_number);
        
        if (!this.commentStates.has(key)) {
            this.commentStates.set(key, {
                owner,
                repo,
                pr_number,
                last_checked: new Date().toISOString(),
                seen_comment_ids: new Set()
            });
        }
        
        return this.commentStates.get(key)!;
    }

    /**
     * Fetch comments for a PR using GitHub CLI
     */
    private async fetchPRComments(owner: string, repo: string, pr_number: number): Promise<PRComment[]> {
        try {
            // Fetch both issue comments and review comments
            const [issueComments, reviewComments] = await Promise.all([
                this.fetchIssueComments(owner, repo, pr_number),
                this.fetchReviewComments(owner, repo, pr_number)
            ]);

            return [...issueComments, ...reviewComments];
        } catch (error) {
            this.outputChannel.appendLine(`Error fetching comments for ${owner}/${repo}#${pr_number}: ${error}`);
            return [];
        }
    }

    /**
     * Fetch issue comments (general PR comments)
     */
    private async fetchIssueComments(owner: string, repo: string, pr_number: number): Promise<PRComment[]> {
        try {
            const { stdout } = await execAsync(
                `gh api repos/${owner}/${repo}/issues/${pr_number}/comments --jq '.[] | {id, user: .user.login, body, created_at, updated_at, html_url}'`,
                { timeout: 30000 }
            );

            if (!stdout.trim()) {
                return [];
            }

            // Parse newline-delimited JSON
            const comments = stdout.trim().split('\n').map(line => JSON.parse(line));
            return comments;
        } catch (error) {
            // If there are no comments, gh api might return empty or error
            return [];
        }
    }

    /**
     * Fetch review comments (inline code comments)
     */
    private async fetchReviewComments(owner: string, repo: string, pr_number: number): Promise<PRComment[]> {
        try {
            const { stdout } = await execAsync(
                `gh api repos/${owner}/${repo}/pulls/${pr_number}/comments --jq '.[] | {id, user: .user.login, body, created_at, updated_at, html_url, path, line}'`,
                { timeout: 30000 }
            );

            if (!stdout.trim()) {
                return [];
            }

            // Parse newline-delimited JSON
            const comments = stdout.trim().split('\n').map(line => JSON.parse(line));
            return comments;
        } catch (error) {
            // If there are no comments, gh api might return empty or error
            return [];
        }
    }

    /**
     * Check for new comments on a single PR
     */
    private async checkPRForNewComments(pr: PRConfig): Promise<void> {
        const { owner, repo, pr_number } = pr;
        const state = this.getOrCreateState(owner, repo, pr_number);
        
        this.outputChannel.appendLine(`Checking ${owner}/${repo}#${pr_number} for new comments...`);
        
        const comments = await this.fetchPRComments(owner, repo, pr_number);
        const newComments: PRComment[] = [];
        
        for (const comment of comments) {
            if (!state.seen_comment_ids.has(comment.id)) {
                newComments.push(comment);
                state.seen_comment_ids.add(comment.id);
            }
        }
        
        state.last_checked = new Date().toISOString();
        
        if (newComments.length > 0) {
            this.outputChannel.appendLine(`Found ${newComments.length} new comment(s) on ${owner}/${repo}#${pr_number}`);
            
            // Spawn background agent for each new comment
            for (const comment of newComments) {
                await this.spawnBackgroundAgentForComment(pr, comment);
            }
        } else {
            this.outputChannel.appendLine(`No new comments on ${owner}/${repo}#${pr_number}`);
        }
        
        this.saveState();
    }

    /**
     * Spawn a background agent to address a PR comment
     */
    private async spawnBackgroundAgentForComment(pr: PRConfig, comment: PRComment): Promise<void> {
        const { owner, repo, pr_number } = pr;
        
        this.outputChannel.appendLine(`Spawning background agent for comment ${comment.id} by ${comment.user}`);
        
        // Create a task message for the background agent
        let taskMessage = `New PR comment on ${owner}/${repo}#${pr_number}:\n\n`;
        taskMessage += `**Author:** ${comment.user}\n`;
        taskMessage += `**Date:** ${comment.created_at}\n`;
        
        if (comment.path && comment.line) {
            taskMessage += `**File:** ${comment.path}:${comment.line}\n`;
        }
        
        taskMessage += `**URL:** ${comment.html_url}\n\n`;
        taskMessage += `**Comment:**\n${comment.body}\n\n`;
        taskMessage += `Please review this comment and address it appropriately. `;
        taskMessage += `Make any necessary code changes, respond to questions, or provide clarifications.`;
        
        try {
            // Use VS Code API to create a background agent task
            // Note: This uses the Cursor-specific background agent API
            await vscode.commands.executeCommand('cursor.backgroundAgent.spawn', {
                message: taskMessage,
                context: {
                    pr: `${owner}/${repo}#${pr_number}`,
                    comment_id: comment.id,
                    comment_url: comment.html_url
                }
            });
            
            this.outputChannel.appendLine(`Background agent spawned successfully for comment ${comment.id}`);
            
            // Show a notification
            const action = await vscode.window.showInformationMessage(
                `New PR comment from ${comment.user} on ${owner}/${repo}#${pr_number}`,
                'View Comment',
                'Dismiss'
            );
            
            if (action === 'View Comment') {
                vscode.env.openExternal(vscode.Uri.parse(comment.html_url));
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error spawning background agent: ${error}`);
            
            // Fallback: show the comment in a notification
            vscode.window.showWarningMessage(
                `New PR comment from ${comment.user} on ${owner}/${repo}#${pr_number}. Check output for details.`
            );
        }
    }

    /**
     * Check all configured PRs for new comments
     */
    private async checkAllPRs(): Promise<void> {
        if (!this.config || !this.config.prs) {
            return;
        }

        this.outputChannel.appendLine(`\n=== Checking ${this.config.prs.length} PRs at ${new Date().toISOString()} ===`);
        
        for (const pr of this.config.prs) {
            await this.checkPRForNewComments(pr);
        }
        
        this.outputChannel.appendLine('=== Check complete ===\n');
    }

    /**
     * Start monitoring PRs for new comments
     */
    async start(): Promise<boolean> {
        if (this.isMonitoring) {
            vscode.window.showInformationMessage('PR comment monitoring is already running');
            return false;
        }

        const configLoaded = await this.loadConfig();
        if (!configLoaded) {
            vscode.window.showErrorMessage('Failed to load PR monitor configuration');
            return false;
        }

        // Verify GitHub CLI is available
        try {
            await execAsync('gh --version');
        } catch (error) {
            vscode.window.showErrorMessage('GitHub CLI (gh) is not installed or not in PATH');
            return false;
        }

        this.isMonitoring = true;
        this.outputChannel.show(true);
        this.outputChannel.appendLine('Starting PR comment monitoring...');

        // Initial check
        await this.checkAllPRs();

        // Set up periodic polling
        const interval = (this.config?.polling_interval || 300) * 1000; // Convert to ms
        this.monitorInterval = setInterval(() => {
            this.checkAllPRs();
        }, interval);

        vscode.window.showInformationMessage(
            `Monitoring ${this.config!.prs.length} PRs for new comments (interval: ${this.config!.polling_interval || 300}s)`
        );

        return true;
    }

    /**
     * Stop monitoring PRs
     */
    stop(): void {
        if (!this.isMonitoring) {
            vscode.window.showInformationMessage('PR comment monitoring is not running');
            return;
        }

        this.isMonitoring = false;
        
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        this.outputChannel.appendLine('Stopped PR comment monitoring');
        vscode.window.showInformationMessage('Stopped monitoring PR comments');
    }

    /**
     * Check if monitoring is active
     */
    isActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Force an immediate check of all PRs
     */
    async checkNow(): Promise<void> {
        if (!this.config) {
            const configLoaded = await this.loadConfig();
            if (!configLoaded) {
                vscode.window.showErrorMessage('Failed to load PR monitor configuration');
                return;
            }
        }

        this.outputChannel.show(true);
        await this.checkAllPRs();
        vscode.window.showInformationMessage('PR comment check completed');
    }

    /**
     * Reset the state (clear all seen comments)
     */
    resetState(): void {
        this.commentStates.clear();
        this.saveState();
        this.outputChannel.appendLine('Reset PR comment state - all comments will be treated as new on next check');
        vscode.window.showInformationMessage('PR comment state reset');
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.stop();
        this.outputChannel.dispose();
    }
}
