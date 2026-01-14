# 🧪 Test Courses API - Debugging Guide

## Quick Tests to Run

### Test 1: Check Your User Role

**Open browser console (F12) and run:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User Role:', user?.role);
console.log('User Data:', user);
```

**Expected Output:**
```
User Role: student
User Data: { _id: "...", name: "...", role: "student", ... }
```

**If role is NOT "student":**
- You might be logged in as faculty or admin
- Faculty only see courses they teach
- Create a new account with student role

---

### Test 2: Check API Token

**In browser console:**
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token:', token?.substring(0, 20) + '...');
```

**Expected Output:**
```
Token exists: true
Token: eyJhbGciOiJIUzI1NiIs...
```

**If no token:**
- You're not logged in properly
- Logout and login again

---

### Test 3: Test API Directly

**In browser console:**
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5001/api/v1/courses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Number of courses:', data.data?.courses?.length);
  console.log('Courses:', data.data?.courses);
})
.catch(err => console.error('Error:', err));
```

**Expected Output:**
```
API Response: { status: "success", data: { courses: [...] } }
Number of courses: 9
Courses: [{ code: "CS101", name: "...", ... }, ...]
```

---

### Test 4: Check Network Tab

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Reload the courses page
4. Look for request to: `http://localhost:5001/api/v1/courses`
5. Click on it and check:
   - **Status Code**: Should be `200 OK`
   - **Response**: Should have `data.courses` array
   - **Headers**: Should have `Authorization: Bearer ...`

**If Status Code is 401:**
- Token is invalid or expired
- Logout and login again

**If Status Code is 403:**
- You don't have permission (check role)

**If Status Code is 404:**
- API endpoint not found (check backend is running)

---

## Common Issues & Solutions

### Issue 1: "No courses found" message

**Possible Causes:**
1. ❌ **Wrong Role**: Logged in as faculty (faculty only see their courses)
2. ❌ **No Token**: Not logged in properly
3. ❌ **Backend Not Running**: Server on port 5001 is down
4. ❌ **No Courses in DB**: Database doesn't have courses

**Solutions:**
```bash
# Check 1: Verify you're logged in as STUDENT
- Open DevTools Console
- Run: JSON.parse(localStorage.getItem('user')).role
- Should show: "student"

# Check 2: Verify backend is running
- Open: http://localhost:5001/api/v1/courses
- Should see: "Unauthorized" or JSON response

# Check 3: Re-run seed script (if no courses)
cd server
npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
```

---

### Issue 2: Token expired or invalid

**Symptoms:**
- Getting 401 errors
- Redirected to login page
- "Unauthorized" messages

**Solution:**
```javascript
// Clear everything and login again
localStorage.clear();
window.location.href = '/login';
```

---

### Issue 3: Wrong user role

**If logged in as FACULTY:**
- Faculty users only see courses they teach
- The seed script creates courses taught by "faculty@demo.com"
- If you're a different faculty, you won't see any courses

**Solution - Create/Login as Student:**
```
1. Go to /register
2. Create new account:
   - Name: Test Student
   - Email: student@test.com
   - Username: teststudent
   - Password: password123
   - Role: student (default)
3. Login with this account
4. Go to /courses
5. Should see all 9 courses
```

---

## Quick Fix Commands

### 1. Clear Browser Data & Re-login
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

### 2. Create Test Student Account
```bash
# Using curl (if backend is running)
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "username": "teststudent",
    "password": "password123",
    "role": "student"
  }'
```

### 3. Re-run Seed Script
```bash
cd server
npx ts-node -r tsconfig-paths/register src/scripts/seed.ts
```

---

## Debug Checklist

- [ ] Backend server is running on port 5001
- [ ] Frontend is running on port 3000
- [ ] User is logged in (check localStorage)
- [ ] User role is "student" (not faculty/admin)
- [ ] Token is valid (not expired)
- [ ] Courses exist in database (9 courses)
- [ ] Network request returns 200 OK
- [ ] Response has courses array
- [ ] No console errors

---

## Expected Flow for Students

```
1. Student registers/logs in
2. Role is set to "student" (default)
3. Token is stored in localStorage
4. Navigate to /courses
5. Frontend calls api.getCourses()
6. Backend checks token (authenticate middleware)
7. Backend retrieves ALL courses (no filtering for students)
8. Backend returns 9 courses
9. Frontend displays all 9 courses
10. Student can click "Enroll Now"
11. After enrolling, button changes to "View Course"
```

---

## What Changed in the Fix

### Backend Logic (Old vs New):

**OLD (Wrong):**
```typescript
// Students only saw enrolled courses
if (req.user?.role === "student") {
  filter.students = req.user._id;
}
// Result: Students saw 0 courses (not enrolled yet)
```

**NEW (Fixed):**
```typescript
// Students see ALL courses
if (req.user?.role === "faculty") {
  filter.instructor = req.user._id;
}
// Students and admins see all courses
// Result: Students see 9 courses
```

---

## Still Not Working?

### Run Full Diagnostic:

**In browser console, run ALL tests:**
```javascript
console.log('=== DIAGNOSTIC START ===');

// Test 1: User data
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('1. User Role:', user?.role);
console.log('   User ID:', user?._id);
console.log('   User Name:', user?.name);

// Test 2: Token
const token = localStorage.getItem('token');
console.log('2. Token exists:', !!token);
console.log('   Token preview:', token?.substring(0, 30) + '...');

// Test 3: API Test
console.log('3. Testing API...');
fetch('http://localhost:5001/api/v1/courses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('   API Status:', data.status);
  console.log('   Courses count:', data.data?.courses?.length || 0);
  console.log('   Courses:', data.data?.courses?.map(c => c.code + ' - ' + c.name));
})
.catch(err => console.error('   API Error:', err));

console.log('=== DIAGNOSTIC END ===');
```

**Send me the output from this diagnostic!**

---

## Contact Info

If still having issues, provide:
1. Output from diagnostic above
2. Network tab screenshot showing the courses API call
3. Any console errors
4. User role from localStorage

This will help identify the exact issue! 🔍
