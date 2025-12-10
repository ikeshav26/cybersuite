import express from 'express';
import dotenv from 'dotenv';
import secureBotRoutes from './routes/secureBotRoutes.js';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for all routes
app.use(
  cors({
    origin: '*', // Allow all origins - adjust as needed for security
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Increase timeout for long-running operations
app.use((req, res, next) => {
  // Set timeout to 10 minutes for all requests
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔒 SecureBot - Automated Security Analysis & Fixing',
    description:
      'SecureBot integrates GitHub App authentication with automated security scanning and fixing capabilities',
    version: '1.0.0',
    features: [
      'GitHub App Integration',
      'Automated Security Scanning',
      'AI-Powered Code Fixing',
      'Automated Pull Request Creation',
      'Repository Management',
    ],
    endpoints: {
      health: 'GET /api/health',
      installation_status: 'GET /api/installation/status?username=<github_username>',
      user_repositories: 'GET /api/user/<username>/repositories',
      scan_repository: 'POST /api/scan',
      fix_and_create_pr: 'POST /api/fix',
      cloned_repositories: 'GET /api/repositories/cloned',
      scan_logs: 'GET /api/scan/logs',
    },
    documentation: {
      github_app_setup: 'Create a GitHub App and set GITHUB_APP_ID and GITHUB_PRIVATE_KEY',
      ai_setup: 'Set GOOGLE_AI_API_KEY for automated fixing',
      usage: 'Install the GitHub App on your repositories, then use the API endpoints',
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', secureBotRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/installation/status',
      'GET /api/user/<username>/repositories',
      'POST /api/scan',
      'POST /api/fix',
      'GET /api/repositories/cloned',
      'GET /api/scan/logs',
    ],
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log('🚀 SecureBot Server Started!');
  console.log(`📡 Server running on http://localhost:${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);

  // Check environment variables
  const requiredEnvVars = ['GITHUB_APP_ID', 'GITHUB_PRIVATE_KEY', 'GOOGLE_AI_API_KEY'];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing environment variables:');
    missingEnvVars.forEach((envVar) => {
      console.warn(`   - ${envVar}`);
    });
    console.warn('   Please check your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }

  console.log('\n📚 API Endpoints:');
  console.log('   GET  /                              - API documentation');
  console.log('   GET  /api/health                    - Health check');
  console.log('   GET  /api/installation/status       - Check GitHub App installation');
  console.log('   GET  /api/user/<username>/repositories - Get user repositories');
  console.log('   POST /api/scan                      - Scan repository for security issues');
  console.log('   POST /api/fix                       - Fix issues and create PR');
  console.log('   GET  /api/repositories/cloned       - List cloned repositories');
  console.log('\n🔒 SecureBot is ready to secure your repositories!');
});
