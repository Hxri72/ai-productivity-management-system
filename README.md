# AI-Powered Productivity Management System

An intelligent task management and productivity tracking application that uses AI to prioritize tasks, provide smart recommendations, and deliver actionable productivity analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 19, Vite 8, Tailwind CSS 4, Zustand |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT (Access + Refresh Tokens with rotation) |
| AI Integration | OpenAI API (GPT-4o-mini) + Rule-based fallback |
| Charts | Recharts |
| Validation | Zod |
| Logging | Winston |

## Features

- [x] User Authentication (JWT with refresh token rotation)
- [x] Task Management (CRUD with filters, sorting, pagination)
- [x] Activity Tracking (auto-logged on every task mutation)
- [x] Dashboard with live stats and active tasks
- [x] AI-Powered Task Prioritization (GPT-4o-mini + rule-based fallback)
- [x] Smart Recommendations ("What should I work on next?")
- [x] AI Usage Logs (token tracking, cost estimation, call history)
- [ ] Productivity Analytics Dashboard
- [ ] Notifications and Reminders

## Project Structure

```
ai-productivity-management-system/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── ui/                # Reusable components (Loader, etc.)
│   │   │   ├── layout/            # Sidebar, Navbar, AppLayout
│   │   │   ├── tasks/             # TaskCard, TaskForm, TaskList, TaskFilters
│   │   │   └── ai/               # PriorityBadge, AiSuggestions
│   │   ├── pages/                 # Login, Register, Dashboard, Tasks, AiInsights
│   │   ├── stores/                # Zustand stores (auth, task, ai)
│   │   ├── routes/                # Router + ProtectedRoute
│   │   ├── hooks/                 # Custom React hooks
│   │   └── utils/                 # Constants, date formatting
│   └── ...
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/                # DB, CORS, env config
│   │   ├── middleware/            # Auth, validation, rate limiter, error handler
│   │   ├── routes/                # API route definitions
│   │   ├── controllers/           # Request handling
│   │   ├── services/              # Business logic, AI integration, activity logging
│   │   ├── models/                # Mongoose schemas (User, Task, Activity, AiLog)
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
- OpenAI API key (optional — fallback engine works without it)

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
   # Edit .env with your MongoDB URI, JWT secrets, and OpenAI API key
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

### Tasks (`/api/v1/tasks`)

| Method | Endpoint       | Access  | Description                                 |
|--------|----------------|---------|---------------------------------------------|
| GET    | `/`            | Private | List tasks (filters, search, sort, paginate)|
| POST   | `/`            | Private | Create task                                 |
| GET    | `/stats`       | Private | Get task counts by status (aggregation)     |
| GET    | `/:id`         | Private | Get single task                             |
| PATCH  | `/:id`         | Private | Update task                                 |
| PATCH  | `/:id/status`  | Private | Quick status change                         |
| DELETE | `/:id`         | Private | Delete task                                 |

**Query params for GET /tasks:**
```
?status=todo&priority=high&category=work&search=keyword&sort=-dueDate&page=1&limit=20
```

### AI (`/api/v1/ai`)

| Method | Endpoint      | Access  | Description                                    |
|--------|---------------|---------|------------------------------------------------|
| POST   | `/prioritize` | Private | AI-score all pending tasks (1-10 with reasoning)|
| POST   | `/suggest`    | Private | Get smart recommendation + top 3 tasks          |
| GET    | `/logs`       | Private | AI usage history (tokens, cost, latency)        |

## AI Architecture

```
User clicks "Prioritize Tasks"
        │
        ▼
Is OpenAI API key configured?
   ┌────┴────┐
   Yes       No ──► Rule-based fallback scorer
   │
   ▼
Call GPT-4o-mini (structured JSON prompt)
   ┌────┴────┐
 Success    Error ──► Rule-based fallback scorer
   │
   ▼
Parse JSON response, validate task IDs
   ┌────┴────┐
 Valid     Invalid ──► Rule-based fallback scorer
   │
   ▼
bulkWrite scores to MongoDB
   │
   ▼
Log to AiLog (tokens, cost, latency)
   │
   ▼
Return scored tasks to frontend
```

**Fallback scoring algorithm:** Base score 5, +3 if overdue, +2 if due within 24h, +1 if due within 3 days, +2 if urgent priority, +1 if high priority, +1 if quick win (≤30 min). Clamped to 1-10.

## Architecture Highlights

- **Layered backend**: Routes → Controllers → Services → Models (separation of concerns)
- **JWT with refresh token rotation**: Access token (15min) in memory, refresh token (7 days) in httpOnly cookie
- **Global error handling**: Custom `ApiError` class + centralized error handler middleware
- **Request validation**: Zod schemas on all endpoints
- **Rate limiting**: Stricter limits on auth routes, general limits on API
- **Security**: Helmet, CORS, bcrypt (cost factor 12), no API keys on client
- **MongoDB aggregation**: Task stats and AI cost summaries computed server-side
- **Compound indexes**: `{ userId, status }`, `{ userId, dueDate }`, `{ userId, createdAt }` for efficient queries
- **Activity tracking**: Every task mutation auto-logged to Activity collection for audit trail
- **Debounced search**: 400ms debounce on frontend prevents API spam
- **Axios interceptors**: Auto-attach token, silent refresh on 401 with request queuing
- **Dual AI engine**: OpenAI GPT-4o-mini with automatic rule-based fallback (graceful degradation)
- **Prompt engineering**: Structured JSON output, low temperature, compact token-optimized input
- **AI observability**: Every AI call logged with tokens, cost, latency, success/failure status
- **Bulk operations**: `bulkWrite` for batch AI score updates (1 DB call instead of N)

## Documentation

- [Project Design](docs/PROJECT_DESIGN.md) — Complete system architecture, database design, API design, and development roadmap
- [Phase 2 Review](docs/PHASE2_REVIEW.md) — Task management testing, backend/frontend review, API test cases
- [Phase 3 Review](docs/PHASE3_REVIEW.md) — AI architecture review, fallback engine analysis, prompt engineering, viva preparation

## License

MIT
