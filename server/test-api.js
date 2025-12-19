/* eslint-env node, es2017 */
/* eslint-disable */
// Quick API Test Script
// Run this after starting the server: node test-api.js

const API_URL = 'http://localhost:5001/api/v1';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function testEndpoint(name, method, url, headers = {}, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✓${colors.reset} ${name} - Status: ${response.status}`);
      return { success: true, data, token: data.data?.token };
    } else {
      console.log(`${colors.red}✗${colors.reset} ${name} - Status: ${response.status}`);
      console.log(`  Error: ${data.message || 'Unknown error'}`);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.yellow}=== UniConnect Backend API Tests ===${colors.reset}\n`);
  
  // Test 1: Health Check
  await testEndpoint('Health Check', 'GET', 'http://localhost:5001/health');
  
  // Test 2: Register User
  const timestamp = Date.now();
  const registerResult = await testEndpoint(
    'User Registration',
    'POST',
    `${API_URL}/auth/register`,
    {},
    {
      name: 'Test User',
      email: `test${timestamp}@test.com`,
      username: `testuser${timestamp}`,
      password: 'test123456'
    }
  );
  
  let token = registerResult.token;
  
  // Test 3: Login (if registration worked, try with those credentials)
  if (registerResult.success) {
    const loginResult = await testEndpoint(
      'User Login',
      'POST',
      `${API_URL}/auth/login`,
      {},
      {
        email: `test${timestamp}@test.com`,
        password: 'test123456'
      }
    );
    if (loginResult.token) {
      token = loginResult.token;
    }
  }
  
  // Test 4: Get Posts (public)
  await testEndpoint('Get Posts (Public)', 'GET', `${API_URL}/posts`);
  
  // Test 5: Get Courses
  await testEndpoint('Get Courses', 'GET', `${API_URL}/courses`, 
    token ? { Authorization: `Bearer ${token}` } : {});
  
  // Test 6: Get Clubs
  await testEndpoint('Get Clubs', 'GET', `${API_URL}/clubs`);
  
  // Test 7: Get Events
  await testEndpoint('Get Events', 'GET', `${API_URL}/events`);
  
  // Test 8: Get Announcements
  await testEndpoint('Get Announcements', 'GET', `${API_URL}/announcements`,
    token ? { Authorization: `Bearer ${token}` } : {});
  
  // Test 9: Get Notifications (requires auth)
  if (token) {
    await testEndpoint('Get Notifications', 'GET', `${API_URL}/notifications`,
      { Authorization: `Bearer ${token}` });
  }
  
  // Test 10: Create Post (requires auth)
  if (token) {
    await testEndpoint('Create Post', 'POST', `${API_URL}/posts`,
      { Authorization: `Bearer ${token}` },
      { content: 'This is a test post from API test script!' });
  }
  
  console.log(`\n${colors.yellow}=== Tests Complete ===${colors.reset}`);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('This script requires Node.js 18+ with fetch support');
  console.log('Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runTests().catch(console.error);

