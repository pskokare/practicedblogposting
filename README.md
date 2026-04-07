# Blog Admin Backend API

A comprehensive backend API for managing blogs with scheduling functionality. Built with Node.js, Express, and MongoDB.

## Features

- **Blog Management**: Create, read, update, and delete blogs
- **Scheduling**: Schedule blogs to be published automatically at specific dates/times
- **SEO Support**: Meta titles, descriptions, canonical URLs, and slug-based URLs
- **Image Upload**: Cover image upload with validation
- **Rich Content**: Support for H1-H3 headings, paragraphs, links, images, and tables
- **Admin Authentication**: JWT-based authentication for admin panel
- **Public API**: Separate endpoints for frontend to fetch only published blogs
- **Auto-Publishing**: Scheduled blogs automatically publish when their time comes

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **node-cron** - Task scheduling
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/blog-admin
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

6. Start the server:
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

## API Endpoints

### Admin Authentication

#### Login
```
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Get Profile
```
GET /api/admin/profile
Authorization: Bearer <token>
```

### Blog Management (Admin Only)

All blog endpoints require authentication with JWT token.

#### Create Blog
```
POST /api/blogs
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: string (required)
- category: string (required)
- tags: string[] (optional)
- metaTitle: string (optional)
- metaDescription: string (optional)
- content: string (required)
- status: 'draft' | 'published' | 'scheduled' (default: 'draft')
- scheduledFor: string (ISO date, required if status is 'scheduled')
- excerpt: string (optional)
- createdBy: string (default: 'admin')
- updatedBy: string (default: 'admin')
- coverImage: file (required)
```

#### Get All Blogs
```
GET /api/blogs
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: 'draft' | 'published' | 'scheduled'
- category: string
- search: string
```

#### Get Blog by ID
```
GET /api/blogs/:id
Authorization: Bearer <token>
```

#### Get Blog by Slug
```
GET /api/blogs/slug/:slug
Authorization: Bearer <token>
```

#### Update Blog
```
PUT /api/blogs/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Same fields as create, all optional
```

#### Delete Blog
```
DELETE /api/blogs/:id
Authorization: Bearer <token>
```

#### Get Blog Statistics
```
GET /api/blogs/stats
Authorization: Bearer <token>
```

### Public API (No Authentication Required)

#### Get Published Blogs
```
GET /api/public/blogs

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- category: string
- tag: string
- search: string
```

#### Get Published Blog by Slug
```
GET /api/public/blogs/:slug
```

#### Get Related Blogs
```
GET /api/public/blogs/:slug/related
```

#### Get Categories
```
GET /api/public/categories
```

#### Get Tags
```
GET /api/public/tags
```

## Blog Schema

```javascript
{
  slug: String (unique, required),
  title: String (required),
  category: String (required),
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  canonicalUrl: String,
  coverImage: String (required),
  content: String (required),
  status: 'draft' | 'published' | 'scheduled',
  publishedAt: Date,
  scheduledFor: Date,
  excerpt: String,
  readTime: Number,
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  updatedBy: String,
  views: Number,
  likes: Number
}
```

## Publishing Logic

- **Publish Now**: Sets status to 'published' and publishedAt to current time
- **Schedule for Later**: Sets status to 'scheduled' and scheduledFor to specified date/time
- **Save as Draft**: Sets status to 'draft' (default)

### Auto-Publishing

The system includes a scheduler that runs every minute to check for scheduled blogs whose publish time has arrived. When found, it automatically:
1. Changes status from 'scheduled' to 'published'
2. Sets publishedAt to current time
3. Clears scheduledFor field

## Content Editor Support

The content field supports:
- H1, H2, H3 headings
- Paragraphs
- Links
- Images
- Tables
- Responsive formatting

## SEO Features

- **Slug-based URLs**: Clean URLs like `/blog/knee-replacement-surgery`
- **Meta Tags**: Support for meta title and description
- **Canonical URLs**: Auto-generated from slug
- **Proper Heading Structure**: H1-H3 heading support
- **Structured Data**: Well-organized blog schema

## File Upload

- **Supported Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 10MB (configurable)
- **Storage**: Local uploads directory
- **Access**: Files served at `/uploads/filename`

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin policy
- **JWT Authentication**: Secure admin access
- **File Validation**: Image-only uploads with size limits

## Error Handling

All endpoints return consistent error responses:
```javascript
{
  success: false,
  message: "Error description",
  error: "Detailed error message (development only)"
}
```

## Development

### Project Structure
```
backend/
├── controllers/          # Route controllers
│   ├── adminController.js
│   ├── blogController.js
│   └── publicController.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── upload.js
├── models/              # MongoDB models
│   └── Blog.js
├── routes/              # API routes
│   ├── adminRoutes.js
│   ├── blogRoutes.js
│   └── publicRoutes.js
├── utils/               # Utility functions
│   └── scheduler.js
├── uploads/             # Uploaded images
├── .env.example         # Environment template
├── package.json         # Dependencies
├── server.js            # Main server file
└── README.md           # This file
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/blog-admin |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| JWT_SECRET | JWT signing secret | Required |
| MAX_FILE_SIZE | Max upload size in bytes | 10485760 |
| UPLOAD_PATH | Upload directory | ./uploads |
| ADMIN_USERNAME | Admin username | admin |
| ADMIN_PASSWORD | Admin password | admin123 |

## Deployment

1. Set NODE_ENV to production
2. Configure MongoDB with production connection string
3. Use a secure JWT_SECRET
4. Set proper CORS origins
5. Consider using cloud storage for images in production
6. Set up proper logging and monitoring

## License

ISC
