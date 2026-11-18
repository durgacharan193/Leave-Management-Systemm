# 🗓️ LeaveFlow — Role-Based Leave Management System

A full-stack MERN application for managing employee leave requests with role-based access control, analytics dashboard, and a premium Material UI interface.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### By Role:
| Role | Capabilities |
|------|-------------|
| **Employee** | Apply for leave (casual/sick/paid), view history, cancel pending requests |
| **Manager** | View team requests, approve/reject with comments, own leave management |
| **Admin** | Full user CRUD, role assignment, view all leaves, organization analytics |

### Technical:
- 🔐 JWT authentication with bcrypt password hashing
- 🛡️ Role-based access control (RBAC) on frontend & backend
- 📊 Interactive dashboard with Recharts (pie, bar, trends)
- 🎨 Premium dark/light theme with Material UI v5
- 📱 Fully responsive (mobile + desktop)
- 🔍 Pagination, filtering, and search
- ✅ Input validation (express-validator)
- 🪪 Secure middleware chain (helmet, rate-limit, CORS)
- 📝 Structured JSON logging

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd leave-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# In the backend directory, copy the sample env
cd backend
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
```

**Required `.env` values:**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/leave-management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates sample users:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | sarah.manager@company.com | manager123 |
| Manager | michael.manager@company.com | manager123 |
| Employee | alice@company.com | employee123 |
| Employee | bob@company.com | employee123 |
| Employee | carol@company.com | employee123 |

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
leave-management-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── leaveController.js    # CRUD + stats for leaves
│   │   └── userController.js     # Admin user management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # RBAC authorization
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validate.js           # Express-validator check
│   ├── models/
│   │   ├── User.js               # User schema + bcrypt
│   │   └── Leave.js              # Leave schema + virtuals
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── userRoutes.js
│   ├── tests/                    # Jest + Supertest
│   ├── utils/logger.js           # Structured logging
│   ├── seed.js                   # Database seeder
│   └── server.js                 # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance + interceptors
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Auth + Theme providers
│   │   ├── pages/                # Route pages
│   │   ├── theme/theme.js        # MUI custom theme
│   │   ├── App.jsx               # Router setup
│   │   └── main.jsx              # Entry point
│   └── vite.config.js
│
├── API_DOCS.md
└── README.md
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests use **mongodb-memory-server** for isolated in-memory testing — no external database needed.

---

## 🚢 Deployment

### Backend (Render / Railway)
1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`

### Frontend (Vercel / Netlify)
1. Create a new project pointing to the `frontend/` directory
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist your deployment IP (or `0.0.0.0/0` for all)
3. Copy connection string to `MONGO_URI`

---

## 💡 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Material UI 5, Recharts, React Router 6 |
| Backend | Node.js, Express 4, express-validator |
| Database | MongoDB with Mongoose 8 |
| Auth | JWT, bcryptjs |
| Build | Vite 5 |
| Testing | Jest, Supertest, mongodb-memory-server |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
