# UniConnect - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 15 Frontend (Port 3000)            │ │
│  │  ├── App Router (Pages & Layouts)                      │ │
│  │  ├── React Components (UI Layer)                       │ │
│  │  ├── API Client (fetch wrapper)                        │ │
│  │  ├── State Management (React hooks)                    │ │
│  │  └── Tailwind CSS (Styling)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Express.js Backend (Port 5000)                 │ │
│  │  ├── Routes (API Endpoints)                            │ │
│  │  ├── Controllers (Business Logic)                      │ │
│  │  ├── Middlewares (Auth, Validation, Error Handling)    │ │
│  │  ├── Services (Core Logic)                             │ │
│  │  └── Utils (Logger, Helpers)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   MongoDB (27017)    │    │    Redis (6379)      │      │
│  │  ├── Users           │    │  ├── Sessions        │      │
│  │  ├── Posts           │    │  ├── Cache           │      │
│  │  ├── Comments        │    │  └── Rate Limiting   │      │
│  │  └── Likes           │    └──────────────────────┘      │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Request Flow

```
User Browser
    │
    │ 1. HTTP Request
    ▼
Next.js Frontend (client/)
    │
    │ 2. API Call
    ▼
Express Backend (server/)
    │
    ├─► 3a. Authentication Middleware
    │   └─► JWT Verification
    │
    ├─► 3b. Validation Middleware
    │   └─► Request Validation
    │
    ├─► 4. Controller
    │   └─► Business Logic
    │
    ├─► 5a. MongoDB
    │   └─► Data Operations
    │
    ├─► 5b. Redis
    │   └─► Cache/Session
    │
    └─► 6. Response
        │
        ▼
    Client Receives Data
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Login Request (email, password)
       ▼
┌─────────────────────────────────────┐
│  POST /api/v1/auth/login            │
│  ┌──────────────────────────────┐   │
│  │  Auth Controller              │   │
│  │  1. Validate credentials      │   │
│  │  2. Check user exists         │   │
│  │  3. Compare password (bcrypt) │   │
│  │  4. Generate JWT tokens       │   │
│  │  5. Set refresh token cookie  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
       │
       │ 2. Response (user data + access token)
       ▼
┌─────────────┐
│   Client    │
│  Store JWT  │
└──────┬──────┘
       │
       │ 3. Subsequent requests with JWT
       ▼
┌─────────────────────────────────────┐
│  Authorization: Bearer <token>      │
│  ┌──────────────────────────────┐   │
│  │  Auth Middleware              │   │
│  │  1. Extract token             │   │
│  │  2. Verify JWT                │   │
│  │  3. Decode user info          │   │
│  │  4. Attach to request         │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
       │
       │ 4. Access protected resource
       ▼
┌─────────────┐
│  Controller │
└─────────────┘
```

## 📁 Backend Folder Structure & Flow

```
server/src/
│
├── server.ts                    # Entry point
│   ├── Initialize Express
│   ├── Apply Middlewares
│   │   ├── helmet (security)
│   │   ├── cors
│   │   ├── morgan (logging)
│   │   ├── compression
│   │   └── express.json
│   ├── Mount Routes
│   └── Error Handlers
│
├── routes/
│   ├── index.ts                 # Route aggregator
│   │   └── /api/v1/*
│   ├── auth.routes.ts
│   │   ├── POST /register
│   │   ├── POST /login
│   │   ├── POST /logout
│   │   └── POST /refresh-token
│   ├── user.routes.ts
│   │   ├── GET    /users
│   │   ├── GET    /users/:id
│   │   ├── PUT    /users/:id
│   │   └── DELETE /users/:id
│   └── post.routes.ts
│       ├── GET    /posts
│       ├── GET    /posts/:id
│       ├── POST   /posts
│       ├── PUT    /posts/:id
│       └── DELETE /posts/:id
│
├── controllers/
│   ├── auth.controller.ts       # Auth business logic
│   ├── user.controller.ts       # User CRUD logic
│   └── post.controller.ts       # Post CRUD logic
│
├── middlewares/
│   ├── errorHandler.ts          # Global error handler
│   ├── notFound.ts              # 404 handler
│   └── index.ts                 # asyncHandler, validation
│
├── models/                      # To be implemented
│   ├── User.model.ts            # User schema
│   ├── Post.model.ts            # Post schema
│   └── Comment.model.ts         # Comment schema
│
├── services/                    # To be implemented
│   ├── auth.service.ts          # Auth logic
│   ├── user.service.ts          # User logic
│   └── post.service.ts          # Post logic
│
├── utils/
│   ├── appError.ts              # Custom error class
│   └── logger.ts                # Winston logger
│
└── types/                       # To be implemented
    └── index.ts                 # TypeScript interfaces
```

## 🎨 Frontend Architecture

```
client/src/
│
├── app/                         # Next.js App Router
│   ├── layout.tsx              # Root layout
│   │   ├── HTML structure
│   │   ├── Global styles
│   │   └── Provider wrappers
│   │
│   ├── page.tsx                # Landing page
│   │   ├── Hero section
│   │   ├── Features grid
│   │   └── CTA buttons
│   │
│   ├── (auth)/                 # Auth route group (to add)
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/              # Protected routes (to add)
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   └── profile/                # Profile pages (to add)
│       └── [id]/
│
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...more
│   │
│   ├── features/               # Feature-specific (to add)
│   │   ├── auth/
│   │   ├── posts/
│   │   └── profile/
│   │
│   └── layout/                 # Layout components (to add)
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/
│   ├── api.ts                  # API client
│   │   ├── ApiClient class
│   │   ├── authAPI methods
│   │   ├── userAPI methods
│   │   └── postAPI methods
│   │
│   └── utils.ts                # Helper functions (to add)
│
└── types/
    └── index.ts                # TypeScript definitions
        ├── User interface
        ├── Post interface
        ├── Comment interface
        └── API responses
```

## 🔄 Data Flow Example: Creating a Post

```
1. User Action
   │
   └─► User clicks "Create Post" button
        │
        ▼
2. Frontend (client/src/components/CreatePost.tsx)
   │
   ├─► Validate input
   ├─► Call postAPI.create(data, token)
   │   │
   │   └─► lib/api.ts
   │       └─► POST /api/v1/posts
   │
   ▼
3. Backend Route (server/src/routes/post.routes.ts)
   │
   └─► router.post('/', asyncHandler(postController.createPost))
        │
        ▼
4. Middleware Chain
   │
   ├─► authMiddleware (verify JWT)
   ├─► validateRequest (check data)
   └─► Continue to controller
        │
        ▼
5. Controller (server/src/controllers/post.controller.ts)
   │
   ├─► Extract data from req.body
   ├─► Call postService.create(data)
   │   │
   │   └─► Service Layer (to implement)
   │       └─► Business logic
   │
   └─► Return response
        │
        ▼
6. Service Layer (server/src/services/post.service.ts)
   │
   ├─► Create post object
   ├─► Save to MongoDB
   ├─► Cache in Redis (optional)
   └─► Return post data
        │
        ▼
7. Database (MongoDB)
   │
   └─► posts collection
       └─► Insert document
            │
            ▼
8. Response Flow
   │
   ├─► Service → Controller
   ├─► Controller → Route
   ├─► Route → Client
   └─► Client updates UI
        │
        ▼
9. UI Update
   │
   └─► Display new post in feed
```

## 🔧 Middleware Stack

```
Request
   │
   ▼
┌──────────────────┐
│  helmet()        │ Security headers
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  cors()          │ CORS handling
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  morgan()        │ HTTP logging
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  compression()   │ Response compression
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  express.json()  │ Parse JSON body
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  rateLimit()     │ Rate limiting (optional)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Routes          │ API endpoints
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  notFound()      │ 404 handler
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  errorHandler()  │ Error handling
└────────┬─────────┘
         │
         ▼
      Response
```

## 🐳 Docker Architecture

```
Docker Compose
│
├── MongoDB Container (Port 27017)
│   ├── Volume: mongodb_data
│   └── Network: uniconnect-network
│
├── Redis Container (Port 6379)
│   ├── Volume: redis_data
│   └── Network: uniconnect-network
│
├── Backend Container (Port 5000)
│   ├── Depends on: MongoDB, Redis
│   ├── Volume: ./server/logs
│   └── Network: uniconnect-network
│
└── Frontend Container (Port 3000)
    ├── Depends on: Backend
    └── Network: uniconnect-network
```

## 📈 Scalability Considerations

### Horizontal Scaling

```
Load Balancer
      │
      ├─► Backend Instance 1
      ├─► Backend Instance 2
      └─► Backend Instance 3
              │
              ▼
         MongoDB Replica Set
         Redis Cluster
```

### Caching Strategy

```
Request
   │
   ▼
Check Redis Cache
   │
   ├─► Cache Hit
   │   └─► Return cached data
   │
   └─► Cache Miss
       └─► Query MongoDB
           └─► Cache result
               └─► Return data
```

## 🔐 Security Layers

```
1. Network Layer
   └─► HTTPS/TLS
   └─► Firewall rules

2. Application Layer
   └─► Helmet (security headers)
   └─► CORS configuration
   └─► Rate limiting
   └─► Input validation

3. Authentication Layer
   └─► JWT tokens
   └─► Refresh tokens
   └─► Token blacklisting

4. Data Layer
   └─► Password hashing (bcrypt)
   └─► Encrypted connections
   └─► Database access control
```

## 📊 Monitoring & Logging

```
Application
   │
   ├─► Winston Logger
   │   ├─► Console transport
   │   ├─► File transport (logs/error.log)
   │   └─► File transport (logs/all.log)
   │
   └─► Error Tracking
       └─► Custom AppError class
       └─► Error middleware
       └─► Structured logging
```

---

This architecture provides a solid foundation for a production-ready social media platform with room for growth and scaling.
