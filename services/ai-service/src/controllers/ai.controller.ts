import { Request, Response, NextFunction } from 'express';
import { asyncHandler, successResponse, logger } from '@cybersec/utils';
import type { AIExplanation, AIFixSuggestion, AutoPR } from '@cybersec/types';
import {
  explainVulnerabilityWithAI,
  generateCodeFix,
  createPullRequest,
  handleGitHubInstallation,
  scanRepositoryForVulnerabilities,
  getRepoScanStatus,
  fetchUserRepositories,
} from '../services/ai.service.js';

/**
 * POST /api/ai/explain
 * Explain a vulnerability using AI
 */
export const explainVulnerability = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vulnerabilityId, context } = req.body;

    logger.info('Explaining vulnerability', { vulnerabilityId });

    const explanation: AIExplanation = await explainVulnerabilityWithAI(vulnerabilityId, context);

    const response = successResponse(explanation, 200);
    res.status(response.statusCode).json(response.data);
  }
);

/**
 * POST /api/ai/fix
 * Generate a code fix for a vulnerability
 */
export const generateFix = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { vulnerabilityId, includeTests } = req.body;

  logger.info('Generating fix for vulnerability', {
    vulnerabilityId,
    includeTests,
  });

  const fixSuggestion: AIFixSuggestion = await generateCodeFix(vulnerabilityId, includeTests);

  const response = successResponse(fixSuggestion, 200);
  res.status(response.statusCode).json(response.data);
});

/**
 * POST /api/ai/generate-pr
 * Create a pull request with fixes
 */
export const generatePR = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { vulnerabilityIds, title, description, repositoryUrl, owner, repo, installationId } =
    req.body;

  logger.info('Generating pull request', {
    vulnerabilityIds,
    vulnerabilityCount: vulnerabilityIds.length,
    owner,
    repo,
  });

  const pr: AutoPR = await createPullRequest(vulnerabilityIds, title, description, {
    owner,
    repo,
    installationId,
  });

  const response = successResponse(pr, 201);
  res.status(response.statusCode).json(response.data);
});

/**
 * POST /api/ai/github/webhook
 * Handle GitHub App installation and repository events
 */
export const handleGitHubWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    logger.info('GitHub webhook received', { event, action: payload.action });

    await handleGitHubInstallation(event, payload);

    res.status(200).json({ message: 'Webhook processed' });
  }
);

/**
 * POST /api/ai/scan-repository
 * Scan a repository for vulnerabilities
 */
export const scanRepository = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { owner, repo, installationId } = req.body;

    logger.info('Scanning repository', { owner, repo, installationId });

    const scanResult = await scanRepositoryForVulnerabilities(owner, repo, installationId);

    const response = successResponse(scanResult, 200);
    res.status(response.statusCode).json(response.data);
  }
);

/**
 * GET /api/ai/repositories/:owner/:repo/status
 * Get scanning status for a repository
 */
export const getRepositoryStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      throw new Error('Owner and repo parameters are required');
    }

    logger.info('Getting repository status', { owner, repo });

    const status = await getRepoScanStatus(owner, repo);

    const response = successResponse(status, 200);
    res.status(response.statusCode).json(response.data);
  }
);

/**
 * GET /api/ai/user/:username/repositories
 * Get all repositories for a GitHub user/org with installation status
 */
export const getUserRepositories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;
    const { installationId } = req.body;
    console.log('installationId', installationId);

    if (!username) {
      throw new Error('Username parameter is required');
    }

    if (!installationId) {
      throw new Error('Installation ID is required');
    }

    logger.info('Fetching user repositories', { username, installationId });

    const repositories = await fetchUserRepositories(username, installationId);

    const response = successResponse(repositories, 200);
    res.status(response.statusCode).json(response.data);
  }
);
