# AI-Powered Productivity Management System

An intelligent task management and productivity tracking application that uses AI to prioritize tasks, provide smart recommendations, and deliver actionable productivity analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 19, Vite 8, Tailwind CSS 4, Zustand |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT (Access + Refresh Tokens with rotation) |
| AI Integration | OpenAI API (GPT-4o-mini) |
| Charts | Recharts |
| Validation | Zod |
| Logging | Winston |

## Features

- [x] User Authentication (JWT with refresh token rotation)
- [ ] Task Management (CRUD with filters, sorting, pagination)
- [ ] AI-Powered Task Prioritization
- [ ] Productivity Analytics Dashboard
- [ ] Notifications and Reminders
- [ ] Activity Tracking
- [ ] Smart Recommendations

## Project Structure

```
ai-productivity-management-system/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── ui/                # Reusable components (Loader, etc.)
│   │   │   └── layout/            # Sidebar, Navbar, AppLayout
│   │   ├── pages/                 # Login, Register, Dashboard
│   │   ├── stores/                # Zustand state management
│   │   ├── routes/                # Router + ProtectedRoute
│   │   └── hooks/                 # Custom React hooks
│   └── ...
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/                # DB, CORS, env config
│   │   ├── middleware/            # Auth, validation, rate limiter, error handler
│   │   ├── routes/                # API route definitions
│   │   ├── controllers/           # Request handling
│   │   ├── services/              # Business logic
│   │   ├── models/                # Mongoose schemas
│   │   └── utils/                 # ApiError, ApiResponse, logger, constants
│   └── server.js                  # Entry point
├── docs/                          # Project documentation
├── assets/                        # Screenshots and static assets
├── diagrams/                      # Architecture and flow diagrams
├── README.md
├── .gitignore
└── LICENSE
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Hxri72/ai-productivity-management-system.git
   cd ai-productivity-management-system
   ```

2. **Setup backend**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   ```

3. **Setup frontend**

   ```bash
   cd client
   npm install
   ```

### Running the App

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:6001
- Backend: http://localhost:5001
- Health check: http://localhost:5001/api/v1/health

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Endpoint    | Access  | Description              |
|--------|-------------|---------|--------------------------|
| POST   | `/register` | Public  | Create account           |
| POST   | `/login`    | Public  | Login, get tokens        |
| POST   | `/refresh`  | Public  | Refresh access token     |
| POST   | `/logout`   | Private | Clear refresh token      |
| GET    | `/me`       | Private | Get current user profile |
| PATCH  | `/me`       | Private | Update profile/settings  |

> More endpoints will be added as features are built.

## Architecture Highlights

- **Layered backend**: Routes → Controllers → Services → Models (separation of concerns)
- **JWT with refresh token rotation**: Access token (15min) in memory, refresh token (7 days) in httpOnly cookie
- **Global error handling**: Custom `ApiError` class + centralized error handler middleware
- **Request validation**: Zod schemas on all endpoints
- **Rate limiting**: Stricter limits on auth routes, general limits on API
- **Security**: Helmet, CORS, bcrypt (cost factor 12), no API keys on client

## Documentation

- [Project Design](docs/PROJECT_DESIGN.md) — Complete system architecture, database design, API design, and development roadmap

## License

MIT
