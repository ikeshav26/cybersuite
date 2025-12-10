import Anthropic from '@anthropic-ai/sdk';
import { App } from '@octokit/app';
import { config } from '@cybersec/config';
import { logger, ServiceUnavailableError } from '@cybersec/utils';
import type { AIExplanation, AIFixSuggestion, AutoPR } from '@cybersec/types';

// Lazy initialization of Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableError('Anthropic API key is not configured');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// GitHub App authentication per installation
async function getGitHubApp(installationId: number) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new ServiceUnavailableError('GitHub App credentials not configured');
  }

  const app = new App({
    appId,
    privateKey,
  });

  // Get installation-specific octokit instance
  const octokit = await app.getInstallationOctokit(installationId);
  return octokit;
}

/**
 * Explain a vulnerability using AI
 */
export async function explainVulnerabilityWithAI(
  vulnerabilityId: string,
  context: any
): Promise<AIExplanation> {
  try {
    const prompt = buildExplanationPrompt(context);

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      max_tokens: Number(process.env.ANTHROPIC_MAX_TOKENS) || 4096,
      temperature: Number(process.env.AI_TEMPERATURE) || 0.7,
      system: 'You are a security expert explaining vulnerabilities in a clear, educational way.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const aiResponse =
      message.content[0] && message.content[0].type === 'text' ? message.content[0].text : '';

    const sections = parseExplanationResponse(aiResponse);

    return {
      vulnerabilityId,
      explanation: sections.explanation,
      recommendation: sections.recommendation,
      references: sections.references || [],
      confidence: 0.9,
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error('Failed to explain vulnerability', {
      vulnerabilityId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new ServiceUnavailableError('AI service temporarily unavailable');
  }
} /**
 * Generate a code fix for a vulnerability
 */
export async function generateCodeFix(
  vulnerabilityId: string,
  includeTests: boolean = false
): Promise<AIFixSuggestion> {
  try {
    const vulnerabilityContext = await getMockVulnerabilityContext(vulnerabilityId);

    const prompt = buildFixPrompt(vulnerabilityContext, includeTests);

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      max_tokens: Number(process.env.ANTHROPIC_MAX_TOKENS) || 4096,
      temperature: 0.3,
      system:
        'You are an expert developer who fixes security vulnerabilities. Provide clean, production-ready code fixes.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const aiResponse =
      message.content[0] && message.content[0].type === 'text' ? message.content[0].text : '';

    const parsedFix = parseFixResponse(aiResponse);

    return {
      vulnerabilityId,
      fixedCode: parsedFix.fixedCode,
      diff: generateDiff(vulnerabilityContext.code, parsedFix.fixedCode),
      explanation: parsedFix.explanation,
      testCases: includeTests ? parsedFix.testCases : undefined,
      confidence: 0.85,
      estimatedEffort: 'low',
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error('Failed to generate fix', {
      vulnerabilityId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new ServiceUnavailableError('AI service temporarily unavailable');
  }
}

/**
 * Create a pull request with fixes
 */
export async function createPullRequest(
  vulnerabilityIds: string[],
  title: string,
  description: string,
  repoInfo: { owner: string; repo: string; installationId: number }
): Promise<AutoPR> {
  try {
    const fixes = await Promise.all(vulnerabilityIds.map((id) => generateCodeFix(id, true)));

    const repoOwner = repoInfo.owner;
    const repoName = repoInfo.repo;
    const baseBranch = 'main';
    const branchName = `security-fix-${Date.now()}`;

    // Create branch and commit fixes using GitHub API
    const github = await getGitHubApp(repoInfo.installationId);

    // Get base ref
    const { data: baseRef } = await github.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${baseBranch}`,
    });

    // Create new branch
    await github.request('POST /repos/{owner}/{repo}/git/refs', {
      owner: repoOwner,
      repo: repoName,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    // Commit fixes to branch
    for (const fix of fixes) {
      // This is a simplified version - in production, you'd need to:
      // 1. Get the file content
      // 2. Update it with the fix
      // 3. Commit the changes
      logger.info('Committing fix', { vulnerabilityId: fix.vulnerabilityId });
    }

    // Create pull request
    const { data: pr } = await github.request('POST /repos/{owner}/{repo}/pulls', {
      owner: repoOwner,
      repo: repoName,
      title,
      body: generatePRDescription(fixes, description),
      head: branchName,
      base: baseBranch,
    });

    logger.info('Pull request created', {
      prUrl: pr.html_url,
      prNumber: pr.number,
      vulnerabilityCount: vulnerabilityIds.length,
    });

    return {
      id: `pr-${pr.number}`,
      prId: `pr-${pr.number}`,
      fixSuggestionId: fixes.map((f) => f.vulnerabilityId).join(','),
      repositoryId: `${repoOwner}/${repoName}`,
      prNumber: pr.number,
      title,
      description: pr.body || '',
      url: pr.html_url,
      prUrl: pr.html_url,
      branch: branchName,
      baseBranch,
      vulnerabilitiesFixed: vulnerabilityIds,
      filesChanged: fixes.length,
      linesAdded: fixes.reduce(
        (sum: number, fix: AIFixSuggestion) => sum + countLines(fix.fixedCode),
        0
      ),
      linesRemoved: fixes.reduce(
        (sum: number, fix: AIFixSuggestion) => sum + countLines(fix.fixedCode),
        0
      ),
      status: 'open' as const,
      createdAt: new Date(pr.created_at),
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
    };
  } catch (error) {
    logger.error('Failed to create PR', {
      vulnerabilityIds,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new ServiceUnavailableError('Failed to create pull request');
  }
}

/**
 * Handle GitHub App installation webhook
 */
export async function handleGitHubInstallation(event: string, payload: any): Promise<void> {
  logger.info('Processing GitHub webhook', { event, action: payload.action });

  switch (event) {
    case 'installation':
      if (payload.action === 'created') {
        logger.info('GitHub App installed', {
          installationId: payload.installation.id,
          account: payload.installation.account.login,
          repositories: payload.repositories?.length || 0,
        });
        // Store installation info in database
        // Trigger initial scan of repositories
      } else if (payload.action === 'deleted') {
        logger.info('GitHub App uninstalled', {
          installationId: payload.installation.id,
        });
        // Clean up installation data
      }
      break;

    case 'installation_repositories':
      if (payload.action === 'added') {
        logger.info('Repositories added', {
          repositories: payload.repositories_added.map((r: any) => r.full_name),
        });
        // Scan newly added repositories
      }
      break;

    case 'push':
      logger.info('Push event received', {
        repository: payload.repository.full_name,
        ref: payload.ref,
      });
      // Trigger repository scan on push
      break;

    default:
      logger.debug('Unhandled webhook event', { event });
  }
}

/**
 * Scan a repository for vulnerabilities
 */
export async function scanRepositoryForVulnerabilities(
  owner: string,
  repo: string,
  installationId: number
): Promise<{
  owner: string;
  repo: string;
  vulnerabilities: Array<{
    id: string;
    severity: string;
    type: string;
    file: string;
    line: number;
    description: string;
  }>;
  scannedAt: Date;
  filesScanned: number;
}> {
  try {
    const github = await getGitHubApp(installationId);

    // Get repository contents
    const { data: contents } = await github.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: '',
    });

    logger.info('Scanning repository', {
      owner,
      repo,
      filesCount: Array.isArray(contents) ? contents.length : 1,
    });

    // Mock vulnerability scanning
    // In production, you would:
    // 1. Clone or fetch repository files
    // 2. Analyze dependencies (package.json, pom.xml, etc.)
    // 3. Scan code for security issues
    // 4. Check for known vulnerabilities in dependencies

    const mockVulnerabilities = [
      {
        id: `vuln-${Date.now()}-1`,
        severity: 'high',
        type: 'sql-injection',
        file: 'src/auth.js',
        line: 42,
        description: 'SQL Injection vulnerability detected in user authentication',
      },
      {
        id: `vuln-${Date.now()}-2`,
        severity: 'medium',
        type: 'xss',
        file: 'src/utils.js',
        line: 15,
        description: 'Cross-Site Scripting (XSS) vulnerability in user input handling',
      },
    ];

    return {
      owner,
      repo,
      vulnerabilities: mockVulnerabilities,
      scannedAt: new Date(),
      filesScanned: Array.isArray(contents) ? contents.length : 1,
    };
  } catch (error) {
    logger.error('Failed to scan repository', {
      owner,
      repo,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new ServiceUnavailableError('Failed to scan repository');
  }
}

/**
 * Get repository scan status
 */
export async function getRepoScanStatus(
  owner: string,
  repo: string
): Promise<{
  owner: string;
  repo: string;
  lastScan: Date | null;
  vulnerabilities: number;
  status: 'clean' | 'issues-found' | 'never-scanned';
}> {
  // In production, fetch from database
  logger.info('Getting repository scan status', { owner, repo });

  return {
    owner,
    repo,
    lastScan: new Date(),
    vulnerabilities: 2,
    status: 'issues-found',
  };
}

/**
 * Fetch user repositories with GitHub App installation status
 */
export async function fetchUserRepositories(
  username: string,
  installationId: number
): Promise<{
  success: boolean;
  installed: boolean;
  repositories: any[];
  repository_count: number;
}> {
  try {
    const github = await getGitHubApp(installationId);

    // Get only repositories accessible to this installation
    // This returns only repos where the GitHub App is installed
    const { data: response } = await github.request('GET /installation/repositories', {
      per_page: 100,
    });
    console.log('response', response);

    const repos = response.repositories || [];

    logger.info('Fetched installation repositories', {
      username,
      installationId,
      count: repos.length,
    });

    const installed = repos.length > 0;

    return {
      success: true,
      installed,
      repositories: repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        private: repo.private,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
      })),
      repository_count: repos.length,
    };
  } catch (error) {
    logger.error('Failed to fetch installation repositories', {
      username,
      installationId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      installed: false,
      repositories: [],
      repository_count: 0,
    };
  }
}

function buildExplanationPrompt(context: any): string {
  return `Analyze this security vulnerability:

**Code:**
\`\`\`${context.language || 'javascript'}
${context.code || 'No code provided'}
\`\`\`

**Severity:** ${context.severity || 'unknown'}
**Type:** ${context.type || 'security issue'}

Please provide:
1. A clear explanation of what the vulnerability is
2. The potential impact if exploited
3. Recommended fixes
4. Any relevant security references

Format your response as:

## Explanation
[Your explanation here]

## Impact
[Potential impact here]

## Recommendation
[How to fix it here]

## References
- [Reference 1]
- [Reference 2]
`;
}

function buildFixPrompt(context: any, includeTests: boolean): string {
  return `Fix this security vulnerability:

**Vulnerable Code:**
\`\`\`${context.language || 'javascript'}
${context.code}
\`\`\`

**Issue:** ${context.description}
**Severity:** ${context.severity}

Provide:
1. The fixed code
2. Explanation of changes
${includeTests ? '3. Test cases to verify the fix' : ''}

Format as:

## Fixed Code
\`\`\`${context.language}
[fixed code here]
\`\`\`

## Explanation
[explain what you changed and why]

${includeTests ? '## Test Cases\n```javascript\n[test code here]\n```' : ''}
`;
}

function parseExplanationResponse(response: string): {
  explanation: string;
  impact: string;
  recommendation: string;
  references?: string[];
} {
  const sections = {
    explanation: '',
    impact: '',
    recommendation: '',
    references: [] as string[],
  };

  const explanationMatch = response.match(/## Explanation\s+([\s\S]*?)(?=\n## |$)/);
  const impactMatch = response.match(/## Impact\s+([\s\S]*?)(?=\n## |$)/);
  const recommendationMatch = response.match(/## Recommendation\s+([\s\S]*?)(?=\n## |$)/);
  const referencesMatch = response.match(/## References\s+([\s\S]*?)$/);

  if (explanationMatch?.[1]) sections.explanation = explanationMatch[1].trim();
  if (impactMatch?.[1]) sections.impact = impactMatch[1].trim();
  if (recommendationMatch?.[1]) sections.recommendation = recommendationMatch[1].trim();
  if (referencesMatch?.[1]) {
    sections.references = referencesMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim());
  }

  return sections;
}

function parseFixResponse(response: string): {
  fixedCode: string;
  explanation: string;
  testCases?: string;
} {
  const fixedCodeMatch = response.match(/## Fixed Code\s+```[\w]*\s+([\s\S]*?)```/);
  const explanationMatch = response.match(/## Explanation\s+([\s\S]*?)(?=\n## |$)/);
  const testCasesMatch = response.match(/## Test Cases\s+```[\w]*\s+([\s\S]*?)```/);

  return {
    fixedCode: fixedCodeMatch?.[1]?.trim() || '',
    explanation: explanationMatch?.[1]?.trim() || '',
    testCases: testCasesMatch?.[1]?.trim(),
  };
}

function generateDiff(original: string, fixed: string): string {
  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');

  let diff = '';
  const maxLines = Math.max(originalLines.length, fixedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i];
    const fixedLine = fixedLines[i];

    if (origLine !== fixedLine) {
      if (origLine) diff += `- ${origLine}\n`;
      if (fixedLine) diff += `+ ${fixedLine}\n`;
    } else {
      diff += `  ${origLine || fixedLine}\n`;
    }
  }

  return diff;
}

// Helper function to calculate confidence score (no longer using OpenAI-specific types)
function calculateConfidence(responseLength: number): number {
  // Simple heuristic: higher response length generally indicates more thorough response
  if (responseLength > 500) return 0.95;
  if (responseLength > 200) return 0.85;
  return 0.7;
}

function generatePRDescription(fixes: AIFixSuggestion[], userDescription: string): string {
  return `${userDescription}

## Fixes Applied

${fixes
  .map(
    (fix, index) => `
### ${index + 1}. Vulnerability: ${fix.vulnerabilityId}

${fix.explanation}

**Confidence:** ${(fix.confidence * 100).toFixed(0)}%
`
  )
  .join('\n')}

---
*This PR was automatically generated by AI Service*
`;
}

function countLines(code: string): number {
  return code.split('\n').length;
}

async function getMockVulnerabilityContext(vulnerabilityId: string): Promise<any> {
  return {
    id: vulnerabilityId,
    code: `// Vulnerable code example
function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.execute(query);
}`,
    language: 'javascript',
    description: 'SQL Injection vulnerability',
    severity: 'high',
    type: 'sql-injection',
  };
}
