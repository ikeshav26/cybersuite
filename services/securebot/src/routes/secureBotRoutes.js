import express from 'express';
import SecureBotController from '../controllers/secureBotController.js';
import checkAppInstallation from '../middleware/checkAppInstallation.js';

const router = express.Router();
const secureBotController = new SecureBotController();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SecureBot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Get installation status and available repositories
router.get('/installation/status', async (req, res) => {
  await secureBotController.getInstallationStatus(req, res);
});

// Get user repositories by GitHub username
router.get('/user/:username/repositories', async (req, res) => {
  await secureBotController.getUserRepositories(req, res);
});

// Scan repository for security issues (requires app installation)
router.post('/scan', async (req, res) => {
  await secureBotController.scanRepository(req, res);
});

// Fix security issues and create pull request (requires app installation)
router.post('/fix', async (req, res) => {
  await secureBotController.fixAndCreatePR(req, res);
});

// Get list of cloned repositories
router.get('/repositories/cloned', async (req, res) => {
  await secureBotController.getClonedRepositories(req, res);
});

router.get('/scan/logs',async(req,res)=>{
  await secureBotController.getScanLogs(req,res);
})

export default router;
