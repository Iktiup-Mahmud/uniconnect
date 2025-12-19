#!/bin/bash

# UniConnect Backend Test Script
# This script tests the backend API endpoints

API_URL="http://localhost:5001/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== UniConnect Backend API Test ===${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/../health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi

echo ""

# Test 2: Register a test user
echo -e "${YELLOW}2. Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@test.com",
    "username": "testuser'$(date +%s)'",
    "password": "test123456"
  }')

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
    echo "Token received: ${TOKEN:0:20}..."
    echo "User ID: $USER_ID"
else
    echo -e "${RED}✗ Registration failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    TOKEN=""
fi

echo ""

# Test 3: Login
echo -e "${YELLOW}3. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123456"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${YELLOW}⚠ Login test skipped (user may not exist)${NC}"
fi

echo ""

# Test 4: Get Posts (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}4. Testing Get Posts (with auth)...${NC}"
    POSTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/posts" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$POSTS_RESPONSE" | tail -n1)
    BODY=$(echo "$POSTS_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Get posts successful${NC}"
    else
        echo -e "${RED}✗ Get posts failed (HTTP $HTTP_CODE)${NC}"
    fi
else
    echo -e "${YELLOW}4. Testing Get Posts (without auth - should work)...${NC}"
    POSTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/posts")
    
    HTTP_CODE=$(echo "$POSTS_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Get posts successful (public access)${NC}"
    else
        echo -e "${RED}✗ Get posts failed (HTTP $HTTP_CODE)${NC}"
    fi
fi

echo ""

# Test 5: Get Courses
echo -e "${YELLOW}5. Testing Get Courses...${NC}"
COURSES_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/courses" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"})

HTTP_CODE=$(echo "$COURSES_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get courses successful${NC}"
else
    echo -e "${RED}✗ Get courses failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test 6: Get Clubs
echo -e "${YELLOW}6. Testing Get Clubs...${NC}"
CLUBS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/clubs" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"})

HTTP_CODE=$(echo "$CLUBS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get clubs successful${NC}"
else
    echo -e "${RED}✗ Get clubs failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test 7: Get Events
echo -e "${YELLOW}7. Testing Get Events...${NC}"
EVENTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/events" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"})

HTTP_CODE=$(echo "$EVENTS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get events successful${NC}"
else
    echo -e "${RED}✗ Get events failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test 8: Get Notifications (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}8. Testing Get Notifications...${NC}"
    NOTIF_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/notifications" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$NOTIF_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Get notifications successful${NC}"
    else
        echo -e "${RED}✗ Get notifications failed (HTTP $HTTP_CODE)${NC}"
    fi
else
    echo -e "${YELLOW}8. Skipping notifications test (no auth token)${NC}"
fi

echo ""

# Test 9: Get Announcements
echo -e "${YELLOW}9. Testing Get Announcements...${NC}"
ANN_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/announcements" \
  ${TOKEN:+-H "Authorization: Bearer $TOKEN"})

HTTP_CODE=$(echo "$ANN_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Get announcements successful${NC}"
else
    echo -e "${RED}✗ Get announcements failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo -e "${YELLOW}=== Test Complete ===${NC}"

