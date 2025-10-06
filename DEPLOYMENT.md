# 🚀 Deploying Binance Smart Mail to Render

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your GitHub repository connected to Render
3. WalletConnect Project ID from https://cloud.walletconnect.com

## Quick Deploy

### Option 1: Using render.yaml (Automatic)

1. Go to https://render.com/
2. Click "New" → "Blueprint"
3. Connect your GitHub repository: `tow3web3/BSM`
4. Render will automatically detect `render.yaml`
5. Click "Apply"

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database

1. In Render dashboard, click "New" → "PostgreSQL"
2. Name: `binance-smart-mail-db`
3. Database: `binance_smart_mail`
4. Plan: Free
5. Click "Create Database"
6. **Copy the "Internal Database URL"**

#### Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect to your repository: `tow3web3/BSM`
3. Configure:
   - **Name**: `binance-smart-mail`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     npm install && npm run db:generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Plan**: Free

#### Step 3: Environment Variables

Add these in the "Environment" section:

```env
NODE_VERSION=20.13.1
DATABASE_URL=<paste your internal database URL>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_walletconnect_project_id>
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_BSM_CONTRACT=0x0000000000000000000000000000000000000000
```

**Important**: 
- Get your WalletConnect Project ID from: https://cloud.walletconnect.com
- Update `NEXT_PUBLIC_BSM_CONTRACT` with your actual token contract address

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your app will be live at: `https://binance-smart-mail.onrender.com`

## Database Migration

After first deployment, you need to run migrations:

1. Go to your web service in Render
2. Click "Shell" tab
3. Run:
   ```bash
   npm run db:migrate
   ```

## Post-Deployment

### Update WalletConnect Settings

1. Go to https://cloud.walletconnect.com
2. Open your project
3. Add your Render URL to "Allowed Domains":
   - `https://binance-smart-mail.onrender.com`
   - `https://*.onrender.com`

### Test Your Deployment

1. Visit your Render URL
2. Click "Start Messaging"
3. Connect MetaMask
4. Test sending a message

## Custom Domain (Optional)

1. In Render dashboard, go to your web service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `binancesmartmail.com`)
4. Update DNS records as shown
5. Update WalletConnect allowed domains

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Node version is 20.x
- Check build logs for specific errors

### Database Connection Issues
- Ensure DATABASE_URL is the **Internal** database URL
- Run migrations in the Shell tab
- Check database status in Render dashboard

### WalletConnect Not Working
- Verify Project ID is correct
- Check that your Render URL is in allowed domains
- Ensure HTTPS is enabled (automatic on Render)

## Free Tier Limits

Render free tier includes:
- ✅ 750 hours/month web service
- ✅ PostgreSQL database (expires after 90 days)
- ⚠️ Service sleeps after 15 min of inactivity
- ⚠️ Cold starts may take 30-60 seconds

## Upgrading

For production use, consider upgrading to:
- **Starter**: $7/month - No sleep, faster builds
- **PostgreSQL**: $7/month - Persistent database

---

🎉 **Your Binance Smart Mail is now deployed!**

Visit: https://binance-smart-mail.onrender.com

