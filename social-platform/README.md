# DevConnect 🚀

A full-stack social media platform for developers built with the MERN stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, React Router DOM v6 |
| Backend | Node.js, Express.js (MVC architecture) |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| HTTP Client | Axios with request/response interceptors |

---

## Features

- **Authentication** — Register, Login, Logout, Protected routes
- **JWT Token** — Stored in `localStorage`, auto-attached via Axios interceptor
- **User Profiles** — Username, bio, profile image, edit profile
- **Posts** — Create, read, edit (own), delete (own) with image & tags
- **Comments** — Add and delete your own comments
- **Likes** — Like/unlike posts with optimistic UI updates
- **Follow System** — Follow/unfollow users, followers/following counts
- **Feed** — Global feed + Following-only feed with pagination
- **Search** — Search developers by username (debounced)
- **Suggestions** — Discover people to follow
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## Project Structure

```
devconnect/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── userController.js      # profile, follow, unfollow, search
│   │   ├── postController.js      # CRUD + likes + feed
│   │   └── commentController.js   # add, get, delete comments
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   └── errorHandler.js        # Centralized error handler + 404
│   ├── models/
│   │   ├── User.js                # User schema (bcrypt pre-save hook)
│   │   ├── Post.js                # Post schema with likes array
│   │   └── Comment.js             # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── postRoutes.js          # Also handles comment sub-routes
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js           # Axios instance + JWT interceptors
    │   │   ├── auth.js            # Auth API calls
    │   │   ├── posts.js           # Post/comment API calls
    │   │   └── users.js           # User API calls
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Avatar.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Layout.jsx
    │   │   ├── posts/
    │   │   │   ├── PostCard.jsx
    │   │   │   └── CreatePost.jsx
    │   │   ├── comments/
    │   │   │   └── CommentSection.jsx
    │   │   └── profile/
    │   │       └── Suggestions.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state + token management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx           # Global + Following feed
    │   │   ├── Profile.jsx        # User profile + edit
    │   │   ├── Explore.jsx
    │   │   ├── Settings.jsx
    │   │   └── NotFound.jsx
    │   ├── App.jsx                # Router setup
    │   ├── main.jsx
    │   └── index.css              # Tailwind + custom styles
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Installation

### Prerequisites
- Node.js >= 18
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/devconnect.git
cd devconnect
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Set up the frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**
The API runs at **http://localhost:5000**

---

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/:username` | Public | Get user profile + posts |
| PUT | `/api/users/profile` | Private | Update own profile |
| POST | `/api/users/:id/follow` | Private | Follow a user |
| POST | `/api/users/:id/unfollow` | Private | Unfollow a user |
| GET | `/api/users/search?q=` | Private | Search users |
| GET | `/api/users/suggestions` | Private | Suggested users to follow |

### Posts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/posts?page=1` | Private | All posts (paginated) |
| GET | `/api/posts/feed?page=1` | Private | Following feed |
| POST | `/api/posts` | Private | Create a post |
| GET | `/api/posts/:id` | Private | Single post |
| PUT | `/api/posts/:id` | Private (owner) | Edit post |
| DELETE | `/api/posts/:id` | Private (owner) | Delete post |
| POST | `/api/posts/:id/like` | Private | Toggle like |

### Comments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/posts/:postId/comments` | Private | Add comment |
| GET | `/api/posts/:postId/comments` | Private | Get all comments |
| DELETE | `/api/posts/comments/:id` | Private (owner) | Delete comment |

---

## How JWT Token Works

1. **Login/Register** → Server returns a JWT token
2. **Frontend stores** token in `localStorage` as `devconnect_token`
3. **Axios interceptor** automatically attaches `Authorization: Bearer <token>` to every request
4. **On app load**, the token is verified via `GET /api/auth/me`
5. **On 401 response**, user is auto-logged out and redirected to `/login`
6. **Logout** clears token from `localStorage` and React state

---

## MongoDB Schemas

### User
```js
{ username, email, password (hashed), bio, profileImage, followers[], following[] }
```

### Post
```js
{ author (ref User), content, image, likes[], tags[] }
```

### Comment
```js
{ post (ref Post), author (ref User), content }
```

---

## License


