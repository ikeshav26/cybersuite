import { Request, Response, NextFunction } from 'express';
import { App } from '@octokit/app';
import { logger } from '@cybersec/utils';

/**
 * Get GitHub App installation ID for a user
 */
export const getInstallationId = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Username is required',
      });
      return;
    }

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      res.status(500).json({
        success: false,
        error: 'GitHub App not configured',
      });
      return;
    }

    // Create GitHub App instance
    const app = new App({
      appId,
      privateKey,
    });

    // Get all installations for this app
    const { data: installations } = await app.octokit.request('GET /app/installations');

    logger.info('Fetched installations', {
      total: installations.length,
      username,
    });

    // Find installation for this user
    const userInstallation = installations.find(
      (inst: any) => inst.account?.login?.toLowerCase() === username.toLowerCase()
    );

    if (!userInstallation) {
      res.status(404).json({
        success: false,
        error: 'GitHub App not installed for this user',
        message: 'Please install the GitHub App first',
      });
      return;
    }

    res.json({
      success: true,
      installation_id: userInstallation.id,
      account: userInstallation.account?.login,
    });
  } catch (error) {
    logger.error('Error fetching installation ID');
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch installation ID',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
