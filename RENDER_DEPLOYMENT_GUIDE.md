# Deploy Backend to Render - Step by Step Guide

## Prerequisites ✅

- [ ] MongoDB Atlas account with connection string
- [ ] Cloudinary account with API credentials
- [ ] GitHub repository pushed
- [ ] Vercel frontend URL

---

## Step 1: Prepare MongoDB Atlas

1. Go to **mongodb.com/cloud/atlas**
2. Sign in (or create free account)
3. Create a **free M0 cluster** (if not already created)
4. Click **"Connect"** → **"Connect your application"**
5. Copy your connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/uniconnect?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add your database name (e.g., `uniconnect`)
8. **IMPORTANT**: Under **Network Access**, add IP `0.0.0.0/0` to allow Render to connect

---

## Step 2: Prepare Cloudinary

1. Go to **cloudinary.com**
2. Sign in (or create free account)
3. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Generate JWT Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT Refresh Secret (run again for different value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save these values** - you'll need them in Step 6!

---

## Step 4: Push Code to GitHub

If not already done:

```bash
cd /Users/seyam/Code-work/Projects/uniconnect
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

---

## Step 5: Create Render Web Service

1. Go to **https://render.com**
2. Sign up/Login (use GitHub account for easier deployment)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select **uniconnect** repository

### Configuration:

Fill in these settings:

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| **Name**           | `uniconnect-backend` (or any name)                    |
| **Region**         | Choose closest to you (e.g., Oregon USA)              |
| **Branch**         | `main` (or your default branch)                       |
| **Root Directory** | `server`                                              |
| **Runtime**        | `Node`                                                |
| **Build Command**  | `./render-build.sh` OR `npm install && npm run build` |
| **Start Command**  | `npm start`                                           |
| **Instance Type**  | **Free**                                              |

Click **"Advanced"** to add environment variables (next step).

---

## Step 6: Add Environment Variables

Click **"Add Environment Variable"** and add these ONE BY ONE:

### Required Variables:

| Key                      | Value                                | Example                      |
| ------------------------ | ------------------------------------ | ---------------------------- |
| `NODE_ENV`               | `production`                         |                              |
| `PORT`                   | `5000`                               |                              |
| `MONGODB_URI`            | Your MongoDB Atlas connection string | `mongodb+srv://...`          |
| `JWT_SECRET`             | Generated secret from Step 3         | `a1b2c3d4...`                |
| `JWT_EXPIRES_IN`         | `7d`                                 |                              |
| `JWT_REFRESH_SECRET`     | Generated secret from Step 3         | `e5f6g7h8...`                |
| `JWT_REFRESH_EXPIRES_IN` | `30d`                                |                              |
| `CLIENT_URL`             | Your Vercel frontend URL             | `https://yourapp.vercel.app` |
| `LOG_LEVEL`              | `info`                               |                              |
| `CLOUDINARY_CLOUD_NAME`  | Your Cloudinary cloud name           |                              |
| `CLOUDINARY_API_KEY`     | Your Cloudinary API key              |                              |
| `CLOUDINARY_API_SECRET`  | Your Cloudinary API secret           |                              |

**IMPORTANT**:

- NO quotes around values
- NO trailing spaces
- Make sure MongoDB URI is complete with password

---

## Step 7: Deploy

1. Click **"Create Web Service"**
2. Render will start building your app
3. Wait 5-10 minutes for first deployment
4. Watch the logs for any errors

**Your backend URL will be**: `https://uniconnect-backend.onrender.com`

---

## Step 8: Update Frontend Environment Variable

1. Go to **vercel.com**
2. Open your project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_URL` to:
   ```
   https://YOUR-RENDER-APP-NAME.onrender.com/api/v1
   ```
5. **Redeploy** your frontend (Vercel → Deployments → click "..." → Redeploy)

---

## Step 9: Test Your Deployment

### Test Backend Health:

Open in browser:

```
https://YOUR-RENDER-APP-NAME.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Test API:

```bash
curl https://YOUR-RENDER-APP-NAME.onrender.com/api/v1/auth/register \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test","email":"test@test.com","password":"test123","university":"Test Uni"}'
```

### Test Frontend:

1. Open your Vercel URL
2. Try to register/login
3. Check browser console for errors

---

## Troubleshooting 🔧

### Build Failed?

- Check logs in Render dashboard
- Ensure `server/` directory has `package.json`
- Verify build command: `npm install && npm run build`

### App Crashes?

- Check logs: Render Dashboard → Logs
- Common issues:
  - ❌ Wrong MongoDB URI
  - ❌ Missing environment variables
  - ❌ MongoDB IP not whitelisted (add 0.0.0.0/0)

### Connection Timeout?

- MongoDB Atlas: Add IP `0.0.0.0/0` to Network Access
- Render: Make sure service is running (green dot)

### CORS Error?

- Verify `CLIENT_URL` matches your Vercel URL exactly
- Include `https://` protocol
- No trailing slash

### Cold Starts (Free Tier):

- Render sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds
- Solution: Upgrade to paid tier OR use cron-job.org to ping every 10 minutes

---

## Free Tier Limitations ⚠️

- ✅ 750 hours/month (enough for 24/7)
- ❌ Spins down after 15 min inactivity
- ❌ 512 MB RAM
- ❌ Slower CPU

**Upgrade later if needed** ($7/month for no cold starts)

---

## Monitor Your App

**Render Dashboard**:

- View logs: Render → Your Service → Logs
- Check metrics: CPU, Memory usage
- Set up alerts for crashes

**MongoDB Atlas**:

- Monitor database usage
- Check connection count
- View slow queries

---

## Next Steps After Deployment ✨

1. ✅ Test all features (register, login, posts, uploads)
2. ✅ Monitor logs for errors
3. ✅ Set up custom domain (optional)
4. ✅ Enable HTTPS (automatic on Render)
5. ✅ Set up monitoring/alerts

---

## Quick Reference URLs

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cloudinary**: https://cloudinary.com/console
- **Vercel**: https://vercel.com/dashboard

---

## Need Help?

Common commands to debug:

```bash
# Check if backend is responding
curl https://YOUR-RENDER-APP.onrender.com/health

# Test MongoDB connection locally
node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('Connected!')).catch(e => console.error(e))"

# View Render logs
# Go to: Render Dashboard → Your Service → Logs (or use Render CLI)
```

---

**Your backend should now be live!** 🎉

The URL format will be: `https://uniconnect-backend-xxxx.onrender.com`
