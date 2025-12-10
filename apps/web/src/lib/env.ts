export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3006/api',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SecureAuth',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3004/api/ai',
  GITHUB_APP_NAME: process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'hacknauts-cybersec',
} as const;
