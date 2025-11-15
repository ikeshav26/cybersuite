export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SecureAuth',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010',
  SECUREBOT_URL: process.env.NEXT_PUBLIC_SECUREBOT_URL || 'http://localhost:5000',
} as const;
