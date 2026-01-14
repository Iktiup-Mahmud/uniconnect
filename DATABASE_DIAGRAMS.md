# UniConnect - Database Schema, DFD, UML & Interaction Diagrams

## Table of Contents

1. [Database Schema Reference](#database-schema-reference)
2. [Data Flow Diagrams (DFD)](#data-flow-diagrams-dfd)
3. [UML Diagrams](#uml-diagrams)
4. [Interaction Diagrams](#interaction-diagrams)

---

## Database Schema Reference

### Complete Schema: Collections, Primary Keys & Foreign Keys

#### Collection 1: **users**

| Field             | Type          | Constraints                                 | Description                 |
| ----------------- | ------------- | ------------------------------------------- | --------------------------- |
| `_id`             | ObjectId      | **PRIMARY KEY**                             | Unique identifier           |
| `name`            | String        | Required, Max 50 chars                      | User's full name            |
| `email`           | String        | Required, **UNIQUE**, Lowercase             | Email address               |
| `password`        | String        | Required, Min 6 chars, Hashed               | Encrypted password          |
| `username`        | String        | Required, **UNIQUE**, Lowercase, 3-30 chars | Unique username             |
| `avatar`          | String        | Optional                                    | Profile picture URL         |
| `bio`             | String        | Optional, Max 200 chars                     | User biography              |
| `followers`       | ObjectId[]    | **FOREIGN KEY** → users.\_id                | Array of follower user IDs  |
| `following`       | ObjectId[]    | **FOREIGN KEY** → users.\_id                | Array of following user IDs |
| `isEmailVerified` | Boolean       | Default: false                              | Email verification status   |
| `role`            | String (Enum) | Required: 'student', 'faculty', 'admin'     | User role                   |
| `createdAt`       | Date          | Auto-generated                              | Creation timestamp          |
| `updatedAt`       | Date          | Auto-generated                              | Last update timestamp       |

**Indexes:**

- `email` (unique)
- `username` (unique)

---

#### Collection 2: **posts**

| Field       | Type       | Constraints                            | Description           |
| ----------- | ---------- | -------------------------------------- | --------------------- |
| `_id`       | ObjectId   | **PRIMARY KEY**                        | Unique identifier     |
| `author`    | ObjectId   | **FOREIGN KEY** → users.\_id, Required | Post author           |
| `content`   | String     | Required, Max 5000 chars               | Post content          |
| `images`    | String[]   | Optional                               | Array of image URLs   |
| `likes`     | ObjectId[] | **FOREIGN KEY** → users.\_id           | Users who liked       |
| `comments`  | ObjectId[] | **FOREIGN KEY** → comments.\_id        | Associated comments   |
| `createdAt` | Date       | Auto-generated                         | Creation timestamp    |
| `updatedAt` | Date       | Auto-generated                         | Last update timestamp |

**Indexes:**

- `{ author: 1, createdAt: -1 }` (compound)
- `{ createdAt: -1 }`

---

#### Collection 3: **comments**

| Field       | Type       | Constraints                            | Description           |
| ----------- | ---------- | -------------------------------------- | --------------------- |
| `_id`       | ObjectId   | **PRIMARY KEY**                        | Unique identifier     |
| `postId`    | ObjectId   | **FOREIGN KEY** → posts.\_id, Required | Parent post           |
| `userId`    | ObjectId   | **FOREIGN KEY** → users.\_id, Required | Comment author        |
| `content`   | String     | Required, Max 500 chars                | Comment text          |
| `likes`     | ObjectId[] | **FOREIGN KEY** → users.\_id           | Users who liked       |
| `createdAt` | Date       | Auto-generated                         | Creation timestamp    |
| `updatedAt` | Date       | Auto-generated                         | Last update timestamp |

**Indexes:**

- `{ postId: 1, createdAt: -1 }` (compound)

---

#### Collection 4: **portfolios**

| Field            | Type          | Constraints                                        | Description           |
| ---------------- | ------------- | -------------------------------------------------- | --------------------- |
| `_id`            | ObjectId      | **PRIMARY KEY**                                    | Unique identifier     |
| `userId`         | ObjectId      | **FOREIGN KEY** → users.\_id, Required, **UNIQUE** | Portfolio owner       |
| `title`          | String        | Required, Max 100 chars                            | Portfolio title       |
| `description`    | String        | Optional, Max 1000 chars                           | Portfolio description |
| `projects`       | Array[Object] | Embedded documents                                 | Project details       |
| `achievements`   | Array[Object] | Embedded documents                                 | Achievement details   |
| `skills`         | String[]      | Array of skills                                    | Skill list            |
| `education`      | Array[Object] | Embedded documents                                 | Education history     |
| `certifications` | Array[Object] | Embedded documents                                 | Certification details |
| `isPublic`       | Boolean       | Default: true                                      | Visibility status     |
| `createdAt`      | Date          | Auto-generated                                     | Creation timestamp    |
| `updatedAt`      | Date          | Auto-generated                                     | Last update timestamp |

**Indexes:**

- `{ userId: 1 }` (unique)

**Embedded Subdocuments:**

- `projects`: { name, description, technologies[], githubUrl, liveUrl, imageUrl }
- `achievements`: { title, description, date, issuer }
- `education`: { degree, institution, year, gpa }
- `certifications`: { name, issuer, date, credentialId, url }

---

#### Collection 5: **courses**

| Field           | Type          | Constraints                            | Description           |
| --------------- | ------------- | -------------------------------------- | --------------------- |
| `_id`           | ObjectId      | **PRIMARY KEY**                        | Unique identifier     |
| `code`          | String        | Required, **UNIQUE**, Uppercase        | Course code           |
| `name`          | String        | Required, Max 200 chars                | Course name           |
| `description`   | String        | Optional, Max 1000 chars               | Course description    |
| `instructor`    | ObjectId      | **FOREIGN KEY** → users.\_id, Required | Course instructor     |
| `students`      | ObjectId[]    | **FOREIGN KEY** → users.\_id           | Enrolled students     |
| `materials`     | Array[Object] | Embedded documents                     | Course materials      |
| `announcements` | ObjectId[]    | **FOREIGN KEY** → announcements.\_id   | Course announcements  |
| `assignments`   | Array[Object] | Embedded documents                     | Assignment details    |
| `semester`      | String        | Required                               | Semester information  |
| `year`          | Number        | Required                               | Academic year         |
| `createdAt`     | Date          | Auto-generated                         | Creation timestamp    |
| `updatedAt`     | Date          | Auto-generated                         | Last update timestamp |

**Indexes:**

- `{ instructor: 1 }`
- `{ code: 1 }` (unique)

**Embedded Subdocuments:**

- `materials`: { title, type (enum), url, description, uploadedAt }
- `assignments`: { title, description, dueDate, maxScore, submissions[] }

---

#### Collection 6: **clubs**

| Field         | Type          | Constraints                            | Description                                                            |
| ------------- | ------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `_id`         | ObjectId      | **PRIMARY KEY**                        | Unique identifier                                                      |
| `name`        | String        | Required, **UNIQUE**, Max 100 chars    | Club name                                                              |
| `description` | String        | Optional, Max 1000 chars               | Club description                                                       |
| `organizer`   | ObjectId      | **FOREIGN KEY** → users.\_id, Required | Club organizer                                                         |
| `members`     | ObjectId[]    | **FOREIGN KEY** → users.\_id           | Club members                                                           |
| `events`      | ObjectId[]    | **FOREIGN KEY** → events.\_id          | Club events                                                            |
| `imageUrl`    | String        | Optional                               | Club image URL                                                         |
| `category`    | String (Enum) | Required                               | Academic, Sports, Arts, Technology, Cultural, Social, Volunteer, Other |
| `isActive`    | Boolean       | Default: true                          | Active status                                                          |
| `createdAt`   | Date          | Auto-generated                         | Creation timestamp                                                     |
| `updatedAt`   | Date          | Auto-generated                         | Last update timestamp                                                  |

**Indexes:**

- `{ organizer: 1 }`
- `{ category: 1 }`
- `{ isActive: 1 }`

---

#### Collection 7: **events**

| Field          | Type          | Constraints                              | Description                                                              |
| -------------- | ------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `_id`          | ObjectId      | **PRIMARY KEY**                          | Unique identifier                                                        |
| `title`        | String        | Required, Max 200 chars                  | Event title                                                              |
| `description`  | String        | Optional, Max 2000 chars                 | Event description                                                        |
| `organizer`    | ObjectId      | **FOREIGN KEY** → users.\_id, Required   | Event organizer                                                          |
| `clubId`       | ObjectId      | **FOREIGN KEY** → clubs.\_id, Optional   | Associated club                                                          |
| `courseId`     | ObjectId      | **FOREIGN KEY** → courses.\_id, Optional | Associated course                                                        |
| `eventDate`    | Date          | Required                                 | Event date/time                                                          |
| `location`     | String        | Required                                 | Event location                                                           |
| `imageUrl`     | String        | Optional                                 | Event image URL                                                          |
| `attendees`    | ObjectId[]    | **FOREIGN KEY** → users.\_id             | RSVP'd attendees                                                         |
| `maxAttendees` | Number        | Optional                                 | Maximum capacity                                                         |
| `isPublic`     | Boolean       | Default: true                            | Public visibility                                                        |
| `category`     | String (Enum) | Required                                 | Workshop, Seminar, Conference, Social, Sports, Cultural, Academic, Other |
| `createdAt`    | Date          | Auto-generated                           | Creation timestamp                                                       |
| `updatedAt`    | Date          | Auto-generated                           | Last update timestamp                                                    |

**Indexes:**

- `{ organizer: 1 }`
- `{ clubId: 1 }`
- `{ eventDate: 1 }`
- `{ isPublic: 1 }`

---

#### Collection 8: **conversations**

| Field           | Type          | Constraints                               | Description               |
| --------------- | ------------- | ----------------------------------------- | ------------------------- |
| `_id`           | ObjectId      | **PRIMARY KEY**                           | Unique identifier         |
| `participants`  | ObjectId[]    | **FOREIGN KEY** → users.\_id, Required    | Conversation participants |
| `type`          | String (Enum) | Required: 'direct', 'group'               | Conversation type         |
| `groupName`     | String        | Optional (required for groups)            | Group conversation name   |
| `groupImage`    | String        | Optional                                  | Group image URL           |
| `lastMessage`   | ObjectId      | **FOREIGN KEY** → messages.\_id, Optional | Last message reference    |
| `lastMessageAt` | Date          | Optional                                  | Last message timestamp    |
| `createdAt`     | Date          | Auto-generated                            | Creation timestamp        |
| `updatedAt`     | Date          | Auto-generated                            | Last update timestamp     |

**Indexes:**

- `{ participants: 1 }`
- `{ type: 1 }`
- `{ lastMessageAt: -1 }`

---

#### Collection 9: **messages**

| Field            | Type          | Constraints                                    | Description             |
| ---------------- | ------------- | ---------------------------------------------- | ----------------------- |
| `_id`            | ObjectId      | **PRIMARY KEY**                                | Unique identifier       |
| `conversationId` | ObjectId      | **FOREIGN KEY** → conversations.\_id, Required | Parent conversation     |
| `senderId`       | ObjectId      | **FOREIGN KEY** → users.\_id, Required         | Message sender          |
| `content`        | String        | Required, Max 5000 chars                       | Message content         |
| `messageType`    | String (Enum) | Default: 'text'                                | 'text', 'image', 'file' |
| `fileUrl`        | String        | Optional                                       | Attachment URL          |
| `isRead`         | Boolean       | Default: false                                 | Read status             |
| `readAt`         | Date          | Optional                                       | Read timestamp          |
| `createdAt`      | Date          | Auto-generated                                 | Creation timestamp      |
| `updatedAt`      | Date          | Auto-generated                                 | Last update timestamp   |

**Indexes:**

- `{ conversationId: 1, createdAt: -1 }` (compound)
- `{ senderId: 1 }`

---

#### Collection 10: **notifications**

| Field         | Type          | Constraints                             | Description                                                                                                      |
| ------------- | ------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `_id`         | ObjectId      | **PRIMARY KEY**                         | Unique identifier                                                                                                |
| `userId`      | ObjectId      | **FOREIGN KEY** → users.\_id, Required  | Notification recipient                                                                                           |
| `type`        | String (Enum) | Required                                | post_like, post_comment, event_invite, club_invite, course_announcement, assignment_due, message, follow, system |
| `title`       | String        | Required, Max 200 chars                 | Notification title                                                                                               |
| `message`     | String        | Required, Max 500 chars                 | Notification message                                                                                             |
| `relatedId`   | ObjectId      | **FOREIGN KEY** (polymorphic), Optional | Related entity ID                                                                                                |
| `relatedType` | String (Enum) | Optional                                | 'post', 'event', 'club', 'course', 'message', 'user'                                                             |
| `isRead`      | Boolean       | Default: false                          | Read status                                                                                                      |
| `readAt`      | Date          | Optional                                | Read timestamp                                                                                                   |
| `createdAt`   | Date          | Auto-generated                          | Creation timestamp                                                                                               |
| `updatedAt`   | Date          | Auto-generated                          | Last update timestamp                                                                                            |

**Indexes:**

- `{ userId: 1, createdAt: -1 }` (compound)
- `{ isRead: 1 }`

**Note:** `relatedId` + `relatedType` form a polymorphic relationship

---

#### Collection 11: **announcements**

| Field            | Type          | Constraints                              | Description                                  |
| ---------------- | ------------- | ---------------------------------------- | -------------------------------------------- |
| `_id`            | ObjectId      | **PRIMARY KEY**                          | Unique identifier                            |
| `title`          | String        | Required, Max 200 chars                  | Announcement title                           |
| `content`        | String        | Required, Max 5000 chars                 | Announcement content                         |
| `author`         | ObjectId      | **FOREIGN KEY** → users.\_id, Required   | Announcement author                          |
| `targetAudience` | String (Enum) | Default: 'all'                           | 'all', 'students', 'faculty', 'club_members' |
| `courseId`       | ObjectId      | **FOREIGN KEY** → courses.\_id, Optional | Associated course                            |
| `clubId`         | ObjectId      | **FOREIGN KEY** → clubs.\_id, Optional   | Associated club                              |
| `isPinned`       | Boolean       | Default: false                           | Pin status                                   |
| `attachments`    | String[]      | Optional                                 | Attachment URLs                              |
| `createdAt`      | Date          | Auto-generated                           | Creation timestamp                           |
| `updatedAt`      | Date          | Auto-generated                           | Last update timestamp                        |

**Indexes:**

- `{ author: 1 }`
- `{ courseId: 1 }`
- `{ clubId: 1 }`
- `{ isPinned: 1 }`

---

### Foreign Key Relationships Summary

| Parent Collection | Child Collection | Relationship Type | FK Field in Child        |
| ----------------- | ---------------- | ----------------- | ------------------------ |
| users             | users            | Many-to-Many      | followers[], following[] |
| users             | posts            | One-to-Many       | author                   |
| users             | comments         | One-to-Many       | userId                   |
| users             | portfolios       | One-to-One        | userId                   |
| users             | courses          | One-to-Many       | instructor               |
| users             | clubs            | One-to-Many       | organizer                |
| users             | events           | One-to-Many       | organizer                |
| users             | messages         | One-to-Many       | senderId                 |
| users             | notifications    | One-to-Many       | userId                   |
| users             | announcements    | One-to-Many       | author                   |
| posts             | comments         | One-to-Many       | postId                   |
| posts             | users            | Many-to-Many      | likes[]                  |
| comments          | users            | Many-to-Many      | likes[]                  |
| clubs             | users            | Many-to-Many      | members[]                |
| clubs             | events           | One-to-Many       | clubId                   |
| clubs             | announcements    | One-to-Many       | clubId                   |
| courses           | users            | Many-to-Many      | students[]               |
| courses           | events           | One-to-Many       | courseId                 |
| courses           | announcements    | One-to-Many       | courseId                 |
| events            | users            | Many-to-Many      | attendees[]              |
| conversations     | users            | Many-to-Many      | participants[]           |
| conversations     | messages         | One-to-Many       | conversationId           |
| conversations     | messages         | One-to-One        | lastMessage              |

---

## Data Flow Diagrams (DFD)

### Level 0: Context Diagram

```
                              ┌──────────────────────┐
                              │                      │
                              │   External System:   │
                              │  Cloudinary CDN      │
                              │  (Media Storage)     │
                              │                      │
                              └──────────┬───────────┘
                                         │
                                         │ Media Upload/Retrieve
                                         │
┌──────────────┐                         ▼                      ┌──────────────┐
│              │                ┌─────────────────┐             │              │
│   Student    │───────────────>│                 │<────────────│   Faculty    │
│              │ Login, Posts,  │   UniConnect    │  Login,     │              │
│              │ Messages,      │     Platform    │  Courses,   │              │
│              │ Events, Clubs  │                 │  Posts      │              │
└──────────────┘                │   (System 0)    │             └──────────────┘
                                │                 │
┌──────────────┐                │                 │             ┌──────────────┐
│              │───────────────>│                 │<────────────│              │
│    Admin     │ Manage Users,  │                 │  View/Join  │    Visitor   │
│              │ Announcements  │                 │  (Limited)  │              │
│              │                │                 │             │              │
└──────────────┘                └─────────────────┘             └──────────────┘
                                         │
                                         │ Data Persistence
                                         ▼
                              ┌──────────────────────┐
                              │                      │
                              │  MongoDB Database    │
                              │   (Data Storage)     │
                              │                      │
                              └──────────────────────┘
```

---

### Level 1: Main Processes

```
┌──────────┐
│  Users   │
└────┬─────┘
     │
     │ Credentials
     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1.0 Authentication & Authorization                                          │
│ • Register • Login • Logout • Verify JWT • Manage Sessions                 │
└────────┬────────────────────────────────────────────────────────────────────┘
         │ User Token
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2.0 Social Networking                                                       │
│ • Create Posts • Like/Comment • Follow Users • News Feed                   │
└────────┬────────────────────────────────────────────────────────────────────┘
         │ Post Data
         │
         ├─────────────────────────────────────────────────────────────────┐
         │                                                                 │
         ▼                                                                 ▼
┌──────────────────────────┐                                 ┌──────────────────────────┐
│ 3.0 Portfolio Management │                                 │ 4.0 Course Management    │
│ • Create Portfolio       │                                 │ • Create Courses         │
│ • Add Projects           │                                 │ • Enroll Students        │
│ • Update Skills          │                                 │ • Upload Materials       │
└────────┬─────────────────┘                                 │ • Manage Assignments     │
         │                                                   └────────┬─────────────────┘
         │                                                            │
         │                                                            │
         ▼                                                            ▼
┌──────────────────────────┐                                 ┌──────────────────────────┐
│ 5.0 Club Management      │                                 │ 6.0 Event Management     │
│ • Create Clubs           │                                 │ • Create Events          │
│ • Manage Members         │                                 │ • RSVP System            │
│ • Club Activities        │                                 │ • Attendee Management    │
└────────┬─────────────────┘                                 └────────┬─────────────────┘
         │                                                            │
         │                                                            │
         ▼                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 7.0 Real-time Messaging (WebSocket)                                          │
│ • Direct Messages • Group Chats • Typing Indicators • Read Receipts         │
└────────┬─────────────────────────────────────────────────────────────────────┘
         │ Messages
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 8.0 Notifications                                                            │
│ • Push Notifications • Email Notifications • In-app Alerts                  │
└────────┬─────────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ 9.0 Media Management                                                         │
│ • Upload Images • Upload Videos • CDN Delivery (Cloudinary)                 │
└────────┬─────────────────────────────────────────────────────────────────────┘
         │
         │ All Data
         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          MongoDB Database                                    │
│ (users, posts, courses, clubs, events, messages, notifications, etc.)       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Level 2: Detailed Process - User Authentication

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Registration Data
       │    (name, email, password, role)
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1.1 Validate Input                                           │
│ • Check required fields • Validate email format              │
│ • Check password strength • Verify role                      │
└──────┬───────────────────────────────────────────────────────┘
       │ Valid Data
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1.2 Check Existing User                                      │
│ • Query database for existing email/username                 │
└──────┬───────────────────────────────────────────────────────┘
       │ User Not Found
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1.3 Hash Password                                            │
│ • Generate salt • Hash password with bcrypt (10 rounds)      │
└──────┬───────────────────────────────────────────────────────┘
       │ Hashed Password
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1.4 Create User Record                                       │
│ • Insert into users collection • Set default values          │
└──────┬───────────────────────────────────────────────────────┘
       │ User Created
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1.5 Generate JWT Token                                       │
│ • Create payload: { userId: user._id }                       │
│ • Sign with JWT_SECRET • Set expiration                      │
└──────┬───────────────────────────────────────────────────────┘
       │ JWT Token + User Data
       ▼
┌─────────────┐
│   Client    │
│ (Store Token│
│ in Storage) │
└─────────────┘
```

---

### Level 2: Detailed Process - Create Post

```
┌──────────────┐
│ Authenticated│
│     User     │
└──────┬───────┘
       │ 1. Post Data (content, images[])
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2.1 Authenticate Request                                     │
│ • Extract JWT from Authorization header                      │
│ • Verify token • Get user from database                      │
└──────┬───────────────────────────────────────────────────────┘
       │ Authenticated User Object
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2.2 Validate Post Data                                       │
│ • Check content not empty • Validate image URLs              │
│ • Check content length (max 5000 chars)                      │
└──────┬───────────────────────────────────────────────────────┘
       │ Valid Post Data
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 2.3 Create Post Document                                     │
│ • Set author = user._id • Insert into posts collection       │
│ • Initialize likes[], comments[] as empty arrays             │
└──────┬───────────────────────────────────────────────────────┘
       │ Created Post
       │
       ├──────────────────────────┬────────────────────────────┐
       │                          │                            │
       ▼                          ▼                            ▼
┌─────────────────┐    ┌──────────────────┐       ┌─────────────────────┐
│ 2.4 Notify      │    │ 2.5 Update Feed  │       │ 2.6 Broadcast via   │
│ Followers       │    │ Algorithm        │       │ WebSocket (optional)│
│ (Create         │    │ (Cache/Index)    │       │ (Real-time update)  │
│ Notifications)  │    │                  │       │                     │
└─────────────────┘    └──────────────────┘       └─────────────────────┘
       │                          │                            │
       └──────────────────────────┴────────────────────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │ Return Post   │
                          │ to Client     │
                          └───────────────┘
```

---

### Level 2: Detailed Process - Real-time Messaging

```
┌───────────┐                                             ┌───────────┐
│  User A   │                                             │  User B   │
└─────┬─────┘                                             └─────┬─────┘
      │                                                         │
      │ 1. WebSocket Connect (JWT Token)                       │
      ▼                                                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7.1 Socket Authentication                                            │
│ • Extract token from handshake • Verify JWT                          │
│ • Fetch user from database • Attach userId to socket                 │
└──────┬───────────────────────────────────────────────────────────────┘
       │ Authenticated Socket
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7.2 Join User Room                                                   │
│ • socket.join(userId) • Track online status                          │
│ • Update onlineUsers Map • Broadcast user:online event               │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       │ User A sends message
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7.3 Join Conversation Room                                           │
│ • Event: "join:conversation" with conversationId                     │
│ • socket.join(conversationId)                                        │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7.4 Send Message Event                                               │
│ • Event: "message:send" { conversationId, content }                  │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 7.5 Validate & Save Message                                          │
│ • Verify user is conversation participant                            │
│ • Create message document in messages collection                     │
│ • Update conversation.lastMessage & lastMessageAt                    │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ├────────────────────────────────────────────────┐
       │                                                │
       ▼                                                ▼
┌────────────────────────────────┐      ┌──────────────────────────────┐
│ 7.6 Emit to Conversation Room  │      │ 7.7 Create Notification      │
│ • io.to(conversationId)        │      │ • For offline participants   │
│   .emit("message:receive")     │      │ • Type: "message"            │
│ • All participants receive     │      │ • Save to notifications      │
└────────────────────────────────┘      └──────────────────────────────┘
       │                                                │
       └────────────────────┬───────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  User B       │
                    │  Receives     │
                    │  Message      │
                    └───────────────┘
```

---

## UML Diagrams

### Use Case Diagram

```
                         UniConnect System Use Cases

┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌─────────┐                                                             │
│  │ Student │                                                             │
│  └────┬────┘                                                             │
│       │                                                                  │
│       │──────────> (Register Account)                                   │
│       │──────────> (Login)                                              │
│       │──────────> (Create/Edit Profile)                                │
│       │──────────> (Create Post)                                        │
│       │──────────> (Like/Comment Post)                                  │
│       │──────────> (Follow Users)                                       │
│       │──────────> (Create Portfolio)                                   │
│       │──────────> (Enroll in Course)                                   │
│       │──────────> (Join Club)                                          │
│       │──────────> (Create Club)                                        │
│       │──────────> (RSVP to Event)                                      │
│       │──────────> (Send Message)                                       │
│       │──────────> (View Notifications)                                 │
│       │──────────> (Search Users/Posts/Clubs)                           │
│       │──────────> (Upload Media)                                       │
│       │                                                                  │
│  ┌─────────┐                                                             │
│  │ Faculty │                                                             │
│  └────┬────┘                                                             │
│       │                                                                  │
│       │──────────> (All Student Use Cases)                              │
│       │──────────> (Create Course)                    ┌────────────┐    │
│       │──────────> (Manage Course Content)───────────>│  <<extend>>│    │
│       │──────────> (Grade Assignments)                │  (Upload   │    │
│       │──────────> (Post Course Announcement)         │   Material)│    │
│       │                                               └────────────┘    │
│       │                                                                  │
│  ┌─────────┐                                                             │
│  │  Admin  │                                                             │
│  └────┬────┘                                                             │
│       │                                                                  │
│       │──────────> (Manage Users)                                       │
│       │──────────> (Delete Inappropriate Content)                       │
│       │──────────> (Post System Announcement)                           │
│       │──────────> (View Analytics)                                     │
│       │──────────> (Manage Clubs/Events)                                │
│       │                                                                  │
│  ┌─────────┐                                                             │
│  │ Visitor │                                                             │
│  └────┬────┘                                                             │
│       │                                                                  │
│       │──────────> (View Public Posts)                                  │
│       │──────────> (Search Public Content)                              │
│       │                                                                  │
│                                                                          │
│  External Systems:                                                       │
│  ┌──────────────┐                                                        │
│  │ Cloudinary   │─────────> (Store/Retrieve Media)                      │
│  └──────────────┘                                                        │
│  ┌──────────────┐                                                        │
│  │ Email Server │─────────> (Send Verification Emails)                  │
│  └──────────────┘                                                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Class Diagram (Domain Model)

```
┌────────────────────────────────┐
│           User                 │
├────────────────────────────────┤
│ - _id: ObjectId               │
│ - name: String                 │
│ - email: String                │
│ - password: String             │
│ - username: String             │
│ - avatar: String               │
│ - bio: String                  │
│ - role: Enum                   │
│ - followers: User[]            │◄──────┐
│ - following: User[]            │       │
│ - isEmailVerified: Boolean     │       │
├────────────────────────────────┤       │ Many-to-Many
│ + register(): Promise<User>    │       │ (Self)
│ + login(): Promise<Token>      │       │
│ + updateProfile(): Promise     │       │
│ + follow(user): Promise        │───────┘
│ + unfollow(user): Promise      │
│ + comparePassword(): Boolean   │
└───────┬────────────────────────┘
        │ 1
        │ author
        │
        │ 1..*
┌───────┴────────────────────────┐         ┌────────────────────────────┐
│           Post                 │         │         Comment            │
├────────────────────────────────┤         ├────────────────────────────┤
│ - _id: ObjectId               │         │ - _id: ObjectId           │
│ - author: User                 │         │ - postId: Post            │
│ - content: String              │◄────┐   │ - userId: User            │
│ - images: String[]             │     │   │ - content: String          │
│ - likes: User[]                │     │   │ - likes: User[]            │
│ - comments: Comment[]          │     │   ├────────────────────────────┤
├────────────────────────────────┤     │   │ + create(): Promise        │
│ + create(): Promise<Post>      │     │   │ + like(): Promise          │
│ + update(): Promise            │     │   │ + delete(): Promise        │
│ + delete(): Promise            │     │   └────────────────────────────┘
│ + like(): Promise              │     │
│ + unlike(): Promise            │     │ 1..* comments
│ + addComment(): Promise        │─────┘
└────────────────────────────────┘


┌────────────────────────────────┐         ┌────────────────────────────┐
│         Portfolio              │         │          Course            │
├────────────────────────────────┤         ├────────────────────────────┤
│ - _id: ObjectId               │         │ - _id: ObjectId           │
│ - userId: User                 │         │ - code: String            │
│ - title: String                │         │ - name: String             │
│ - description: String          │         │ - instructor: User         │
│ - projects: Project[]          │         │ - students: User[]         │
│ - skills: String[]             │         │ - materials: Material[]    │
│ - education: Education[]       │         │ - assignments: Assignment[]│
│ - certifications: Cert[]       │         ├────────────────────────────┤
├────────────────────────────────┤         │ + create(): Promise        │
│ + create(): Promise            │         │ + enroll(student): Promise │
│ + update(): Promise            │         │ + addMaterial(): Promise   │
│ + addProject(): Promise        │         │ + createAssignment()       │
│ + delete(): Promise            │         └────────────────────────────┘
└────────────────────────────────┘


┌────────────────────────────────┐         ┌────────────────────────────┐
│            Club                │         │           Event            │
├────────────────────────────────┤         ├────────────────────────────┤
│ - _id: ObjectId               │         │ - _id: ObjectId           │
│ - name: String                 │         │ - title: String            │
│ - organizer: User              │         │ - organizer: User          │
│ - members: User[]              │         │ - clubId: Club             │
│ - events: Event[]              │◄────┐   │ - courseId: Course         │
│ - category: Enum               │     │   │ - eventDate: Date          │
│ - isActive: Boolean            │     │   │ - attendees: User[]        │
├────────────────────────────────┤     │   ├────────────────────────────┤
│ + create(): Promise            │     │   │ + create(): Promise        │
│ + addMember(): Promise         │     │   │ + rsvp(user): Promise      │
│ + removeMember(): Promise      │     │   │ + cancelRSVP(): Promise    │
│ + createEvent(): Promise       │─────┘   │ + update(): Promise        │
│ + deactivate(): Promise        │         └────────────────────────────┘
└────────────────────────────────┘


┌────────────────────────────────┐         ┌────────────────────────────┐
│        Conversation            │         │          Message           │
├────────────────────────────────┤         ├────────────────────────────┤
│ - _id: ObjectId               │         │ - _id: ObjectId           │
│ - participants: User[]         │         │ - conversationId: Convers. │
│ - type: Enum                   │◄────┐   │ - senderId: User           │
│ - groupName: String            │     │   │ - content: String          │
│ - lastMessage: Message         │     │   │ - messageType: Enum        │
│ - lastMessageAt: Date          │     │   │ - isRead: Boolean          │
├────────────────────────────────┤     │   ├────────────────────────────┤
│ + create(): Promise            │     │   │ + send(): Promise          │
│ + addParticipant(): Promise    │     │   │ + markAsRead(): Promise    │
│ + removeParticipant(): Promise │     │   │ + delete(): Promise        │
└────────────────────────────────┘     │   └────────────────────────────┘
                                       │
                                       │ 1..* messages
                                       └───


┌────────────────────────────────┐         ┌────────────────────────────┐
│       Notification             │         │      Announcement          │
├────────────────────────────────┤         ├────────────────────────────┤
│ - _id: ObjectId               │         │ - _id: ObjectId           │
│ - userId: User                 │         │ - title: String            │
│ - type: Enum                   │         │ - content: String          │
│ - title: String                │         │ - author: User             │
│ - message: String              │         │ - targetAudience: Enum     │
│ - relatedId: ObjectId          │         │ - courseId: Course         │
│ - relatedType: String          │         │ - clubId: Club             │
│ - isRead: Boolean              │         │ - isPinned: Boolean        │
├────────────────────────────────┤         ├────────────────────────────┤
│ + create(): Promise            │         │ + create(): Promise        │
│ + markAsRead(): Promise        │         │ + update(): Promise        │
│ + delete(): Promise            │         │ + pin(): Promise           │
└────────────────────────────────┘         │ + delete(): Promise        │
                                           └────────────────────────────┘
```

---

## Interaction Diagrams

### Sequence Diagram: User Registration & Login

```
Client          API Server      Auth Controller   User Model      Database      JWT Service
  │                 │                 │                │              │               │
  │ POST /register  │                 │                │              │               │
  ├────────────────>│                 │                │              │               │
  │                 │ register(data)  │                │              │               │
  │                 ├────────────────>│                │              │               │
  │                 │                 │ validate()     │              │               │
  │                 │                 ├───────────────┐│              │               │
  │                 │                 │               ││              │               │
  │                 │                 │<──────────────┘│              │               │
  │                 │                 │                │              │               │
  │                 │                 │ hashPassword() │              │               │
  │                 │                 ├───────────────┐│              │               │
  │                 │                 │               ││              │               │
  │                 │                 │<──────────────┘│              │               │
  │                 │                 │                │              │               │
  │                 │                 │ create(user)   │              │               │
  │                 │                 ├───────────────>│              │               │
  │                 │                 │                │ save()       │               │
  │                 │                 │                ├─────────────>│               │
  │                 │                 │                │              │               │
  │                 │                 │                │ user created │               │
  │                 │                 │                │<─────────────┤               │
  │                 │                 │                │              │               │
  │                 │                 │ generateToken()│              │               │
  │                 │                 ├───────────────────────────────────────────────>│
  │                 │                 │                │              │               │
  │                 │                 │                │              │     JWT token │
  │                 │                 │<───────────────────────────────────────────────┤
  │                 │                 │                │              │               │
  │                 │ { token, user } │                │              │               │
  │                 │<────────────────┤                │              │               │
  │                 │                 │                │              │               │
  │ 201 Created     │                 │                │              │               │
  │ { token, user } │                 │                │              │               │
  │<────────────────┤                 │                │              │               │
  │                 │                 │                │              │               │
  │ Store token     │                 │                │              │               │
  │ in localStorage │                 │                │              │               │
  ├────────────────┐│                 │                │              │               │
  │                ││                 │                │              │               │
  │<───────────────┘│                 │                │              │               │
  │                 │                 │                │              │               │
  │ POST /login     │                 │                │              │               │
  ├────────────────>│                 │                │              │               │
  │                 │ login(creds)    │                │              │               │
  │                 ├────────────────>│                │              │               │
  │                 │                 │ findByEmail()  │              │               │
  │                 │                 ├───────────────>│              │               │
  │                 │                 │                │ query        │               │
  │                 │                 │                ├─────────────>│               │
  │                 │                 │                │              │               │
  │                 │                 │                │ user         │               │
  │                 │                 │                │<─────────────┤               │
  │                 │                 │ user           │              │               │
  │                 │                 │<───────────────┤              │               │
  │                 │                 │                │              │               │
  │                 │                 │ comparePassword│              │               │
  │                 │                 ├───────────────┐│              │               │
  │                 │                 │   (bcrypt)    ││              │               │
  │                 │                 │<──────────────┘│              │               │
  │                 │                 │                │              │               │
  │                 │                 │ generateToken()│              │               │
  │                 │                 ├───────────────────────────────────────────────>│
  │                 │                 │                │              │               │
  │                 │                 │                │              │     JWT token │
  │                 │                 │<───────────────────────────────────────────────┤
  │                 │                 │                │              │               │
  │                 │ { token, user } │                │              │               │
  │                 │<────────────────┤                │              │               │
  │                 │                 │                │              │               │
  │ 200 OK          │                 │                │              │               │
  │ { token, user } │                 │                │              │               │
  │<────────────────┤                 │                │              │               │
  │                 │                 │                │              │               │
```

---

### Sequence Diagram: Create Post with Media Upload

```
Client      API Gateway    Auth MW     Post Ctrl    Upload Srv   Cloudinary   Database    WebSocket
  │             │              │            │            │             │            │           │
  │ Select      │              │            │            │             │            │           │
  │ Image       │              │            │            │             │            │           │
  ├────────────┐│              │            │            │             │            │           │
  │            ││              │            │            │             │            │           │
  │<───────────┘│              │            │            │             │            │           │
  │             │              │            │            │             │            │           │
  │ POST /upload/image         │            │            │             │            │           │
  ├────────────────────────────┼───────────>│            │             │            │           │
  │             │              │ verify JWT │            │             │            │           │
  │             │              ├───────────┐│            │             │            │           │
  │             │              │           ││            │             │            │           │
  │             │              │<──────────┘│            │             │            │           │
  │             │              │            │ upload()   │             │            │           │
  │             │              │            ├───────────>│             │            │           │
  │             │              │            │            │ stream file │            │           │
  │             │              │            │            ├────────────>│            │           │
  │             │              │            │            │             │            │           │
  │             │              │            │            │   upload OK │            │           │
  │             │              │            │            │   + URL     │            │           │
  │             │              │            │            │<────────────┤            │           │
  │             │              │            │ { imageUrl}│             │            │           │
  │             │              │            │<───────────┤             │            │           │
  │             │ 200 OK       │            │            │             │            │           │
  │             │ { imageUrl } │            │            │             │            │           │
  │<────────────┴──────────────┴────────────┤            │             │            │           │
  │             │              │            │            │             │            │           │
  │ Store URL   │              │            │            │             │            │           │
  ├────────────┐│              │            │            │             │            │           │
  │            ││              │            │            │             │            │           │
  │<───────────┘│              │            │            │             │            │           │
  │             │              │            │            │             │            │           │
  │ POST /posts │              │            │            │             │            │           │
  │ { content,  │              │            │            │             │            │           │
  │   images:   │              │            │            │             │            │           │
  │   [url] }   │              │            │            │             │            │           │
  ├────────────>│              │            │            │             │            │           │
  │             │              │ verify JWT │            │             │            │           │
  │             │              ├───────────┐│            │             │            │           │
  │             │              │           ││            │             │            │           │
  │             │              │<──────────┘│            │             │            │           │
  │             │              │ authorized │            │             │            │           │
  │             │              ├───────────>│            │             │            │           │
  │             │              │            │ create()   │             │            │           │
  │             │              │            ├────────────────────────────────────────>│           │
  │             │              │            │            │             │            │           │
  │             │              │            │            │             │   post saved           │
  │             │              │            │<────────────────────────────────────────┤           │
  │             │              │            │            │             │            │           │
  │             │              │            │ notifyFollowers()        │            │           │
  │             │              │            ├────────────────────────────────────────────────────>│
  │             │              │            │            │             │            │           │
  │             │              │            │            │             │            │ broadcast │
  │             │              │            │            │             │            │ new_post  │
  │             │              │            │            │             │            │<──────────┤
  │             │              │            │            │             │            │           │
  │             │ 201 Created  │            │            │             │            │           │
  │             │ { post }     │            │            │             │            │           │
  │<────────────┴──────────────┴────────────┤            │             │            │           │
  │             │              │            │            │             │            │           │
```

---

### Sequence Diagram: Real-time Messaging

```
User A         Client A      WebSocket Server     Database       Client B      User B
  │               │                  │                │              │            │
  │ Open chat     │                  │                │              │            │
  │ with User B   │                  │                │              │            │
  ├──────────────>│                  │                │              │            │
  │               │ ws://connect     │                │              │            │
  │               │ { token }        │                │              │            │
  │               ├─────────────────>│                │              │            │
  │               │                  │ verify token   │              │            │
  │               │                  ├───────────────┐│              │            │
  │               │                  │               ││              │            │
  │               │                  │<──────────────┘│              │            │
  │               │                  │                │              │            │
  │               │                  │ join user room │              │            │
  │               │                  ├───────────────┐│              │            │
  │               │                  │               ││              │            │
  │               │                  │<──────────────┘│              │            │
  │               │ connected        │                │              │            │
  │               │<─────────────────┤                │              │            │
  │               │                  │                │              │            │
  │               │ emit: join:conversation           │              │            │
  │               │ { conversationId }                │              │            │
  │               ├─────────────────>│                │              │            │
  │               │                  │ join room      │              │            │
  │               │                  ├───────────────┐│              │            │
  │               │                  │               ││              │            │
  │               │                  │<──────────────┘│              │            │
  │               │ joined           │                │              │            │
  │               │<─────────────────┤                │              │            │
  │               │                  │                │              │            │
  │ Type message  │                  │                │              │            │
  ├──────────────>│                  │                │              │            │
  │               │ emit: typing:start                │              │            │
  │               │ { conversationId }                │              │            │
  │               ├─────────────────>│                │              │            │
  │               │                  │ broadcast to   │              │            │
  │               │                  │ room           │              │            │
  │               │                  ├───────────────────────────────>│            │
  │               │                  │                │ on:           │            │
  │               │                  │                │ typing:start  │            │
  │               │                  │                │              ├───────────>│
  │               │                  │                │              │ "User A is │
  │               │                  │                │              │  typing…"  │
  │               │                  │                │              │            │
  │ Send message  │                  │                │              │            │
  ├──────────────>│                  │                │              │            │
  │               │ emit: message:send                │              │            │
  │               │ { conversationId,│                │              │            │
  │               │   content }      │                │              │            │
  │               ├─────────────────>│                │              │            │
  │               │                  │ save message   │              │            │
  │               │                  ├───────────────>│              │            │
  │               │                  │                │              │            │
  │               │                  │ message saved  │              │            │
  │               │                  │<───────────────┤              │            │
  │               │                  │                │              │            │
  │               │                  │ update         │              │            │
  │               │                  │ conversation   │              │            │
  │               │                  │ lastMessage    │              │            │
  │               │                  ├───────────────>│              │            │
  │               │                  │                │              │            │
  │               │                  │ updated        │              │            │
  │               │                  │<───────────────┤              │            │
  │               │                  │                │              │            │
  │               │                  │ emit to room:  │              │            │
  │               │                  │ message:receive│              │            │
  │               │                  ├───────────────────────────────>│            │
  │               │                  │                │              │            │
  │               │                  │                │ on:          │            │
  │               │                  │                │ message:     │            │
  │               │                  │                │ receive      │            │
  │               │                  │                │              ├───────────>│
  │               │                  │                │              │ Display    │
  │               │                  │                │              │ message    │
  │               │                  │                │              │            │
  │               │                  │ create         │              │            │
  │               │                  │ notification   │              │            │
  │               │                  │ (if offline)   │              │            │
  │               │                  ├───────────────>│              │            │
  │               │                  │                │              │            │
  │               │ message:sent     │                │              │            │
  │               │ (confirmation)   │                │              │            │
  │               │<─────────────────┤                │              │            │
  │               │                  │                │              │            │
```

---

### Activity Diagram: Enroll in Course Workflow

```
                             ┌─────────────────────┐
                             │   Student Logged    │
                             │        In           │
                             └──────────┬──────────┘
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │  Browse Courses     │
                             │      Page           │
                             └──────────┬──────────┘
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │  Select Course      │
                             └──────────┬──────────┘
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │  View Course        │
                             │     Details         │
                             └──────────┬──────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │   Click "Enroll"        │
                          │      Button             │
                          └──────────┬──────────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────────┐
                   │  Check if already enrolled?          │
                   └──────────┬───────────────┬───────────┘
                              │               │
                        Yes   │               │  No
                              │               │
                              ▼               ▼
                   ┌──────────────────┐  ┌──────────────────────┐
                   │  Show Message:   │  │ Add student._id to   │
                   │ "Already         │  │ course.students[]    │
                   │  Enrolled"       │  └──────────┬───────────┘
                   └──────────────────┘             │
                              │                     ▼
                              │          ┌──────────────────────┐
                              │          │  Save to Database    │
                              │          └──────────┬───────────┘
                              │                     │
                              │                     ▼
                              │          ┌──────────────────────┐
                              │          │ Create Notification  │
                              │          │ for Instructor       │
                              │          └──────────┬───────────┘
                              │                     │
                              │                     ▼
                              │          ┌──────────────────────┐
                              │          │ Send Welcome Email   │
                              │          │ with Course Info     │
                              │          └──────────┬───────────┘
                              │                     │
                              │                     ▼
                              │          ┌──────────────────────┐
                              │          │  Show Success        │
                              │          │  Message             │
                              │          └──────────┬───────────┘
                              │                     │
                              └─────────────────────┘
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │  Redirect to        │
                             │  Course Dashboard   │
                             └─────────────────────┘
                                        │
                                        ▼
                             ┌─────────────────────┐
                             │  Show Course        │
                             │  Materials,         │
                             │  Assignments,       │
                             │  Announcements      │
                             └─────────────────────┘
                                        │
                                        ▼
                                   [END]
```

---

## Summary

This document provides comprehensive visualization of:

1. **Database Schema** - Complete table structure with all fields, types, constraints, primary keys, and foreign keys for all 11 collections
2. **Data Flow Diagrams** - Level 0 (Context), Level 1 (Main Processes), and Level 2 (Detailed Processes) showing data movement through the system
3. **UML Diagrams** - Use Case diagram and Class diagram (Domain Model) showing system actors, use cases, and object relationships
4. **Interaction Diagrams** - Sequence diagrams for key workflows (Registration/Login, Post Creation, Real-time Messaging) and Activity diagram for course enrollment

These diagrams provide a complete technical reference for understanding UniConnect's database structure, system interactions, and workflow processes.
