# UniConnect System Architecture

## Overview

UniConnect is a full-stack university social networking platform built with a modern tech stack featuring a Next.js client, Express.js server, and MongoDB database with real-time capabilities via Socket.io.

---

## Table of Contents

1. [System Architecture Diagram](#system-architecture-diagram)
2. [Entity Relationship (ER) Diagram](#entity-relationship-er-diagram)
3. [Database Schema Reference](#database-schema-reference)
4. [Data Flow Diagrams (DFD)](#data-flow-diagrams-dfd)
5. [UML Diagrams](#uml-diagrams)
6. [Interaction Diagrams](#interaction-diagrams)
7. [Detailed Component Architecture](#detailed-component-architecture)
8. [Security Architecture](#security-architecture)
9. [Performance Optimizations](#performance-optimizations)

---

## Entity Relationship (ER) Diagram

### Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UNICONNECT DATABASE SCHEMA                        │
│                              MongoDB Collections                            │
└─────────────────────────────────────────────────────────────────────────────┘


                                    ┌──────────────────┐
                                    │      USER        │
                                    ├──────────────────┤
                                    │ _id (PK)         │
                                    │ name             │
                                    │ email (UNIQUE)   │
                                    │ password (HASH)  │
                                    │ username (UNIQUE)│
                                    │ avatar           │
                                    │ bio              │
                                    │ role (ENUM)      │
                                    │ followers []     │◄───────┐
                                    │ following []     │◄───────┤
                                    │ isEmailVerified  │        │
                                    │ createdAt        │        │ Self-referencing
                                    │ updatedAt        │        │ Many-to-Many
                                    └──────────────────┘        │
                                            │                   │
                     ┌──────────────────────┼───────────────────┘
                     │                      │
                     │                      │ 1:N (author)
                     │                      │
         ┌───────────┼──────────────────────┼────────────────────────────┐
         │           │                      │                            │
         │           │                      │                            │
         │ 1:N       │ 1:N                  │                            │ 1:N
         │(userId)   │(author)              │                            │(organizer)
         │           │                      │                            │
         ▼           ▼                      ▼                            ▼
┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐  ┌──────────────────┐
│   PORTFOLIO    │ │      POST        │ │   ANNOUNCEMENT   │  │      CLUB        │
├────────────────┤ ├──────────────────┤ ├──────────────────┤  ├──────────────────┤
│ _id (PK)       │ │ _id (PK)         │ │ _id (PK)         │  │ _id (PK)         │
│ userId (FK)    │ │ author (FK)      │ │ title            │  │ name (UNIQUE)    │
│ title          │ │ content          │ │ content          │  │ description      │
│ description    │ │ images []        │ │ author (FK)      │  │ organizer (FK)   │
│ projects []    │ │ likes [] (FK)    │ │ targetAudience   │  │ members [] (FK)  │◄──┐
│ achievements[] │ │ comments [] (FK) │ │ courseId (FK)    │  │ events [] (FK)   │   │
│ skills []      │ │ createdAt        │ │ clubId (FK)      │  │ imageUrl         │   │
│ education []   │ │ updatedAt        │ │ isPinned         │  │ category         │   │
│ certifications│ └──────────────────┘ │ attachments []   │  │ isActive         │   │
│ isPublic       │          │          │ createdAt        │  │ createdAt        │   │
│ createdAt      │          │          │ updatedAt        │  │ updatedAt        │   │
│ updatedAt      │          │ 1:N      └──────────────────┘  └──────────────────┘   │
└────────────────┘          │(postId)                                  │             │
                            │                                          │ 1:N         │
                            ▼                                          │(clubId)     │
                   ┌──────────────────┐                               │             │
                   │     COMMENT      │                               ▼             │
                   ├──────────────────┤                    ┌──────────────────┐    │
                   │ _id (PK)         │                    │      EVENT       │    │
                   │ postId (FK)      │                    ├──────────────────┤    │
                   │ userId (FK)      │                    │ _id (PK)         │    │
                   │ content          │                    │ title            │    │
                   │ likes [] (FK)    │                    │ description      │    │
                   │ createdAt        │                    │ organizer (FK)   │    │
                   │ updatedAt        │                    │ clubId (FK)      │────┘
                   └──────────────────┘                    │ courseId (FK)    │─┐
                                                            │ eventDate        │ │
                                                            │ location         │ │
                                                            │ imageUrl         │ │
         ┌──────────────────────────────────────────────   │ attendees [] (FK)│ │
         │                                                  │ maxAttendees     │ │
         │ 1:N (instructor)                                │ isPublic         │ │
         │                                                  │ category         │ │
         ▼                                                  │ createdAt        │ │
┌──────────────────┐                                       │ updatedAt        │ │
│     COURSE       │                                       └──────────────────┘ │
├──────────────────┤                                                            │
│ _id (PK)         │                                                            │
│ code (UNIQUE)    │                                                            │ 1:N
│ name             │                                                            │(courseId)
│ description      │                                                            │
│ instructor (FK)  │                                                            │
│ students [] (FK) │◄───────────────────────────────────────────────────────────┘
│ materials []     │
│ announcements [] │
│ assignments []   │
│ semester         │
│ year             │
│ createdAt        │
│ updatedAt        │
└──────────────────┘


         ┌──────────────────────── USER (sender/receiver) ──────────────────────┐
         │                                                                       │
         │ 1:N (participants)                           1:N (sender)            │
         │                                                                       │
         ▼                                                                       │
┌──────────────────┐         1:N (conversationId)           ┌──────────────────┐│
│  CONVERSATION    │────────────────────────────────────────>│     MESSAGE      ││
├──────────────────┤                                         ├──────────────────┤│
│ _id (PK)         │◄────────────────────────────────────────│ _id (PK)         ││
│ participants[]   │         1:1 (lastMessage)              │ conversationId   ││
│   (FK)           │                                         │   (FK)           ││
│ type (ENUM)      │                                         │ senderId (FK)    │┘
│ groupName        │                                         │ content          │
│ groupImage       │                                         │ messageType      │
│ lastMessage (FK) │                                         │ fileUrl          │
│ lastMessageAt    │                                         │ isRead           │
│ createdAt        │                                         │ readAt           │
│ updatedAt        │                                         │ createdAt        │
└──────────────────┘                                         │ updatedAt        │
                                                              └──────────────────┘


         ┌──────────────────────── USER (recipient) ────────────────────────────┐
         │                                                                       │
         │ 1:N (userId)                                                          │
         │                                                                       │
         ▼                                                                       │
┌──────────────────┐                                                            │
│  NOTIFICATION    │                                                            │
├──────────────────┤                                                            │
│ _id (PK)         │                                                            │
│ userId (FK)      │                                                            │
│ type (ENUM)      │   Polymorphic References:                                 │
│ title            │   ┌─────────────────────────────────────────────┐         │
│ message          │   │ relatedId + relatedType can reference:      │         │
│ relatedId (FK)   │───┤ • Post (_id)                                 │         │
│ relatedType      │   │ • Event (_id)                                │         │
│ isRead           │   │ • Club (_id)                                 │         │
│ readAt           │   │ • Course (_id)                               │         │
│ createdAt        │   │ • Message (_id)                              │         │
│ updatedAt        │   │ • User (_id)                                 │         │
└──────────────────┘   └─────────────────────────────────────────────┘         │
                                                                                 │
                                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Relationship Types Legend

| Symbol | Meaning      | Example                       |
| ------ | ------------ | ----------------------------- |
| `1:1`  | One-to-One   | User ↔ Portfolio              |
| `1:N`  | One-to-Many  | User → Posts                  |
| `N:M`  | Many-to-Many | User ↔ Followers/Following    |
| `FK`   | Foreign Key  | References another collection |
| `PK`   | Primary Key  | MongoDB \_id field            |
| `[]`   | Array Field  | Multiple values stored        |

---

### Detailed Entity Relationships

#### 1. **USER Entity** (Central Hub)

**Relationships:**

- **Self-referencing Many-to-Many**: `followers[]` and `following[]` (User ↔ User)
- **One-to-One**: `User → Portfolio` (userId is unique in Portfolio)
- **One-to-Many**: `User → Posts` (author)
- **One-to-Many**: `User → Comments` (userId)
- **One-to-Many**: `User → Clubs` (organizer)
- **One-to-Many**: `User → Events` (organizer)
- **One-to-Many**: `User → Courses` (instructor)
- **One-to-Many**: `User → Announcements` (author)
- **One-to-Many**: `User → Messages` (senderId)
- **One-to-Many**: `User → Notifications` (userId)
- **Many-to-Many**: `User ↔ Clubs` (members)
- **Many-to-Many**: `User ↔ Events` (attendees)
- **Many-to-Many**: `User ↔ Courses` (students)
- **Many-to-Many**: `User ↔ Conversations` (participants)
- **Many-to-Many**: `User ↔ Posts` (likes)
- **Many-to-Many**: `User ↔ Comments` (likes)

---

#### 2. **POST Entity**

**Relationships:**

- **Many-to-One**: `Post → User` (author)
- **One-to-Many**: `Post → Comments` (postId)
- **Many-to-Many**: `Post ↔ Users` (likes array)

**Business Rules:**

- Each post must have an author
- Posts can have 0 to many comments
- Posts can have 0 to many likes
- Comments array stores references to Comment documents

---

#### 3. **COMMENT Entity**

**Relationships:**

- **Many-to-One**: `Comment → Post` (postId)
- **Many-to-One**: `Comment → User` (userId)
- **Many-to-Many**: `Comment ↔ Users` (likes array)

**Business Rules:**

- Each comment must belong to a post
- Each comment must have an author (userId)
- Comments can receive likes from multiple users

---

#### 4. **PORTFOLIO Entity**

**Relationships:**

- **One-to-One**: `Portfolio → User` (userId is unique)

**Business Rules:**

- Each user can have only one portfolio
- Portfolio is optional (not all users have one)
- Contains embedded documents (projects, education, certifications)

---

#### 5. **COURSE Entity**

**Relationships:**

- **Many-to-One**: `Course → User` (instructor - must be faculty role)
- **Many-to-Many**: `Course ↔ Users` (students array)
- **One-to-Many**: `Course ← Events` (courseId optional reference)
- **One-to-Many**: `Course ← Announcements` (courseId optional reference)

**Business Rules:**

- Each course must have one instructor (faculty role required)
- Courses can have multiple enrolled students
- Course code must be unique
- Contains embedded documents (materials, assignments with submissions)

---

#### 6. **CLUB Entity**

**Relationships:**

- **Many-to-One**: `Club → User` (organizer)
- **Many-to-Many**: `Club ↔ Users` (members array)
- **One-to-Many**: `Club → Events` (clubId reference in Event)
- **One-to-Many**: `Club ← Announcements` (clubId optional reference)

**Business Rules:**

- Each club must have one organizer
- Clubs can have multiple members
- Club name must be unique
- Both students and faculty can create clubs

---

#### 7. **EVENT Entity**

**Relationships:**

- **Many-to-One**: `Event → User` (organizer)
- **Many-to-One**: `Event → Club` (clubId - optional)
- **Many-to-One**: `Event → Course` (courseId - optional)
- **Many-to-Many**: `Event ↔ Users` (attendees array)

**Business Rules:**

- Each event must have an organizer
- Events can be associated with a club OR course (or neither)
- Events track attendees who RSVP
- Events can have maximum attendee limits

---

#### 8. **CONVERSATION Entity**

**Relationships:**

- **Many-to-Many**: `Conversation ↔ Users` (participants array)
- **One-to-Many**: `Conversation → Messages` (conversationId)
- **One-to-One**: `Conversation → Message` (lastMessage reference)

**Business Rules:**

- Direct conversations: exactly 2 participants
- Group conversations: 2+ participants
- Tracks last message for quick preview
- Updates lastMessageAt timestamp automatically

---

#### 9. **MESSAGE Entity**

**Relationships:**

- **Many-to-One**: `Message → Conversation` (conversationId)
- **Many-to-One**: `Message → User` (senderId)

**Business Rules:**

- Each message belongs to one conversation
- Each message has one sender
- Tracks read status and read timestamp
- Supports text, image, and file types

---

#### 10. **NOTIFICATION Entity**

**Relationships:**

- **Many-to-One**: `Notification → User` (userId - recipient)
- **Polymorphic Reference**: `relatedId + relatedType` can point to:
  - Post (for likes/comments)
  - Event (for invites)
  - Club (for invites)
  - Course (for announcements)
  - Message (for new messages)
  - User (for follows)

**Business Rules:**

- Each notification has one recipient
- Notifications track read status
- Type determines the notification category
- relatedId provides context link

---

#### 11. **ANNOUNCEMENT Entity**

**Relationships:**

- **Many-to-One**: `Announcement → User` (author)
- **Many-to-One**: `Announcement → Course` (courseId - optional)
- **Many-to-One**: `Announcement → Club` (clubId - optional)

**Business Rules:**

- Each announcement must have an author
- Can be associated with a course OR club
- Target audience determines who sees it
- Can be pinned for priority display

---

### Database Indexes for Performance

```typescript
// USER
-email(unique) -
  username(unique) -
  // POST
  { author: 1, createdAt: -1 } - // User's posts sorted by date
  { createdAt: -1 } - // Global feed
  // COMMENT
  { postId: 1, createdAt: -1 } - // Comments for a post
  // CLUB
  { organizer: 1 } -
  { category: 1 } -
  { isActive: 1 } -
  // EVENT
  { organizer: 1 } -
  { clubId: 1 } -
  { eventDate: 1 } -
  { isPublic: 1 } -
  // COURSE
  { instructor: 1 } -
  { code: 1 }(unique) -
  // MESSAGE
  { conversationId: 1, createdAt: -1 } - // Messages in conversation
  { senderId: 1 } -
  // CONVERSATION
  { participants: 1 } -
  { type: 1 } -
  { lastMessageAt: -1 } -
  // NOTIFICATION
  { userId: 1, createdAt: -1 } - // User's notifications
  { isRead: 1 } -
  // PORTFOLIO
  { userId: 1 }(unique) -
  // ANNOUNCEMENT
  { author: 1 } -
  { courseId: 1 } -
  { clubId: 1 } -
  { isPinned: 1 };
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                              │
│                          (Next.js 16 + React 19 + TypeScript)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          │                       │
                     HTTP/REST                WebSocket
                     (HTTPS)                (Socket.io Client)
                          │                       │
                          ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                             │
│                        (Express.js + Node.js + TypeScript)                 │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         HTTP SERVER                                │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  Middleware Stack:                                           │  │    │
│  │  │  • CORS (Cross-Origin Resource Sharing)                       │  │   │
│  │  │  • Helmet (Security Headers)                                  │  │   │
│  │  │  • Compression (Response Compression)                         │  │   │
│  │  │  • Morgan + Winston (Logging)                                 │  │   │
│  │  │  • Body Parser (JSON/URL-encoded)                             │  │   │
│  │  │  • JWT Authentication Middleware                              │  │   │
│  │  │  • Multer (Multipart/Form-data for file uploads)              │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  RESTful API Routes (/api/v1):                                │  │   │
│  │  │  • /auth          - Authentication (login, register, logout)  │  │   │
│  │  │  • /users         - User management & profiles                │  │   │
│  │  │  • /posts         - Social posts & feed                       │  │   │
│  │  │  • /comments      - Post comments & replies                   │  │   │
│  │  │  • /portfolios    - Student portfolios                        │  │   │
│  │  │  • /courses       - Course listings & management              │  │   │
│  │  │  • /clubs         - Club creation & management                │  │   │
│  │  │  • /events        - Event creation & RSVP                     │  │   │
│  │  │  • /messages      - Direct messaging & conversations          │  │   │
│  │  │  • /notifications - User notifications                        │  │   │
│  │  │  • /announcements - Admin/Club announcements                  │  │   │
│  │  │  • /upload        - File upload handling                      │  │   │
│  │  └──────────────────────────────────────────────────────────────-┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │  Controllers:                                                │   │   │
│  │  │  Business logic for each resource domain                     │   │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    SOCKET.IO SERVER                                 │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  Real-time Features:                                          │  │   │
│  │  │  • JWT Authentication for WebSocket connections              │  │   │
│  │  │  • User online/offline status tracking                       │  │   │
│  │  │  • Real-time messaging (1-on-1 & group conversations)        │  │   │
│  │  │  • Live notifications                                         │  │   │
│  │  │  • Typing indicators                                          │  │   │
│  │  │  • Message read receipts                                      │  │   │
│  │  │  • Room-based communication (conversations)                   │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────┬───────────────────────────────┬──────────────┘
                               │                               │
                               ▼                               ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────┐
│          DATABASE LAYER                  │   │    EXTERNAL SERVICES       │
│         (MongoDB + Mongoose)             │   │                            │
│                                          │   │  ┌──────────────────────┐ │
│  ┌────────────────────────────────────┐ │   │  │ Cloudinary CDN       │ │
│  │  Collections:                       │ │   │  │ • Image uploads      │ │
│  │  • users          - User accounts   │ │   │  │ • Video uploads      │ │
│  │  • posts          - Social posts    │ │   │  │ • Media optimization │ │
│  │  • comments       - Post comments   │ │   │  │ • Transformation API │ │
│  │  • portfolios     - Student work    │ │   │  └──────────────────────┘ │
│  │  • courses        - Course catalog  │ │   │                            │
│  │  • clubs          - Student clubs   │ │   └────────────────────────────┘
│  │  • events         - Campus events   │ │
│  │  • messages       - Chat messages   │ │
│  │  • conversations  - Chat threads    │ │
│  │  • notifications  - User alerts     │ │
│  │  • announcements  - Admin posts     │ │
│  │                                      │ │
│  │  Features:                           │ │
│  │  • Schema validation                 │ │
│  │  • Relationships (refs & populate)   │ │
│  │  • Indexes for performance           │ │
│  │  • Timestamps (createdAt/updatedAt) │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

---

## Detailed Component Architecture

### 1. **Client Layer (Frontend)**

#### Technology Stack:

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Radix UI Components
- **State Management**: React Hooks + Local Storage
- **Real-time**: Socket.io Client v4.7.2
- **HTTP Client**: Fetch API with custom wrapper

#### Key Features:

- **Server-Side Rendering (SSR)** via Next.js App Router
- **Client-Side Routing** with dynamic routes
- **Authentication**: JWT token storage in localStorage
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Light/Dark mode with next-themes

#### Page Structure:

```
/                   → Landing page
/register           → User registration
/login              → User authentication
/dashboard          → User dashboard
/profile/:id        → User profiles
/portfolio/:id      → Student portfolios
/courses            → Course listings
/clubs              → Club directory
/events             → Event calendar
/messages           → Real-time messaging
/notifications      → Notification center
/search             → Global search
/settings           → User settings
/admin              → Admin dashboard
```

#### API Integration (`/client/src/lib/api.ts`):

- Centralized API client with consistent error handling
- Automatic token injection for authenticated requests
- Response transformation (backend format → frontend format)
- Type-safe API calls with TypeScript interfaces

---

### 2. **Application Layer (Backend)**

#### Technology Stack:

- **Runtime**: Node.js
- **Framework**: Express.js v4.18
- **Language**: TypeScript v5.3
- **Real-time**: Socket.io v4.8
- **Authentication**: JWT (jsonwebtoken v9.0)
- **Password Hashing**: bcrypt v5.1
- **Validation**: express-validator v7.0
- **File Upload**: Multer v1.4
- **Logging**: Winston v3.11 + Morgan v1.10

#### Middleware Pipeline:

```
Request → CORS → Helmet → Compression → Morgan → Body Parser
    → JWT Auth (protected routes) → Route Handler → Response
```

1. **CORS**: Allows cross-origin requests from frontend
2. **Helmet**: Sets security HTTP headers
3. **Compression**: Compresses response bodies
4. **Morgan + Winston**: HTTP request logging
5. **Body Parser**: Parses JSON and URL-encoded bodies
6. **JWT Auth**: Validates JWT tokens on protected routes
7. **Multer**: Handles multipart/form-data for file uploads

#### API Endpoints Overview:

| Route                        | Description         | Auth Required |
| ---------------------------- | ------------------- | ------------- |
| `POST /api/v1/auth/register` | User registration   | No            |
| `POST /api/v1/auth/login`    | User login          | No            |
| `POST /api/v1/auth/logout`   | User logout         | Yes           |
| `GET /api/v1/users`          | Get all users       | Yes           |
| `GET /api/v1/users/:id`      | Get user profile    | Yes           |
| `PUT /api/v1/users/:id`      | Update user profile | Yes           |
| `GET /api/v1/posts`          | Get posts feed      | Yes           |
| `POST /api/v1/posts`         | Create post         | Yes           |
| `GET /api/v1/posts/:id`      | Get single post     | Yes           |
| `PUT /api/v1/posts/:id`      | Update post         | Yes           |
| `DELETE /api/v1/posts/:id`   | Delete post         | Yes           |
| `POST /api/v1/comments`      | Create comment      | Yes           |
| `GET /api/v1/portfolios`     | Get portfolios      | Yes           |
| `POST /api/v1/portfolios`    | Create portfolio    | Yes           |
| `GET /api/v1/courses`        | Get courses         | Yes           |
| `POST /api/v1/courses`       | Create course       | Yes (Faculty) |
| `GET /api/v1/clubs`          | Get clubs           | Yes           |
| `POST /api/v1/clubs`         | Create club         | Yes           |
| `GET /api/v1/events`         | Get events          | Yes           |
| `POST /api/v1/events`        | Create event        | Yes           |
| `GET /api/v1/messages`       | Get conversations   | Yes           |
| `POST /api/v1/messages`      | Send message        | Yes           |
| `GET /api/v1/notifications`  | Get notifications   | Yes           |
| `GET /api/v1/announcements`  | Get announcements   | Yes           |
| `POST /api/v1/announcements` | Create announcement | Yes (Admin)   |
| `POST /api/v1/upload/image`  | Upload image        | Yes           |
| `POST /api/v1/upload/video`  | Upload video        | Yes           |

#### Authentication Flow:

```
1. User Registration/Login
   ├─> POST /api/v1/auth/register or /login
   ├─> Server validates credentials
   ├─> Server generates JWT token with userId
   └─> Returns token + user data

2. Authenticated Requests
   ├─> Client includes: Authorization: Bearer <token>
   ├─> authenticate middleware extracts token
   ├─> JWT verified using JWT_SECRET
   ├─> User fetched from database (without password)
   ├─> User attached to req.user
   └─> Request proceeds to controller

3. Role-Based Authorization
   ├─> Additional middleware checks user.role
   ├─> Roles: student, faculty, admin
   └─> Allows/denies access based on role
```

#### Socket.io Real-time Communication:

```
Connection Flow:
1. Client connects with JWT token in auth payload
2. Server validates token in middleware
3. User ID extracted and attached to socket
4. Socket joins user-specific room (userId)
5. Online users tracked in Map

Events:
• connection          - New client connects
• disconnect          - Client disconnects
• user:online         - Broadcast user online status
• user:offline        - Broadcast user offline status
• join:conversation   - Join conversation room
• leave:conversation  - Leave conversation room
• message:send        - Send message in conversation
• message:receive     - Receive message from conversation
• typing:start        - Typing indicator start
• typing:stop         - Typing indicator stop
• notification:new    - New notification for user
```

---

### 3. **Database Layer**

#### Technology Stack:

- **Database**: MongoDB (NoSQL Document Database)
- **ODM**: Mongoose v8.20 (Object Data Modeling)
- **Connection**: Native MongoDB driver via Mongoose

#### Schema Models:

##### **User Model**

```typescript
{
  name: String (required)
  email: String (required, unique, lowercase)
  password: String (required, hashed)
  role: Enum ['student', 'faculty'] (required)
  department: String
  bio: String
  profilePicture: String
  coverPicture: String
  interests: [String]
  skills: [String]
  following: [ObjectId → User]
  followers: [ObjectId → User]
  createdAt: Date
  updatedAt: Date
}
```

##### **Post Model**

```typescript
{
  author: ObjectId → User (required)
  content: String (required)
  images: [String]
  videos: [String]
  likes: [ObjectId → User]
  likesCount: Number
  commentsCount: Number
  visibility: Enum ['public', 'followers', 'private']
  createdAt: Date
  updatedAt: Date
}
```

##### **Comment Model**

```typescript
{
  post: ObjectId → Post (required)
  author: ObjectId → User (required)
  content: String (required)
  parentComment: ObjectId → Comment (for replies)
  likes: [ObjectId → User]
  createdAt: Date
  updatedAt: Date
}
```

##### **Portfolio Model**

```typescript
{
  user: ObjectId → User (required, unique)
  title: String (required)
  description: String
  projects: [{
    title: String
    description: String
    techStack: [String]
    githubUrl: String
    liveUrl: String
    images: [String]
  }]
  education: [{
    institution: String
    degree: String
    field: String
    startDate: Date
    endDate: Date
  }]
  experience: [{
    company: String
    position: String
    description: String
    startDate: Date
    endDate: Date
  }]
  certifications: [{
    title: String
    issuer: String
    date: Date
    url: String
  }]
  createdAt: Date
  updatedAt: Date
}
```

##### **Course Model**

```typescript
{
  title: String (required)
  code: String (required, unique)
  description: String (required)
  instructor: ObjectId → User (required)
  department: String
  credits: Number
  semester: String
  enrolledStudents: [ObjectId → User]
  syllabus: String
  schedule: String
  createdAt: Date
  updatedAt: Date
}
```

##### **Club Model**

```typescript
{
  name: String (required, unique)
  description: String (required)
  category: String
  president: ObjectId → User (required)
  organizers: [ObjectId → User]
  members: [ObjectId → User]
  coverImage: String
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}
```

##### **Event Model**

```typescript
{
  title: String (required)
  description: String (required)
  organizer: ObjectId → User (required)
  club: ObjectId → Club
  startDate: Date (required)
  endDate: Date (required)
  location: String (required)
  imageUrl: String
  attendees: [ObjectId → User]
  maxAttendees: Number
  isPublic: Boolean
  createdAt: Date
  updatedAt: Date
}
```

##### **Message Model**

```typescript
{
  conversation: ObjectId → Conversation (required)
  sender: ObjectId → User (required)
  content: String (required)
  attachments: [String]
  readBy: [ObjectId → User]
  createdAt: Date
  updatedAt: Date
}
```

##### **Conversation Model**

```typescript
{
  participants: [ObjectId → User] (required)
  lastMessage: ObjectId → Message
  isGroup: Boolean
  groupName: String
  groupIcon: String
  createdAt: Date
  updatedAt: Date
}
```

##### **Notification Model**

```typescript
{
  recipient: ObjectId → User (required)
  sender: ObjectId → User
  type: Enum ['like', 'comment', 'follow', 'message', 'event', 'announcement']
  title: String (required)
  message: String (required)
  link: String
  read: Boolean
  createdAt: Date
  updatedAt: Date
}
```

##### **Announcement Model**

```typescript
{
  title: String (required)
  content: String (required)
  author: ObjectId → User (required)
  club: ObjectId → Club
  targetAudience: Enum ['all', 'students', 'faculty']
  isPinned: Boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
```

#### Database Features:

- **Indexes**: Optimized queries on frequently accessed fields (email, code, etc.)
- **Relationships**: Referenced documents with populate() for joins
- **Validation**: Schema-level validation rules
- **Middleware**: Pre-save hooks for password hashing, timestamp updates
- **Virtual Fields**: Computed properties (e.g., fullName)
- **Timestamps**: Automatic createdAt and updatedAt

---

### 4. **External Services**

#### Cloudinary (Media Management)

- **Purpose**: Cloud-based media storage and CDN
- **Features**:
  - Image upload and storage
  - Video upload and storage
  - Automatic format optimization
  - On-the-fly image transformations
  - Responsive image delivery
  - Video transcoding

**Upload Flow**:

```
1. Client uploads file via /api/v1/upload/image or /video
2. Multer middleware intercepts file (memory storage)
3. File validated (type, size)
4. Server streams file to Cloudinary
5. Cloudinary returns secure URL
6. URL stored in database
7. URL returned to client for display
```

---

## Data Flow Diagrams

### Request Flow (REST API):

```
┌─────────┐     1. HTTP Request      ┌─────────────┐
│ Client  │ ────────────────────────>│   Express   │
│         │      (Authorization)     │   Server    │
└─────────┘                          └─────────────┘
                                             │
                                    2. JWT Validation
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │ Auth Middleware│
                                     └───────────────┘
                                             │
                                    3. Extract User
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │  Controller   │
                                     └───────────────┘
                                             │
                                    4. Business Logic
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │   Mongoose    │
                                     │     Model     │
                                     └───────────────┘
                                             │
                                    5. Database Query
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │   MongoDB     │
                                     └───────────────┘
                                             │
                                    6. Query Results
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │   Response    │
                                     └───────────────┘
                                             │
                                    7. JSON Response
                                             │
                                             ▼
┌─────────┐     8. Display Data     ┌─────────────┐
│ Client  │ <───────────────────────│   Express   │
│   UI    │                         │   Server    │
└─────────┘                         └─────────────┘
```

### Real-time Message Flow:

```
┌──────────┐                      ┌──────────────┐                      ┌──────────┐
│ User A   │                      │  Socket.io   │                      │ User B   │
│ Client   │                      │   Server     │                      │ Client   │
└──────────┘                      └──────────────┘                      └──────────┘
     │                                    │                                    │
     │ 1. Connect (JWT)                   │                                    │
     ├───────────────────────────────────>│                                    │
     │                                    │ 2. Validate & Store Socket         │
     │                                    │                                    │
     │ 3. Join Conversation Room          │                                    │
     ├───────────────────────────────────>│                                    │
     │                                    │                                    │
     │ 4. Emit "message:send"             │                                    │
     ├───────────────────────────────────>│                                    │
     │                                    │ 5. Save to MongoDB                 │
     │                                    │                                    │
     │                                    │ 6. Emit "message:receive" to room  │
     │                                    ├───────────────────────────────────>│
     │                                    │                                    │
     │ 7. Receive confirmation            │                                    │
     │<───────────────────────────────────┤                                    │
     │                                    │ 8. User B receives message         │
     │                                    │                                    │
```

### File Upload Flow:

```
┌─────────┐                 ┌─────────────┐                 ┌─────────────┐
│ Client  │                 │   Express   │                 │ Cloudinary  │
│         │                 │   Server    │                 │    CDN      │
└─────────┘                 └─────────────┘                 └─────────────┘
     │                             │                               │
     │ 1. Select File              │                               │
     │                             │                               │
     │ 2. POST /upload/image       │                               │
     ├────────────────────────────>│                               │
     │    (multipart/form-data)    │                               │
     │                             │ 3. Multer parses file         │
     │                             │    (in memory)                │
     │                             │                               │
     │                             │ 4. Upload to Cloudinary       │
     │                             ├──────────────────────────────>│
     │                             │                               │
     │                             │ 5. Return secure URL          │
     │                             │<──────────────────────────────┤
     │                             │                               │
     │                             │ 6. Save URL to MongoDB        │
     │                             │                               │
     │ 7. Return URL to client     │                               │
     │<────────────────────────────┤                               │
     │                             │                               │
     │ 8. Display image from CDN   │                               │
     ├─────────────────────────────────────────────────────────────>│
     │                             │                               │
```

---

## Security Architecture

### Authentication & Authorization:

1. **Password Security**:

   - Passwords hashed using bcrypt (salt rounds: 10)
   - Never stored in plain text
   - Password validation on registration

2. **JWT Token Security**:

   - Tokens signed with JWT_SECRET
   - Payload: `{ userId: string }`
   - Token stored in client localStorage
   - Token sent in Authorization header
   - Server validates token on protected routes

3. **Role-Based Access Control (RBAC)**:

   - Roles: `student`, `faculty`
   - Role checked in authorization middleware
   - Specific routes restricted by role:
     - Faculty can create courses
     - Any authenticated user can create clubs
     - Admin can create announcements

4. **HTTP Security Headers** (via Helmet):

   - Content-Security-Policy
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Strict-Transport-Security

5. **CORS Configuration**:

   - Whitelist: CLIENT_URL only
   - Credentials enabled for cookie support
   - Preflight requests handled

6. **Input Validation**:
   - express-validator for request validation
   - Schema validation via Mongoose
   - File type validation for uploads
   - File size limits enforced

---

## Performance Optimizations

1. **Database**:

   - Indexed fields for faster queries
   - Lean queries when full documents not needed
   - Pagination for large result sets
   - Connection pooling

2. **API**:

   - Response compression via compression middleware
   - HTTP caching headers
   - Efficient Mongoose queries with select()
   - Populate only required fields

3. **Real-time**:

   - Room-based Socket.io for targeted broadcasts
   - Message batching for bulk operations
   - Connection state management

4. **Media**:

   - Cloudinary CDN for fast delivery
   - Image optimization and transformation
   - Lazy loading on frontend
   - Responsive images

5. **Monitoring**:
   - Winston logger with log levels
   - HTTP request logging with Morgan
   - Error tracking and reporting

---

## Deployment Architecture

### Development:

```
Client:  http://localhost:3000 (Next.js dev server)
Server:  http://localhost:5001 (Nodemon)
DB:      MongoDB Atlas or Local MongoDB
```

### Production:

```
Client:  Vercel (Next.js optimized hosting)
Server:  Render / Railway / Heroku (Node.js hosting)
DB:      MongoDB Atlas (managed MongoDB)
CDN:     Cloudinary (media hosting)
```

---

## Technology Summary

| Layer        | Technology       | Version | Purpose                  |
| ------------ | ---------------- | ------- | ------------------------ |
| **Frontend** | Next.js          | 16.1    | React framework with SSR |
|              | React            | 19.2    | UI library               |
|              | TypeScript       | 5.x     | Type safety              |
|              | TailwindCSS      | 4.x     | Styling                  |
|              | Socket.io Client | 4.7     | Real-time communication  |
| **Backend**  | Node.js          | 20.x    | Runtime environment      |
|              | Express.js       | 4.18    | Web framework            |
|              | TypeScript       | 5.3     | Type safety              |
|              | Socket.io        | 4.8     | Real-time server         |
|              | JWT              | 9.0     | Authentication           |
|              | bcrypt           | 5.1     | Password hashing         |
|              | Multer           | 1.4     | File uploads             |
|              | Winston          | 3.11    | Logging                  |
| **Database** | MongoDB          | Latest  | NoSQL database           |
|              | Mongoose         | 8.20    | ODM                      |
| **External** | Cloudinary       | Latest  | Media storage & CDN      |
| **DevOps**   | Jest             | 29.x    | Testing                  |
|              | ESLint           | 8.x/9.x | Code linting             |
|              | Nodemon          | 3.x     | Dev server               |

---

## API Communication Patterns

### Request/Response Pattern (REST):

- Client makes HTTP request
- Server processes and returns JSON response
- Stateless communication
- Used for: CRUD operations, data fetching

### Publish/Subscribe Pattern (WebSocket):

- Client subscribes to events
- Server publishes events to subscribers
- Stateful, persistent connection
- Used for: Real-time messaging, notifications, live updates

### Upload Pattern:

- Client uploads file via multipart/form-data
- Server proxies to Cloudinary
- Cloudinary returns URL
- Server stores URL in database
- Used for: Profile pictures, media uploads

---

## Error Handling

### Client-Side:

- Try-catch blocks around API calls
- Error messages displayed to user
- Toast notifications for feedback
- Fallback UI for error states

### Server-Side:

- AppError class for operational errors
- Global error handler middleware
- Structured error responses
- Error logging with Winston
- Different handling for development vs production

---

## Scalability Considerations

1. **Horizontal Scaling**:

   - Stateless API design allows multiple server instances
   - Load balancer can distribute requests
   - MongoDB supports replica sets

2. **Caching**:

   - Redis can be added for session storage
   - Database query results can be cached
   - Static assets cached by CDN

3. **Database**:

   - MongoDB sharding for large datasets
   - Read replicas for read-heavy workloads
   - Indexing strategy for performance

4. **Real-time**:
   - Socket.io supports Redis adapter for multi-server setups
   - Sticky sessions for WebSocket connections

---

## Future Enhancements

1. **Microservices**: Split monolith into specialized services
2. **Message Queue**: Add RabbitMQ/Bull for async processing
3. **Caching Layer**: Implement Redis for performance
4. **GraphQL**: Alternative to REST API
5. **Server-Sent Events**: For one-way real-time updates
6. **PWA**: Progressive Web App capabilities
7. **Mobile Apps**: React Native for iOS/Android
8. **Analytics**: Integration with analytics platforms
9. **CI/CD**: Automated testing and deployment pipelines
10. **Monitoring**: APM tools (New Relic, DataDog)

---

## Conclusion

UniConnect is a modern, full-stack social networking platform designed for university communities. The architecture leverages industry-standard technologies and follows best practices for security, performance, and scalability. The system supports both traditional request/response patterns and real-time communication, providing a rich, interactive user experience.
