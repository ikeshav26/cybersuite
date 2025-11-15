# GitHub App Setup Guide

This guide will help you set up the GitHub App for automated security remediation.

## Prerequisites

- GitHub account with admin access to repositories you want to protect
- AI service running on port 3004
- Public URL for webhooks (use ngrok for local development)

## Step 1: Create GitHub App

1. Go to your GitHub account settings: https://github.com/settings/apps
2. Click **"New GitHub App"**
3. Fill in the following details:

### Basic Information

- **GitHub App name**: `your-unique-app-name` (e.g., `securebot-yourname`)
- **Homepage URL**: `http://localhost:3010` (or your production URL)
- **Webhook URL**: See Step 2 below
- **Webhook secret**: Generate one using `openssl rand -hex 32`

### Permissions

**Repository permissions:**

- Contents: **Read & Write** (to create branches and commit fixes)
- Pull requests: **Read & Write** (to create PRs)
- Metadata: **Read** (automatic)

**Subscribe to events:**

- [x] Installation
- [x] Installation repositories
- [x] Push (optional, for auto-scanning on push)

### Where can this GitHub App be installed?

- Choose "Any account" or "Only on this account" based on your needs

4. Click **"Create GitHub App"**

## Step 2: Configure Webhook URL

### For Local Development (using ngrok):

```bash
# Start ngrok tunnel
ngrok http 3004

# You'll get a URL like: https://abc123.ngrok.io
# Your webhook URL will be: https://abc123.ngrok.io/api/ai/github/webhook
```

### For Production:

```
https://yourdomain.com/api/ai/github/webhook
```

## Step 3: Get GitHub App Credentials

After creating the app, you'll need three pieces of information:

### 1. App ID

- Found on the app's settings page
- Example: `123456`

### 2. Private Key

- Click **"Generate a private key"** at the bottom of the settings page
- Download the `.pem` file
- Copy the contents

### 3. Webhook Secret

- The secret you generated in Step 1

## Step 4: Update Environment Variables

### AI Service (.env)

```bash
cd services/ai-service
nano .env
```

Add the following:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQ...
...your private key here...
-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: For the private key, you can either:

- Put the entire key on one line with `\n` for newlines, OR
- Use a multi-line string as shown above

### Web App (.env.local)

```bash
cd apps/web
nano .env.local
```

Add:

```env
NEXT_PUBLIC_GITHUB_APP_NAME=your-app-slug
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3004/api/ai
```

**Note**: The `GITHUB_APP_NAME` is the "slug" version of your app name (lowercase, hyphens instead of spaces). You can find it in the GitHub App URL: `github.com/apps/YOUR-APP-SLUG`

## Step 5: Install the GitHub App

1. Go to: `https://github.com/apps/YOUR-APP-SLUG/installations/new`
2. Select the repositories you want to protect
3. Click **"Install"**

## Step 6: Get Installation ID

After installing, GitHub will send a webhook to your service. You need to capture the `installation_id` from the webhook payload or check the installation URL:

`https://github.com/settings/installations/INSTALLATION_ID`

For development, you can temporarily hardcode this in the frontend or store it in your database when the webhook is received.

## Step 7: Test the Integration

1. **Start all services:**

   ```bash
   # Terminal 1: AI Service
   cd services/ai-service
   pnpm dev

   # Terminal 2: Auth Service
   cd services/auth-service
   pnpm dev

   # Terminal 3: Web App
   cd apps/web
   pnpm dev

   # Terminal 4: ngrok (for local development)
   ngrok http 3004
   ```

2. **Update webhook URL** in GitHub App settings with your ngrok URL

3. **Test the flow:**
   - Go to http://localhost:3010/user-dashboard
   - Click "Authorize GitHub" tab
   - Connect your GitHub account
   - Click "Install GitHub App" button
   - Select repositories
   - Return to dashboard and click "Refresh"
   - You should see your protected repositories!

## Troubleshooting

### Webhooks not working

- Check ngrok is running and URL is updated in GitHub App settings
- Verify webhook secret matches between GitHub and your .env
- Check AI service logs for webhook events

### Installation ID not found

- For development: hardcode it temporarily in AuthorizeGitHubTab.tsx
- For production: store it when the installation webhook is received

### Repositories not loading

- Verify AI service is running on port 3004
- Check browser console for API errors
- Ensure CORS is configured correctly in AI service

### Private key issues

- Make sure the private key format is correct in .env
- Try using `\n` for newlines: `"-----BEGIN RSA PRIVATE KEY-----\nMII..."`
- Or use environment variable from file: `GITHUB_APP_PRIVATE_KEY=$(cat private-key.pem)`

## Production Deployment

For production, you'll need to:

1. **Store installation IDs** in your database when webhooks are received
2. **Use proper secrets management** (AWS Secrets Manager, HashiCorp Vault, etc.)
3. **Set up HTTPS** for webhook URLs
4. **Implement proper error handling** and retry logic
5. **Add rate limiting** to prevent abuse

## Security Best Practices

- Never commit private keys or secrets to git
- Use environment variables for all sensitive data
- Rotate webhook secrets periodically
- Monitor webhook deliveries in GitHub App settings
- Implement signature verification for webhooks

## Next Steps

Once the GitHub App is installed and working:

1. Push code to a protected repository
2. The app will automatically scan for vulnerabilities
3. If vulnerabilities are found, it will create a PR with fixes
4. Review and merge the security patches!

---

Need help? Check the logs in your AI service or open an issue.
