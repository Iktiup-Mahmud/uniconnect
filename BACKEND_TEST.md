# Backend Testing Guide

## Prerequisites

1. **MongoDB must be running**
   - Local MongoDB: Ensure MongoDB service is running
   - MongoDB Atlas: Update `MONGODB_URI` in `server/.env`

2. **Environment Variables**
   - Ensure `server/.env` file exists with:
     ```
     NODE_ENV=development
     PORT=5001
     MONGODB_URI=mongodb://localhost:27017/uniconnect
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:3000
     ```

3. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

## Building the Backend

```bash
cd server
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Starting the Server

### Development Mode (with hot reload)
```bash
cd server
npm run dev
```

### Production Mode
```bash
cd server
npm run build
npm start
```

The server should start on `http://localhost:5001`

## Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:5001/health
```

Expected Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-..."
}
```

### 2. User Registration
```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 4. Get Posts (Public)
```bash
curl http://localhost:5001/api/v1/posts
```

### 5. Create Post (Requires Auth)
```bash
curl -X POST http://localhost:5001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "This is my first post!"
  }'
```

### 6. Get Courses
```bash
curl http://localhost:5001/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Get Clubs
```bash
curl http://localhost:5001/api/v1/clubs
```

### 8. Get Events
```bash
curl http://localhost:5001/api/v1/events
```

### 9. Get Notifications (Requires Auth)
```bash
curl http://localhost:5001/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 10. Get Announcements
```bash
curl http://localhost:5001/api/v1/announcements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Automated Test Script

Run the automated test script:
```bash
./test-backend.sh
```

This script will test:
- Health check
- User registration
- User login
- Get posts
- Get courses
- Get clubs
- Get events
- Get notifications
- Get announcements

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh token

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/profile` - Get current user profile (auth required)
- `PATCH /api/v1/users/profile` - Update current user profile (auth required)
- `PUT /api/v1/users/:id` - Update user (auth required)
- `DELETE /api/v1/users/:id` - Delete user (auth required)

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get post by ID
- `POST /api/v1/posts` - Create post (auth required)
- `PUT /api/v1/posts/:id` - Update post (auth required)
- `DELETE /api/v1/posts/:id` - Delete post (auth required)
- `POST /api/v1/posts/:id/like` - Like/unlike post (auth required)

### Portfolios
- `GET /api/v1/portfolios/:userId` - Get portfolio by user ID
- `POST /api/v1/portfolios` - Create/update portfolio (auth required)
- `PUT /api/v1/portfolios` - Update portfolio (auth required)
- `DELETE /api/v1/portfolios` - Delete portfolio (auth required)

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID (auth required)
- `POST /api/v1/courses` - Create course (faculty/admin only)
- `POST /api/v1/courses/:id/enroll` - Enroll in course (student only)
- `POST /api/v1/courses/:id/materials` - Add course material (instructor only)
- `POST /api/v1/courses/:id/assignments` - Create assignment (instructor only)
- `POST /api/v1/courses/:courseId/assignments/:assignmentIndex/submit` - Submit assignment (student only)

### Clubs
- `GET /api/v1/clubs` - Get all clubs
- `GET /api/v1/clubs/:id` - Get club by ID
- `POST /api/v1/clubs` - Create club (club_organizer/admin only)
- `POST /api/v1/clubs/:id/join` - Join club (auth required)
- `POST /api/v1/clubs/:id/leave` - Leave club (auth required)
- `PUT /api/v1/clubs/:id` - Update club (organizer/admin only)

### Events
- `GET /api/v1/events` - Get all events
- `GET /api/v1/events/:id` - Get event by ID
- `POST /api/v1/events` - Create event (auth required)
- `POST /api/v1/events/:id/rsvp` - RSVP to event (auth required)
- `POST /api/v1/events/:id/cancel-rsvp` - Cancel RSVP (auth required)
- `PUT /api/v1/events/:id` - Update event (organizer/admin only)
- `DELETE /api/v1/events/:id` - Delete event (organizer/admin only)

### Messages
- `GET /api/v1/messages/conversations` - Get all conversations (auth required)
- `GET /api/v1/messages/conversations/:id` - Get conversation by ID (auth required)
- `POST /api/v1/messages/conversations` - Create conversation (auth required)
- `POST /api/v1/messages/conversations/:conversationId/messages` - Send message (auth required)
- `PUT /api/v1/messages/conversations/:conversationId/read` - Mark messages as read (auth required)

### Notifications
- `GET /api/v1/notifications` - Get notifications (auth required)
- `PUT /api/v1/notifications/:id/read` - Mark notification as read (auth required)
- `PUT /api/v1/notifications/read-all` - Mark all as read (auth required)
- `DELETE /api/v1/notifications/:id` - Delete notification (auth required)

### Announcements
- `GET /api/v1/announcements` - Get all announcements
- `GET /api/v1/announcements/:id` - Get announcement by ID
- `POST /api/v1/announcements` - Create announcement (auth required)
- `PUT /api/v1/announcements/:id` - Update announcement (author/admin only)
- `DELETE /api/v1/announcements/:id` - Delete announcement (author/admin only)

## Troubleshooting

### Server won't start
1. Check if MongoDB is running
2. Verify `MONGODB_URI` in `.env` is correct
3. Check if port 5001 is available: `lsof -ti:5001`

### Connection errors
- Verify MongoDB connection string
- Check network connectivity (for Atlas)
- Ensure MongoDB service is running

### Authentication errors
- Verify JWT_SECRET is set in `.env`
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

### TypeScript compilation errors
- Run `npm run build` to see detailed errors
- Check all imports are correct
- Verify all models are properly exported

## Next Steps

After verifying backend works:
1. Test all endpoints with Postman or curl
2. Create test users with different roles
3. Test role-based access control
4. Verify data persistence in MongoDB
5. Proceed to frontend development

