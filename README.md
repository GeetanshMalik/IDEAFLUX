# IdeaFlux 💡

A modern social media platform for sharing ideas, connecting with others, and real-time communication.

## 🌟 Features

- **User Authentication**: Email verification, Google OAuth, JWT tokens
- **Posts**: Create, read, update, delete posts with images and tags
- **Real-time Chat**: Instant messaging with socket.io
- **Notifications**: Real-time notifications for likes, comments, and follows
- **Comments**: Add, like, and delete comments on posts
- **Trending**: Posts sorted by engagement (likes)
- **AI Assistant**: Powered by GROQ API for intelligent responses
- **User Profiles**: Follow/unfollow users, view profiles
- **Search**: Search posts and users
- **Dark Theme**: Beautiful dark UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Redux** - State management
- **Material-UI** - Component library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Socket.io** - Real-time events
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account (for email verification)
- GROQ API key (for AI assistant)
- Google OAuth credentials

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ideaflux.git
cd ideaflux
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
CONNECTION_URL=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

## 🏃 Running the Application

### Start Backend
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

### Start Frontend (in another terminal)
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication
- `POST /user/signin` - Sign in with email and password
- `POST /user/signup` - Create new account
- `POST /user/verify-email` - Verify email with OTP
- `POST /user/resend-otp` - Resend verification OTP
- `POST /user/google` - Google OAuth sign in

### Posts
- `GET /posts` - Get all posts (with pagination and sorting)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `PATCH /posts/:id/likePost` - Like a post
- `POST /posts/:id/commentPost` - Add comment
- `PATCH /posts/:id/comments/:commentId/like` - Like comment
- `DELETE /posts/:id/comments/:commentId` - Delete comment

### Users
- `GET /user/:id` - Get user profile
- `PATCH /user/:id` - Update user profile
- `PATCH /user/:id/follow` - Follow user
- `PATCH /user/:id/unfollow` - Unfollow user
- `GET /user/notifications` - Get notifications
- `PATCH /user/notifications/read` - Mark all as read

## 🔐 Environment Variables

### Server (.env)
```
CONNECTION_URL - MongoDB connection string
PORT - Server port (default: 5000)
NODE_ENV - Environment (development/production)
JWT_SECRET - JWT secret key
CLIENT_URL - Frontend URL
SOCKET_CORS_ORIGIN - CORS origin for socket.io
EMAIL_USER - Gmail address for sending emails
EMAIL_PASS - Gmail app password
```

### Client (.env)
```
REACT_APP_API_URL - Backend API URL
REACT_APP_SOCKET_URL - Socket.io server URL
REACT_APP_GOOGLE_CLIENT_ID - Google OAuth client ID
REACT_APP_GROQ_API_KEY - GROQ API key
```

## 📧 Email Verification Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password for IdeaFlux
3. Add the 16-character app password to `server/.env` as `EMAIL_PASS`

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed instructions.

## 🧪 Testing

### Test Email Configuration
```bash
cd server
node test-email.js
```

### Test API Endpoints
```bash
# Check email configuration
curl http://localhost:5000/check-email-config

# Send test email
curl -X POST http://localhost:5000/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📁 Project Structure

```
ideaflux/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── actions/       # Redux actions
│   │   ├── api/           # API calls
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── reducers/      # Redux reducers
│   │   ├── theme/         # Theme configuration
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                # Express backend
│   ├── controller/        # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── model/            # MongoDB models
│   ├── route/            # API routes
│   ├── utils/            # Utility functions
│   ├── index.js
│   └── package.json
├── .gitignore
├── README.md
└── EMAIL_SETUP.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- Email verification requires Gmail App Password configuration
- Real-time notifications require socket.io connection
- Some features require authentication

## 🚀 Future Enhancements

- [ ] Post editing capability
- [ ] User recommendations
- [ ] Advanced search filters
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Video support
- [ ] Live streaming
- [ ] Monetization features

## 📞 Support

For support, email ideaflux.auth@gmail.com or open an issue on GitHub.

## 👨‍💻 Author

**Your Name**
- GitHub: [GeetanshMalik](https://github.com/GeetanshMalik)
- Email: geetanshmalik337@gmail.com

---

Made with ❤️ by IdeaFlux Team
