# Vercel Environment Variable Setup

## Your Render Backend URL

```
https://uniconnect-jpr2.onrender.com
```

---

## Step-by-Step: Update Vercel

### 1. Go to Vercel Dashboard

🔗 https://vercel.com/dashboard

### 2. Select Your Project

Click on your **uniconnect** project (or whatever you named it)

### 3. Go to Settings

Click on **"Settings"** tab at the top

### 4. Click Environment Variables

In the left sidebar, click **"Environment Variables"**

### 5. Add New Variable

Click **"Add New"** and enter:

| Field           | Value                                         |
| --------------- | --------------------------------------------- |
| **Key**         | `NEXT_PUBLIC_API_URL`                         |
| **Value**       | `https://uniconnect-jpr2.onrender.com/api/v1` |
| **Environment** | ✅ Production ✅ Preview ✅ Development       |

**IMPORTANT**:

- Make sure to include `/api/v1` at the end
- NO trailing slash after `/v1`
- Check ALL three environments (Production, Preview, Development)

### 6. Save

Click **"Save"** button

---

## 7. Redeploy Your Application

After adding the environment variable, you MUST redeploy:

**Option A: From Vercel Dashboard**

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Select **"Redeploy"**
5. Confirm redeploy

**Option B: Push to GitHub**

```bash
cd /Users/seyam/Code-work/Projects/uniconnect
git add .
git commit -m "Update API URL for Render backend"
git push origin main
```

Vercel will auto-deploy on push.

---

## 8. Test Your Deployment

### Once redeployed:

1. **Open your Vercel URL** (e.g., `https://yourapp.vercel.app`)

2. **Open Browser Console** (F12 → Console tab)

3. **Try to register/login**

   - Go to register page
   - Fill in the form
   - Submit

4. **Check Network Tab** (F12 → Network tab)
   - Should see requests to `https://uniconnect-jpr2.onrender.com/api/v1/...`
   - Status should be 200/201 for successful requests

---

## Troubleshooting 🔧

### Still connecting to localhost?

- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel deployment logs
- Verify env variable was saved
- Make sure you redeployed after adding env variable

### CORS Error?

Update backend environment variable on Render:

1. Go to Render dashboard
2. Select your service
3. Go to **Environment** tab
4. Update `CLIENT_URL` to your Vercel URL: `https://yourapp.vercel.app`
5. Click **Save Changes** (will auto-redeploy)

### 502 Bad Gateway?

- Your Render backend might be sleeping (free tier)
- Visit `https://uniconnect-jpr2.onrender.com/health` to wake it up
- Wait 30-60 seconds for cold start
- Try again

### Request Timeout?

- Render free tier spins down after 15 min inactivity
- First request takes ~30 seconds to start up
- Subsequent requests are fast

---

## Quick Test Backend

Open this in your browser to test backend:

```
https://uniconnect-jpr2.onrender.com/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2026-01-13T..." }
```

---

## Summary ✅

**What you did locally:**

- ✅ Created `.env.local` with Render URL

**What to do in Vercel:**

1. ✅ Add `NEXT_PUBLIC_API_URL` environment variable
2. ✅ Value: `https://uniconnect-jpr2.onrender.com/api/v1`
3. ✅ Redeploy

**What to verify in Render:**

- ✅ Check `CLIENT_URL` matches your Vercel URL

---

## Your Current Setup

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://yourapp.vercel.app         │
└─────────────────┬───────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────┐
│  Backend (Render)                   │
│  https://uniconnect-jpr2.onrender   │
│  .com/api/v1                        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Database (MongoDB Atlas)           │
└─────────────────────────────────────┘
```

You're all set! 🚀
