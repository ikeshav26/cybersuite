import express from 'express';
import axios from 'axios';

const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Helper function to proxy requests to auth service
const proxyToAuthService = async (req: any, res: any, endpoint: string) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${AUTH_SERVICE_URL}/api${endpoint}`,
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
          message: 'Auth service unavailable',
          code: 'SERVICE_UNAVAILABLE',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
};

// POST /api/auth/register - Register a new user account
// Body: { email, password, name, username? }
router.post('/register', (req, res) => proxyToAuthService(req, res, '/auth/register'));

// POST /api/auth/login - Authenticate user and receive tokens
// Body: { email, password }
router.post('/login', (req, res) => proxyToAuthService(req, res, '/auth/login'));

// POST /api/auth/logout - Invalidate current session
// Headers: Authorization: Bearer <token>
// Body: { refreshToken }
router.post('/logout', (req, res) => proxyToAuthService(req, res, '/auth/logout'));

// POST /api/auth/refresh - Get new access token using refresh token
// Body: { refreshToken }
router.post('/refresh', (req, res) => proxyToAuthService(req, res, '/auth/refresh'));

// POST /api/auth/verify-email - Verify user email address
// Body: { token }
router.post('/verify-email', (req, res) => proxyToAuthService(req, res, '/auth/verify-email'));

// POST /api/auth/forgot-password - Request password reset token
// Body: { email }
router.post('/forgot-password', (req, res) =>
  proxyToAuthService(req, res, '/auth/forgot-password')
);

// POST /api/auth/reset-password - Reset password using reset token
// Body: { token, password }
router.post('/reset-password', (req, res) => proxyToAuthService(req, res, '/auth/reset-password'));

// ==================== User Management Endpoints ====================

// GET /api/auth/users/me - Get authenticated user's profile
// Headers: Authorization: Bearer <token>
router.get('/users/me', (req, res) => proxyToAuthService(req, res, '/users/me'));

// PATCH /api/auth/users/me - Update authenticated user's profile
// Headers: Authorization: Bearer <token>
// Body: { name?, username?, email? }
router.patch('/users/me', (req, res) => proxyToAuthService(req, res, '/users/me'));

// DELETE /api/auth/users/me - Delete authenticated user's account
// Headers: Authorization: Bearer <token>
router.delete('/users/me', (req, res) => proxyToAuthService(req, res, '/users/me'));

// POST /api/auth/users/me/change-password - Change user's password
// Headers: Authorization: Bearer <token>
// Body: { currentPassword, newPassword }
router.post('/users/me/change-password', (req, res) =>
  proxyToAuthService(req, res, '/users/me/change-password')
);

// GET /api/auth/users/login-history - Get user's login history
// Headers: Authorization: Bearer <token>
router.get('/users/login-history', (req, res) =>
  proxyToAuthService(req, res, '/users/login-history')
);

export default router;
