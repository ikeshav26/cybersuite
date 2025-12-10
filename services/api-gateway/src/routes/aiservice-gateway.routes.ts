import express from 'express';
import axios from 'axios';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3004';

// Helper function to proxy requests to ai service
const proxyToAiService = async (req: any, res: any, endpoint: string) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${AI_SERVICE_URL}/api/ai${endpoint}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Ai service unavailable',
          code: 'SERVICE_UNAVAILABLE',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
};

/**
 * POST /api/ai/explain
 * Explain a vulnerability using AI
 */
router.post('/explain', (req, res) => proxyToAiService(req, res, '/explain'));

/**
 * POST /api/ai/fix
 * Generate a code fix for a vulnerability
 */
router.post('/fix', (req, res) => proxyToAiService(req, res, '/fix'));

/**
 * POST /api/ai/generate-pr
 * Create a pull request with fixes
 */
router.post('/generate-pr', (req, res) => proxyToAiService(req, res, '/generate-pr'));

/**
 * POST /api/ai/github/webhook
 * Handle GitHub App installation and repository events
 */
router.post('/github/webhook', (req, res) => proxyToAiService(req, res, '/github/webhook'));

/**
 * POST /api/ai/scan-repository
 * Scan a repository for vulnerabilities
 */
router.post('/scan-repository', (req, res) => proxyToAiService(req, res, '/scan-repository'));

/**
 * GET /api/ai/repositories/:owner/:repo/status
 * Get scanning status for a repository
 */
router.get('/repositories/:owner/:repo/status', (req, res) =>
  proxyToAiService(req, res, `/repositories/${req.params.owner}/${req.params.repo}/status`)
);

/**
 * POST /api/ai/user/:username/repositories
 * Get all repositories for a GitHub user/org with installation status
 */
router.post('/user/:username/repositories', (req, res) =>
  proxyToAiService(req, res, `/user/${req.params.username}/repositories`)
);

/**
 * POST /api/ai/securebot/scan
 * Scan repository using SecureBot backend
 */
router.post('/securebot/scan', (req, res) => proxyToAiService(req, res, '/securebot/scan'));

/**
 * POST /api/ai/securebot/fix
 * Fix repository issues and create PR using SecureBot backend
 */
router.post('/securebot/fix', (req, res) => proxyToAiService(req, res, '/securebot/fix'));

export default router;
