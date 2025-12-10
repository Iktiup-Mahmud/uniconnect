# UniConnect - University Social Network Platform

A full-stack social media platform built with Next.js 15, Express.js, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone https://github.com/Iktiup-Mahmud/uniconnect.git
   cd uniconnect
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

#### Server Configuration

The server `.env` file has been created at `server/.env` with default values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uniconnect
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

**⚠️ Important:** 
- Change the JWT secrets to secure random strings in production
- Update `MONGODB_URI` if using MongoDB Atlas or a different MongoDB instance

#### Client Configuration

The client `.env.local` file has been created at `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Database Setup

#### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

### Running the Application

#### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
Client will run on http://localhost:3000

#### Production Mode

**Build the server:**
```bash
cd server
npm run build
npm start
```

**Build the client:**
```bash
cd client
npm run build
npm start
```

## 📁 Project Structure

```
uniconnect/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # API client and utilities
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── server/                # Express.js backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Express middlewares
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utilities
│   └── package.json
│
└── README.md
```

## 🔧 Available Scripts

### Server Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
```

### Client Scripts

```bash
npm run dev        # Start Next.js development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get post by ID
- `POST /api/v1/posts` - Create new post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post

### Health Check
- `GET /health` - Check server status

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Helmet** - Security

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet security headers
- Input validation
- Rate limiting (ready to implement)

## 📝 Environment Variables

### Required Server Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

### Optional Server Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS
- `JWT_EXPIRES_IN` - Access token expiration
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity for Atlas

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### TypeScript Errors
```bash
# Rebuild the project
cd server
npm run build
```

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Development Checklist](./CHECKLIST.md) - Development tasks
- [Server README](./server/README.md) - Backend documentation
- [Client README](./client/README.md) - Frontend documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👤 Author

**Iktiup Mahmud**
- GitHub: [@Iktiup-Mahmud](https://github.com/Iktiup-Mahmud)

---

**Happy Coding! 🚀**

