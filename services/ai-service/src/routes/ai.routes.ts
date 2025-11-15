import { Router } from 'express';
import { validateBody } from '@cybersec/utils';
import { aiExplainSchema, aiFixSchema, aiGeneratePRSchema } from '@cybersec/utils';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

/**
 * POST /api/ai/explain
 * Explain a vulnerability using AI
 */
router.post('/explain', validateBody(aiExplainSchema), aiController.explainVulnerability);

/**
 * POST /api/ai/fix
 * Generate a code fix for a vulnerability
 */
router.post('/fix', validateBody(aiFixSchema), aiController.generateFix);

/**
 * POST /api/ai/generate-pr
 * Create a pull request with fixes
 */
router.post('/generate-pr', validateBody(aiGeneratePRSchema), aiController.generatePR);

/**
 * POST /api/ai/github/webhook
 * Handle GitHub App installation and repository events
 */
router.post('/github/webhook', aiController.handleGitHubWebhook);

/**
 * POST /api/ai/scan-repository
 * Scan a repository for vulnerabilities
 */
router.post('/scan-repository', aiController.scanRepository);

/**
 * GET /api/ai/repositories/:owner/:repo/status
 * Get scanning status for a repository
 */
router.get('/repositories/:owner/:repo/status', aiController.getRepositoryStatus);

/**
 * POST /api/ai/user/:username/repositories
 * Get all repositories for a GitHub user/org with installation status
 */
router.post('/user/:username/repositories', aiController.getUserRepositories);

export default router;
