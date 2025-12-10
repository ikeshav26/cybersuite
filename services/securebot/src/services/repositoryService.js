import fs from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';

class RepositoryService {
  constructor(githubAppService, controller = null) {
    this.githubAppService = githubAppService;
    this.controller = controller;
    this.reposDir = path.join(process.cwd(), 'repos');
    this.ensureReposDirectory();
  }

  ensureReposDirectory() {
    if (!fs.existsSync(this.reposDir)) {
      fs.mkdirSync(this.reposDir, { recursive: true });
    }
  }

  /**
   * Clone a repository using GitHub App authentication
   */
  async cloneRepository(repoId) {
    try {
      const repoInfo = await this.githubAppService.findRepositoryById(repoId);

      if (!repoInfo) {
        if (this.controller) {
          this.controller.scanLogs.push({
            timestamp: new Date(),
            repoId: repoId,
            username: 'unknown',
            status: 'failed',
            message: `Repository with ID ${repoId} not found in accessible repositories`
          });
        }
        throw new Error(`Repository with ID ${repoId} not found in accessible repositories`);
      }

      const { repository, installation } = repoInfo;
      const repoPath = path.join(this.reposDir, repository.name);

      // Check if repository already exists
      if (fs.existsSync(repoPath)) {
        console.log(`Repository ${repository.name} already exists, pulling latest changes...`);
        if (this.controller) {
          this.controller.scanLogs.push({
            timestamp: new Date(),
            repoId: repoId,
            username: installation.account?.login || 'unknown',
            status: 'cloning',
            message: `Repository ${repository.name} already exists, pulling latest changes`
          });
        }
        await this.pullLatestChanges(repoPath);
        if (this.controller) {
          this.controller.scanLogs.push({
            timestamp: new Date(),
            repoId: repoId,
            username: installation.account?.login || 'unknown',
            status: 'cloning',
            message: `Repository ${repository.name} updated successfully`
          });
        }
        return {
          repository,
          installation,
          localPath: repoPath,
          action: 'updated',
        };
      }

      // Get installation token for authenticated cloning
      const token = await this.githubAppService.getInstallationToken(installation.id);

      // Clone the repository using git with token authentication
      const cloneUrl = repository.clone_url.replace('https://', `https://x-access-token:${token}@`);

      console.log(`Cloning repository: ${repository.full_name}`);
      if (this.controller) {
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: repoId,
          username: installation.account?.login || 'unknown',
          status: 'cloning',
          message: `Started cloning repository: ${repository.full_name}`
        });
      }
      
      execSync(`git clone ${cloneUrl} "${repoPath}"`, {
        stdio: 'inherit',
        cwd: this.reposDir,
      });

      if (this.controller) {
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: repoId,
          username: installation.account?.login || 'unknown',
          status: 'cloning',
          message: `Successfully cloned repository: ${repository.full_name}`
        });
      }

      return {
        repository,
        installation,
        localPath: repoPath,
        action: 'cloned',
        cloned_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Pull latest changes from remote repository
   */
  async pullLatestChanges(repoPath) {
    try {
      execSync('git pull origin', {
        stdio: 'inherit',
        cwd: repoPath,
      });
      console.log(`Updated repository at ${repoPath}`);
    } catch (error) {
      console.warn(`Failed to pull latest changes: ${error.message}`);
      // Non-fatal error, continue with existing code
    }
  }

  /**
   * Create a new branch for fixes
   */
  async createFixBranch(repoPath, branchName = `securebot-fixes-${Date.now()}`) {
    try {
      // Ensure we're on the default branch and up to date
      execSync('git checkout main || git checkout master', {
        stdio: 'pipe',
        cwd: repoPath,
      });

      // Create and checkout new branch
      execSync(`git checkout -b ${branchName}`, {
        stdio: 'inherit',
        cwd: repoPath,
      });

      return branchName;
    } catch (error) {
      throw new Error(`Failed to create fix branch: ${error.message}`);
    }
  }

  /**
   * Commit and push changes
   */
  async commitAndPushChanges(
    repoPath,
    branchName,
    installationId,
    repositoryFullName,
    commitMessage = '🔒 SecureBot: Fix security vulnerabilities'
  ) {
    try {
      // Configure git user if not already configured
      try {
        execSync('git config user.name "SecureBot"', {
          stdio: 'pipe',
          cwd: repoPath,
        });
        execSync('git config user.email "securebot@automated.fix"', {
          stdio: 'pipe',
          cwd: repoPath,
        });
      } catch (configError) {
        // Git config might already be set, this is non-fatal
      }

      // Add all changes
      execSync('git add .', {
        stdio: 'inherit',
        cwd: repoPath,
      });

      // Check if there are changes to commit
      try {
        execSync('git diff --staged --quiet', {
          stdio: 'pipe',
          cwd: repoPath,
        });
        // No changes to commit
        return { hasChanges: false, message: 'No changes to commit' };
      } catch (diffError) {
        // There are changes to commit
      }

      // Commit changes
      execSync(`git commit -m "${commitMessage}"`, {
        stdio: 'inherit',
        cwd: repoPath,
      });

      // Get installation token for authenticated push
      const token = await this.githubAppService.getInstallationToken(installationId);
      
      // Set up authenticated remote URL for push
      const pushUrl = `https://x-access-token:${token}@github.com/${repositoryFullName}.git`;
      
      // Push to remote using authenticated URL
      execSync(`git push ${pushUrl} ${branchName}`, {
        stdio: 'inherit',
        cwd: repoPath,
      });

      return {
        hasChanges: true,
        message: 'Changes committed and pushed successfully',
        branch: branchName,
      };
    } catch (error) {
      throw new Error(`Failed to commit and push changes: ${error.message}`);
    }
  }

  /**
   * Create a pull request with the fixes
   */
  async createPullRequest(repository, installation, branchName, fixResults) {
    try {
      const [owner, repo] = repository.full_name.split('/');

      const title = '🔒 SecureBot: Automated Security Fixes';
      const body = this.generatePullRequestBody(fixResults);

      const pullRequest = await this.githubAppService.createPullRequest(
        installation.id,
        owner,
        repo,
        {
          title,
          head: branchName,
          base: repository.default_branch || 'main',
          body,
        }
      );

      return pullRequest;
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }

  /**
   * Generate pull request body with fix details
   */
  generatePullRequestBody(fixResults) {
    const { appliedFixes, summary } = fixResults;

    let body = `## 🔒 SecureBot Automated Security Fixes\n\n`;
    body += `This pull request contains automated security fixes generated by SecureBot.\n\n`;

    body += `### 📊 Summary\n`;
    body += `- **Total Issues Fixed**: ${summary.successful}\n`;
    body += `- **Failed Fixes**: ${summary.failed}\n`;
    body += `- **Skipped Files**: ${summary.skipped}\n`;
    body += `- **Success Rate**: ${summary.successRate}\n\n`;

    if (appliedFixes.length > 0) {
      body += `### 🛠️ Applied Fixes\n\n`;

      appliedFixes.forEach((fix, index) => {
        body += `#### ${index + 1}. ${fix.fileName}\n`;
        body += `- **Issue**: ${fix.issue}\n`;
        body += `- **Status**: ${fix.status}\n`;
        body += `- **Explanation**: ${fix.explanation}\n`;
        if (fix.changes) {
          body += `- **Size Change**: ${fix.changes.originalSize} → ${fix.changes.fixedSize} characters\n`;
        }
        body += `\n`;
      });
    }

    body += `### ⚠️ Important Notes\n`;
    body += `- All original files have been backed up with timestamps\n`;
    body += `- Please review all changes before merging\n`;
    body += `- Test your application thoroughly after applying these fixes\n`;
    body += `- Some fixes may require additional configuration or environment updates\n\n`;

    body += `### 🤖 About SecureBot\n`;
    body += `SecureBot is an automated security analysis and fixing tool that helps identify and resolve common security vulnerabilities in your codebase.\n\n`;
    body += `---\n`;
    body += `*This pull request was automatically generated by SecureBot*`;

    return body;
  }

  /**
   * Get list of cloned repositories
   */
  getClonedRepositories() {
    try {
      if (!fs.existsSync(this.reposDir)) {
        return [];
      }

      return fs
        .readdirSync(this.reposDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => ({
          name: dirent.name,
          path: path.join(this.reposDir, dirent.name),
          stats: fs.statSync(path.join(this.reposDir, dirent.name)),
        }));
    } catch (error) {
      throw new Error(`Failed to get cloned repositories: ${error.message}`);
    }
  }
}

export default RepositoryService;
