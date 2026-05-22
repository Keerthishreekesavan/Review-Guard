# AI-Powered Review Moderation Platform

A full-stack web application where users submit product reviews that are automatically analyzed for **toxicity** and **duplicate content** using AI, then sent to moderators for final approval. Real-time status updates are delivered via WebSockets.

---
## 🌐 Live Demo
[Click here to try ReviewGuard](https://review-guard-8dcn.onrender.com/)

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (7-day expiry) + bcrypt |
| Real-time | Socket.io |
| Charts | Recharts |

---

## 📁 Folder Structure

```
Review Guard/
├── backend/
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── reviewController.js
│   │   ├── moderationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roleCheck.js          # Role-based access
│   │   └── rateLimiter.js        # Rate limiting
│   ├── models/
│   │   ├── User.js
│   │   ├── Review.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reviews.js
│   │   ├── moderation.js
│   │   └── admin.js
│   ├── scripts/seed.js           # Database seeder
│   ├── utils/
│   │   ├── toxicity.js           # Mock AI toxicity detector
│   │   └── tfidf.js              # TF-IDF duplicate detection
│   ├── .env                      # Environment variables
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/axios.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatusBadge.jsx
        │   ├── ProtectedRoute.jsx
        │   └── LoadingSpinner.jsx
        ├── context/AuthContext.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── UserDashboard.jsx
            ├── ModeratorPanel.jsx
            ├── Analytics.jsx
            └── AdminPanel.jsx
```

---

## ⚙️ Setup & Run

### Step 1 — Configure Environment Variables

Edit `backend/.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reviewdb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 2 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### Step 3 — Seed the Database

```bash
cd backend
npm run seed
```

This creates test accounts and sample reviews.

### Step 4 — Start the Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@reviewmod.com | Admin@123 |
| 🛡️ Moderator | moderator@reviewmod.com | Mod@1234 |
| 👤 User (John) | user@reviewmod.com | User@1234 |
| 👤 User (Alice) | alice@reviewmod.com | Alice@1234 |

---

## 🧠 AI Features

### Toxicity Detection (`backend/utils/toxicity.js`)
Uses a weighted keyword map across 5 categories:
- `profanity` — severity 0.35
- `hate_speech` — severity 0.65  
- `threats` — severity 0.90
- `spam` — severity 0.45
- `personal_attack` — severity 0.55

Also detects excessive CAPS (>60%) and exclamation marks as additional signals.
Reviews with score **> 0.3** are flagged in the moderator panel.

### Duplicate Detection (`backend/utils/tfidf.js`)
TF-IDF vectorization + cosine similarity against existing reviews for the same product.
Similarity **≥ 0.85** → marked as duplicate. Score is shown in moderator panel.

---

## 🔐 Security

| Measure | Details |
|---------|---------|
| JWT Auth | Bearer token, 7-day expiry |
| Passwords | bcrypt, 10 salt rounds |
| RBAC | Middleware per route group |
| Rate Limiting | 100 req/15min (API), 10/hr (review submit), 20/15min (auth) |
| Input Validation | express-validator on all endpoints |
| CORS | Restricted to `CLIENT_URL` origin |

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Path | Access |
|--------|------|--------|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | Auth |

### Reviews (`/api/reviews`)
| Method | Path | Access |
|--------|------|--------|
| POST | `/` | User+ |
| GET | `/my` | User+ |

### Moderation (`/api/moderation`)
| Method | Path | Access |
|--------|------|--------|
| GET | `/reviews` | Moderator+ |
| PUT | `/reviews/:id/approve` | Moderator+ |
| PUT | `/reviews/:id/reject` | Moderator+ |
| GET | `/analytics` | Moderator+ |
| GET | `/audit-logs` | Moderator+ |

### Admin (`/api/admin`)
| Method | Path | Access |
|--------|------|--------|
| GET | `/users` | Admin |
| PUT | `/users/:id/role` | Admin |
| PUT | `/users/:id/toggle-status` | Admin |

---

## ⚡ Real-Time Flow (Socket.io)

1. User connects on login → joins room `user:<id>`
2. Moderator approves/rejects a review
3. Server emits `review:status-updated` to the user's room
4. User dashboard updates status badge **instantly** without a page refresh
