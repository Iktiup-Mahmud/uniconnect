# Comments and File Uploads Implementation

This document describes the implementation of comment functionality and file upload features (photos/videos) using Multer and Cloudinary.

## Features Implemented

### 1. Comment Functionality
- ✅ Create comments on posts
- ✅ View comments on posts
- ✅ Update own comments
- ✅ Delete own comments (or admin)
- ✅ Like/unlike comments
- ✅ Real-time comment count updates

### 2. File Upload Functionality
- ✅ Profile picture upload
- ✅ Post media upload (images and videos)
- ✅ Multiple file upload support
- ✅ Cloudinary integration for cloud storage
- ✅ Image optimization and transformation
- ✅ Video support

## Backend Implementation

### Dependencies Added
```json
{
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.41.0",
  "@types/multer": "^1.4.11"
}
```

### New Files Created

1. **`server/src/controllers/comment.controller.ts`**
   - `getCommentsByPost` - Get all comments for a post
   - `createComment` - Create a new comment
   - `updateComment` - Update a comment
   - `deleteComment` - Delete a comment
   - `likeComment` - Like/unlike a comment

2. **`server/src/routes/comment.routes.ts`**
   - `GET /api/v1/comments/posts/:postId` - Get comments
   - `POST /api/v1/comments/posts/:postId` - Create comment
   - `PUT /api/v1/comments/:commentId` - Update comment
   - `DELETE /api/v1/comments/:commentId` - Delete comment
   - `POST /api/v1/comments/:commentId/like` - Like comment

3. **`server/src/config/cloudinary.ts`**
   - Cloudinary configuration
   - Multer middleware setup
   - Upload helpers for different file types

4. **`server/src/controllers/upload.controller.ts`**
   - `uploadProfilePictureController` - Upload profile picture
   - `uploadPostMediaController` - Upload single media file
   - `uploadMultipleMediaController` - Upload multiple files

5. **`server/src/routes/upload.routes.ts`**
   - `POST /api/v1/upload/profile` - Upload profile picture
   - `POST /api/v1/upload/media` - Upload single media file
   - `POST /api/v1/upload/media/multiple` - Upload multiple files

### Updated Files

1. **`server/src/server.ts`**
   - Added comment and upload routes

2. **`server/src/controllers/post.controller.ts`**
   - Updated `createPost` to accept `images` and `videos` arrays
   - Updated `getAllPosts` to populate comments

## Frontend Implementation

### Updated Files

1. **`client/src/lib/api.ts`**
   - Added comment API methods:
     - `getComments(postId)`
     - `createComment(postId, content)`
     - `updateComment(commentId, content)`
     - `deleteComment(commentId)`
     - `likeComment(commentId)`
   - Added upload API methods:
     - `uploadProfilePicture(file)`
     - `uploadPostMedia(file)`
     - `uploadMultipleMedia(files)`
   - Updated `createPost` to accept `images` and `videos` arrays

2. **`client/src/types/index.ts`**
   - Updated `Comment` interface to use `userId` instead of `author`

3. **`client/src/app/dashboard/page.tsx`**
   - Added file upload UI with preview
   - Added comment section component
   - Added media display in posts
   - Added comment toggle functionality

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install multer cloudinary @types/multer
```

### 2. Configure Cloudinary

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Add to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Environment Variables

Make sure your `.env` file includes:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Other existing variables...
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Comments

- **GET** `/api/v1/comments/posts/:postId` - Get all comments for a post
- **POST** `/api/v1/comments/posts/:postId` - Create a comment
  ```json
  {
    "content": "This is a comment"
  }
  ```
- **PUT** `/api/v1/comments/:commentId` - Update a comment
  ```json
  {
    "content": "Updated comment"
  }
  ```
- **DELETE** `/api/v1/comments/:commentId` - Delete a comment
- **POST** `/api/v1/comments/:commentId/like` - Like/unlike a comment

### Uploads

- **POST** `/api/v1/upload/profile` - Upload profile picture
  - Form data: `avatar` (file)
  
- **POST** `/api/v1/upload/media` - Upload single media file
  - Form data: `media` (file)
  
- **POST** `/api/v1/upload/media/multiple` - Upload multiple files
  - Form data: `media` (files array, max 10)

### Posts (Updated)

- **POST** `/api/v1/posts` - Create post with media
  ```json
  {
    "content": "Post content",
    "images": ["https://cloudinary.com/image1.jpg"],
    "videos": ["https://cloudinary.com/video1.mp4"]
  }
  ```

## File Size Limits

- Profile pictures: 2MB
- Single images: 5MB
- Videos: 50MB
- Multiple files: 50MB per file (max 10 files)

## Usage Examples

### Frontend - Upload Profile Picture

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const response = await api.uploadProfilePicture(file);
if (response.success) {
  console.log("Profile picture URL:", response.data.avatar);
}
```

### Frontend - Create Post with Media

```typescript
// Upload files first
const files = [file1, file2];
const uploadResponse = await api.uploadMultipleMedia(files);

if (uploadResponse.success) {
  // Separate images and videos
  const imageUrls = [];
  const videoUrls = [];
  
  files.forEach((file, index) => {
    if (file.type.startsWith("video/")) {
      videoUrls.push(uploadResponse.data.urls[index]);
    } else {
      imageUrls.push(uploadResponse.data.urls[index]);
    }
  });

  // Create post
  const postResponse = await api.createPost({
    content: "Check out these photos!",
    images: imageUrls,
    videos: videoUrls,
  });
}
```

### Frontend - Add Comment

```typescript
const response = await api.createComment(postId, "Great post!");
if (response.success) {
  console.log("Comment created:", response.data.comment);
}
```

## Testing

### Test Comments

```bash
# Get comments for a post
curl -X GET http://localhost:5001/api/v1/comments/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a comment
curl -X POST http://localhost:5001/api/v1/comments/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test comment"}'
```

### Test Uploads

```bash
# Upload profile picture
curl -X POST http://localhost:5001/api/v1/upload/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"

# Upload media
curl -X POST http://localhost:5001/api/v1/upload/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "media=@/path/to/file.jpg"
```

## Notes

- Cloudinary provides a free tier with 25GB storage and 25GB bandwidth per month
- Images are automatically optimized and transformed
- Videos are stored in MP4 format
- Profile pictures are cropped to 400x400px with face detection
- All uploads are stored in organized folders: `uniconnect/profiles`, `uniconnect/images`, `uniconnect/videos`

## Troubleshooting

1. **Upload fails**: Check Cloudinary credentials in `.env`
2. **File too large**: Check file size limits
3. **Invalid file type**: Ensure file is image or video
4. **CORS errors**: Verify `CLIENT_URL` in server `.env` matches frontend URL

