# ⚡ TaskFlow — Full-Stack Task Management Application

A modern, high-performance end-to-end Task Management Application built with React (Vite), Tailwind CSS, Node.js/Express REST API, and MongoDB with Mongoose ODM.

---

## 🌟 Key Architecture & Features

### 1. Authentication & Security
- **Email + 6-Digit OTP Flow**:
  - `POST /api/auth/send-otp`: Generates a cryptographically secure 6-digit numeric OTP, encrypts it with `bcryptjs`, saves it with a 10-minute TTL index, and delivers it via Nodemailer.
  - **Dual Mailer Engine**:
    - **Gmail OAuth2**: Configured with `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_USER`.
    - **Traditional SMTP / Ethereal**: Seamless fallback with test preview URLs if OAuth2 credentials are not set.
  - `POST /api/auth/verify-otp`: Validates the code against the bcrypt hash, checks expiration, enforces attempt limits, finds or creates the user, and signs a JWT access token.
- **Google OAuth 2.0 Flow**:
  - `POST /api/auth/google`: Accepts Google ID token from the frontend Google Sign-In button (`@react-oauth/google`), validates server-side using `google-auth-library`, extracts user profile information, and issues JWT session tokens.
- **Robust Input Validation**:
  - Request validation using `express-validator` on all authentication and task endpoints.
- **Rate Limiting & Security Headers**:
  - `express-rate-limit` prevents brute-force abuse on OTP generation and sign-in routes.
  - `helmet` secures HTTP headers.
- **Session Management**:
  - JSON Web Tokens (JWT) passed via `Authorization: Bearer <token>` and optional HTTP-only cookies.

### 2. Task Management Data Model & Operations
- **Task Schema (`Task.js`)**:
  - `title` (String, required, max 150 chars)
  - `description` (String, max 2000 chars)
  - `status` (`'Pending'`, `'In Progress'`, `'Completed'`)
  - `priority` (`'Low'`, `'Medium'`, `'High'`)
  - `dueDate` (Date)
  - `user` (ObjectId ref to `User`, indexed)
  - `timestamps` (`createdAt`, `updatedAt`)
- **API Endpoints**:
  - `GET /api/tasks`: Fetch tasks for the authenticated user with filters (`status`, `priority`), full-text search (`search`), and sorting (`sortBy=dueDate|createdAt&order=asc|desc`).
  - `GET /api/tasks/stats/summary`: Aggregate metrics (Total, In Progress, Completed, Overdue).
  - `POST /api/tasks`: Create a new task tied to `req.user._id`.
  - `GET /api/tasks/:id`: Retrieve single task details with user ownership validation.
  - `PUT /api/tasks/:id`: Update task attributes with ownership verification.
  - `DELETE /api/tasks/:id`: Delete a task with ownership verification.

### 3. Frontend Architecture & UI/UX
- **Modern Dark Glassmorphism Design**: Curated color palette, sleek gradients, glowing borders, and Plus Jakarta Sans typography.
- **Split-Card Auth View**:
  - Step 1: Email entry -> "Send 6-Digit Code".
  - Step 2: 6-box auto-focusing, paste-supporting, backspace-navigable OTP input with a 60-second resend countdown timer.
  - Official Google Sign-In button integration.
- **Task Workspace Dashboard**:
  - **Summary Metrics Overview**: Live counts of Total, In Progress, Completed (with animated progress bar), and Overdue tasks.
  - **View Modes**: Switch between **Kanban Board** (with drag-and-drop columns) and **List View** (with inline status toggles).
  - **Search & Filters**: Instant debounced keyword search, priority filter, sort selector, and status tabs.
  - **Task Modal**: Task creation/edit modal with quick date shortcuts ("Today", "Tomorrow", "In 1 Week") and input validation.
  - **Celebration Confetti**: Triggered upon marking tasks completed.
  - **Toast Notifications**: Feedback for all user interactions.

---

## 📁 Project Structure

```text
task_management_application/
├── client/                     # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, TaskCard, TaskModal, OTPInput, ProtectedRoute, KanbanBoard, TaskListView, StatsOverview, Toast
│   │   ├── context/            # AuthContext (user, login, logout, token state)
│   │   ├── pages/              # AuthPage, DashboardPage, NotFound
│   │   ├── services/           # api.js (Axios instance with auth interceptor)
│   │   ├── App.jsx             # Main router & providers
│   │   ├── index.css           # Design tokens & glassmorphic utilities
│   │   └── main.jsx
│   ├── .env                    # Frontend environment variables
│   ├── vite.config.js          # Tailwind plugin & API proxy
│   └── package.json
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # db.js (Mongoose), mailer.js (Nodemailer + Gmail OAuth2)
│   ├── controllers/            # authController.js, taskController.js
│   ├── middleware/             # authMiddleware.js, errorHandler.js, rateLimiter.js, validator.js
│   ├── models/                 # User.js, Task.js, Otp.js
│   ├── routes/                 # authRoutes.js, taskRoutes.js
│   ├── .env                    # Backend environment variables
│   ├── .env.example            # Environment variables template
│   ├── server.js               # Express application entry point
│   └── package.json
├── package.json                # Root orchestration package
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development

# Database connection (supports both MONGO_URI and MONGODB_URI)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task_manager_db?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task_manager_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Google OAuth & Gmail OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_oauth_refresh_token
GOOGLE_USER=your_email@gmail.com

# Traditional SMTP credentials (fallback)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_smtp_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM="TaskFlow App" <noreply@taskflow.dev>
```

### Frontend (`client/.env`)
```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Start Backend Server
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd client
npm run dev
# Running on http://127.0.0.1:5173
```
