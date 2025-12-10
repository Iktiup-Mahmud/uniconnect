# UniConnect Setup Guide

## ✅ Project Setup Complete!

Your UniConnect project has been successfully prepared and is ready to run.

## 📋 What Was Done

### 1. Environment Configuration ✅
- Created `server/.env` with all necessary environment variables
- Created `client/.env.local` for frontend configuration
- Default MongoDB URI: `mongodb://localhost:27017/uniconnect`

### 2. Dependencies Installation ✅
- Installed all server dependencies (601 packages)
- Installed all client dependencies (435 packages)
- Both projects are ready to run

### 3. Build Verification ✅
- TypeScript compilation successful
- No blocking errors found
- Project structure validated

## 🚀 Quick Start

### Option 1: Manual Start (Recommended for first time)

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```
Wait for "Server is running on port 5000" message.

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```
Wait for "Ready on http://localhost:3000" message.

### Option 2: Automated Start

Run the provided PowerShell script:
```powershell
.\start-dev.ps1
```

This will open two terminal windows automatically.

## 🔧 Before You Start

### 1. MongoDB Setup

You need MongoDB running. Choose one option:

#### Option A: Local MongoDB
```powershell
# Check if MongoDB is installed
mongod --version

# Start MongoDB (if installed as service)
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

#### Option B: MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/uniconnect
   ```

### 2. Update Security Secrets (Important!)

Edit `server/.env` and change these values to secure random strings:
```env
JWT_SECRET=your-unique-secret-here-min-32-chars
JWT_REFRESH_SECRET=another-unique-secret-here-min-32-chars
```

Generate secure secrets using:
```powershell
# Generate random string (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 📍 Access Points

Once both servers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 🧪 Test the Setup

### 1. Test Backend Health
```powershell
# Using PowerShell
Invoke-RestMethod -Uri http://localhost:5000/health

# Expected response:
# status    : ok
# message   : Server is running
# timestamp : 2025-12-04T...
```

### 2. Test Frontend
Open http://localhost:3000 in your browser.

## 📁 Project Structure

```
uniconnect/
├── server/
│   ├── .env                ✅ Created
│   ├── node_modules/       ✅ Installed
│   ├── dist/              ✅ Built
│   └── src/               ✅ Ready
│
├── client/
│   ├── .env.local         ✅ Created
│   ├── node_modules/      ✅ Installed
│   └── src/               ✅ Ready
│
├── README.md              ✅ Updated
├── SETUP.md              ✅ This file
└── start-dev.ps1         ✅ Created
```

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
```powershell
# Reinstall dependencies
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ..\client
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: "Port already in use"
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=5001
```

### Issue: MongoDB connection failed
- Verify MongoDB is running: `mongo --eval "db.version()"`
- Check connection string in `server/.env`
- Ensure no firewall blocking port 27017

### Issue: PowerShell script execution disabled
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the script
.\start-dev.ps1
```

## 📚 Next Steps

1. **Start MongoDB** (if not running)
2. **Update JWT secrets** in `server/.env`
3. **Run the servers** using one of the methods above
4. **Access the application** at http://localhost:3000
5. **Check the backend** health at http://localhost:5000/health

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all JWT secrets to secure random strings
- [ ] Use strong MongoDB credentials
- [ ] Enable MongoDB authentication
- [ ] Update CORS settings for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for both frontend and backend
- [ ] Review and update `.env` files
- [ ] Never commit `.env` files to git

## 📖 Additional Resources

- **Main README:** [README.md](./README.md) - Comprehensive guide
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- **API Testing:** Use `test-api.sh` for API endpoint testing

## ✨ Features Ready to Implement

The project structure is set up for:
- ✅ User authentication (JWT)
- ✅ User management
- ✅ Post creation and management
- ✅ Error handling
- ✅ Logging
- ✅ Security middleware
- 🔄 Comments (models ready)
- 🔄 Likes and reactions
- 🔄 File uploads
- 🔄 Real-time features (Socket.io)

## 🤝 Need Help?

If you encounter issues:
1. Check this SETUP.md file
2. Review error messages in terminal
3. Check `server/logs/` for detailed logs
4. Refer to the main README.md

---

**Your project is ready! Happy coding! 🚀**

Last updated: December 4, 2025
