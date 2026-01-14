# 🐛 Debug Guide - Courses Not Showing

## ✅ Changes Applied

I've added **detailed logging** throughout the system to help us track exactly where the data is getting lost.

### Added Logging In:

1. **Backend Controller** (`server/src/controllers/course.controller.ts`)
   - Logs when the API is called
   - Logs user info and role
   - Logs how many courses are found
   - Logs course codes

2. **Frontend API Client** (`client/src/lib/api.ts`)
   - Logs raw backend response
   - Logs converted response
   - Logs data structure

3. **Frontend Courses Page** (`client/src/app/courses/page.tsx`)
   - Logs when fetching starts
   - Logs API response
   - Logs courses array
   - Logs courses length

---

## 🧪 How to Debug

### Step 1: Start Fresh

Make sure both servers are running:

```bash
# Terminal 1 - Backend (check if running)
lsof -i:5001
# If not running: cd server && npm run dev

# Terminal 2 - Frontend (restart to see new logs)
cd client
npm run dev
```

### Step 2: Open Browser with DevTools

1. Open **Chrome/Firefox**
2. Press **F12** (or Cmd+Option+I on Mac) to open DevTools
3. Go to **Console** tab
4. Clear the console (click 🚫 icon)

### Step 3: Navigate to Courses

1. Login to your account
2. Navigate to `/courses`
3. **Watch the Console** - You'll see logs like:

#### Expected Backend Logs (in Terminal):
```
🔍 getAllCourses called
👤 User: Test Student | Role: student
🔎 Filter: {}
📚 Courses found: 9
📝 Course codes: CS101, CS201, CS301, CS350, CS401, MATH201, PHY101, ENG201, BUS301
```

#### Expected Frontend Logs (in Browser Console):
```
🔄 Fetching courses...
🔍 API handleResponse - URL: http://localhost:5001/api/v1/courses
📊 Backend Data: { status: "success", message: "...", data: { courses: [...] } }
✨ Converted Response: { success: true, message: "...", data: { courses: [...] } }
📦 API Response: { success: true, data: { courses: [...] } }
✅ Success: true
📊 Data: { courses: [...] }
📚 Courses: [Array(9)]
🔢 Courses length: 9
✨ Setting courses: 9 courses
```

---

## 🔍 What to Look For

### Scenario 1: Backend Shows 0 Courses

**Backend Log Shows:**
```
📚 Courses found: 0
📝 Course codes:
```

**Problem:** No courses in database

**Solution:**
```bash
cd server
npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
```

---

### Scenario 2: Backend Shows 9 Courses, Frontend Gets Empty

**Backend Log Shows:**
```
📚 Courses found: 9
```

**Frontend Log Shows:**
```
📚 Courses: []
🔢 Courses length: 0
```

**Problem:** Response format mismatch

**Check:** Look at the "Backend Data" log - what's the structure?

**Possible Issues:**
- `data.courses` is nested differently
- Response is being transformed incorrectly

---

### Scenario 3: Frontend Gets Data But Doesn't Display

**Frontend Log Shows:**
```
🔢 Courses length: 9
✨ Setting courses: 9 courses
```

**But page shows:** "No courses found"

**Problem:** React state update issue or render logic problem

**Solution:** Check if `courses.length === 0` in the render condition

---

### Scenario 4: Token/Auth Issue

**Backend Log Shows:**
```
401 Unauthorized
```

**Frontend Log Shows:**
```
❌ Error fetching courses: Unauthorized
```

**Problem:** Token expired or invalid

**Solution:**
```javascript
// In browser console
localStorage.clear();
window.location.href = '/login';
```

---

### Scenario 5: Role Filtering Issue

**Backend Log Shows:**
```
👤 User: John Doe | Role: faculty
🔎 Filter: {"instructor":"..."}
📚 Courses found: 0
```

**Problem:** You're logged in as faculty but you're not the instructor

**Solution:** Login as student or create student account

---

## 📋 Debugging Checklist

Run through this checklist and **note what you see**:

### Backend (Terminal):
- [ ] Server is running on port 5001
- [ ] See "🔍 getAllCourses called" when you load /courses
- [ ] User role shows: `student` (not faculty)
- [ ] Filter shows: `{}` (empty, not filtering)
- [ ] Courses found shows: `9` (not 0)
- [ ] Course codes listed: CS101, CS201, etc.

### Frontend (Browser Console):
- [ ] See "🔄 Fetching courses..."
- [ ] See "🔍 API handleResponse"
- [ ] Backend Data has `status: "success"`
- [ ] Backend Data has `data.courses` array
- [ ] Courses length shows: `9`
- [ ] See "✨ Setting courses: 9 courses"
- [ ] No errors (❌) in console

### Database:
- [ ] MongoDB is connected (check backend terminal)
- [ ] Courses collection has 9 documents
- [ ] You can see courses in MongoDB Compass/Atlas

---

## 🎯 Send Me This Info

After following the steps above, **copy and paste** the following:

### 1. Backend Terminal Output:
```
[Paste the logs that start with 🔍 getAllCourses called]
```

### 2. Browser Console Output:
```
[Paste all logs with emojis: 🔄, 🔍, 📊, etc.]
```

### 3. User Info (run in browser console):
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user?.role);
console.log('Name:', user?.name);
console.log('ID:', user?._id);
```

### 4. Any Errors:
```
[Paste any red errors from console]
```

---

## 🚀 Quick Tests

### Test 1: Check Database Directly
```bash
# If you have MongoDB installed locally
mongosh
use uniconnect
db.courses.countDocuments()
# Should return: 9

db.courses.find({}, {code: 1, name: 1}).pretty()
# Should list all 9 courses
```

### Test 2: Test API with curl
```bash
# Get your token first
TOKEN="your_token_here"

curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5001/api/v1/courses

# Should return JSON with 9 courses
```

### Test 3: Check Network Tab
1. Open DevTools → Network tab
2. Reload /courses page
3. Find the request to `/api/v1/courses`
4. Check:
   - Status code (should be 200)
   - Response tab (should have courses array)
   - Preview tab (should show 9 items)

---

## 💡 Common Solutions

### Solution 1: Clear Cache and Restart
```bash
# Stop both servers (Ctrl+C)

# Clear frontend cache
cd client
rm -rf .next
npm run dev

# Backend should auto-restart
```

### Solution 2: Verify Database Connection
```bash
# Check backend logs for:
info: MongoDB Connected: ...
info: Database Name: uniconnect

# If not connected, check .env file
cat server/.env | grep MONGO
```

### Solution 3: Re-seed Database
```bash
cd server
npx ts-node -r tsconfig-paths/register src/scripts/seed.ts

# Should see:
# ✅ Seeding completed successfully!
# Created 9 courses
```

---

## 📞 Next Steps

1. **Follow the debugging steps** above
2. **Copy the logs** (backend + frontend)
3. **Run the quick tests**
4. **Send me the results**

With the detailed logs, I'll be able to pinpoint exactly where the data is getting lost! 🔍

---

## 🎓 What We're Looking For

The data should flow like this:

```
Database (9 courses)
    ↓
Backend Controller (finds 9 courses)
    ↓
JSON Response ({ status: "success", data: { courses: [...] } })
    ↓
Frontend API Client (receives response)
    ↓
Courses Page (sets state with 9 courses)
    ↓
UI (displays 9 course cards)
```

The logs will show us exactly where this chain breaks! 🔗
