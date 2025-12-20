# Quick Test Guide - UniConnect

## 🚀 Start Testing in 5 Minutes

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Wait for: `Server is running on port 5001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Wait for: `Ready on http://localhost:3000`

### Step 2: Create Test Accounts

1. Open `http://localhost:3000`
2. Click "Register"
3. Create **two accounts** (for testing messaging):
   - Account 1: `test1@test.com` / `password123`
   - Account 2: `test2@test.com` / `password123`

### Step 3: Test Real-time Messaging (CRITICAL)

**In Browser 1 (Account 1):**
1. Open browser console (F12)
2. Go to Messages
3. Look for: `✅ Connected to Socket.io`
4. Start a conversation with Account 2

**In Browser 2 (Account 2 - Incognito/Different Browser):**
1. Login with Account 2
2. Open console (F12)
3. Go to Messages
4. Look for: `✅ Connected to Socket.io`
5. Open the conversation

**Send messages back and forth:**
- Messages should appear **instantly** without refresh
- Check console for: `📡 Socket event received: new_message`
- Check server terminal for: `📤 Emitting new_message`

### Step 4: Test Core Features

**Dashboard:**
- [ ] Create a post
- [ ] Upload an image
- [ ] Like a post
- [ ] Comment on a post
- [ ] Click on a friend in sidebar → opens profile
- [ ] Hover over friend → click message icon → opens chat

**Profile:**
- [ ] View your profile
- [ ] Edit your profile
- [ ] Click on another user → view their profile

**Admin Panel** (if admin):
- [ ] Click admin icon (purple settings)
- [ ] View user list
- [ ] View posts list
- [ ] Check statistics

**Notifications:**
- [ ] Click bell icon
- [ ] View notifications
- [ ] Mark as read

## 🔍 What to Look For

### ✅ Success Indicators

**Real-time Messaging:**
```
Browser Console:
✅ Connected to Socket.io
📥 Joining conversation room: [id]
📡 Socket event received: new_message
➕ Adding new message to state via socket

Server Terminal:
✅ User [id] connected to Socket.io
📥 User [id] joining conversation room
👥 Number of sockets in conversation: 2
✅ Message emitted to room
```

**UI/UX:**
- Messages appear instantly
- No page reload needed
- Smooth scrolling
- Connection status shows "Connected"
- Friends list shows real users

### ❌ Problems to Report

**If messages don't arrive in real-time:**
1. Check browser console for errors
2. Check if socket is connected
3. Check server terminal for connection logs
4. Take screenshot of console logs

**If UI is broken:**
1. Check for layout issues
2. Check if buttons work
3. Check mobile responsiveness

## 📊 Test Checklist

### Must Test (5 min)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create a post
- [ ] **Real-time messaging works**
- [ ] Friends list shows users

### Should Test (10 min)
- [ ] Profile editing
- [ ] View other profiles
- [ ] Comment system
- [ ] Like system
- [ ] Notifications
- [ ] Admin panel (if admin)

### Nice to Test (15 min)
- [ ] Clubs page
- [ ] Events page
- [ ] Courses page
- [ ] Multiple file upload
- [ ] Mobile view
- [ ] Different browsers

## 🐛 Common Issues & Fixes

### Issue: Socket not connecting
**Check:**
- Is backend running?
- Is it on port 5001?
- Check browser console for errors

### Issue: Messages not real-time
**Check:**
- Console shows "Connected to Socket.io"?
- Console shows "Socket event received"?
- Server shows "User connected"?
- Server shows "Number of sockets: 2"?

### Issue: Can't see friends
**Check:**
- Are there other users in database?
- Is API returning users?
- Check network tab for `/users` request

## 📝 Report Template

If you find issues, report like this:

```
**Issue:** [Brief description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error...

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Console Logs:** [Paste relevant logs]
**Screenshots:** [If applicable]
```

## ✨ Success Criteria

The app is working well if:
1. ✅ Messages arrive **instantly** without reload
2. ✅ All pages load without errors
3. ✅ CRUD operations work (create, read, update, delete)
4. ✅ UI is responsive and looks good
5. ✅ No console errors
6. ✅ Socket shows "Connected"

## 🎯 Priority Tests

**Test these FIRST:**
1. Real-time messaging (most critical)
2. Post creation
3. Profile viewing
4. Friends list functionality

**Test these SECOND:**
5. Admin panel
6. Notifications
7. Comments/Likes
8. Clubs/Events/Courses

## 📞 Need Help?

Check these files:
- `TESTING_CHECKLIST.md` - Detailed testing guide
- `IMPLEMENTATION_STATUS.md` - What's implemented
- `README.md` - Setup instructions

## 🎉 When Everything Works

You should be able to:
- Send messages that appear instantly
- See real users in friends list
- Click friends to view profiles or message them
- Create posts with media
- Like and comment on posts
- Use admin panel to moderate
- Get notifications

**That's it! Start testing and report any issues you find.**

