# AI-Powered Productivity Management System — Project Design

## Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **AI Integration:** OpenAI API
- **Charts/Analytics:** Recharts
- **State Management:** Zustand

---

## 1. COMPLETE SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                  React + Vite + Tailwind CSS                 │
│              Zustand (State) + React Router (Nav)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY / SERVER                     │
│                   Node.js + Express.js                       │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│   Auth Routes      Task Routes     Analytics Routes         │
│   /api/v1/auth     /api/v1/tasks   /api/v1/analytics        │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│      Auth MW         Validation       Aggregation            │
│      (JWT)           + Sanitize       Pipeline               │
└────────┬─────────────────┬────────────────┬─────────────────┘
         │                 │                │
         ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB (Atlas)                         │
│   Users │ Tasks │ Activities │ Notifications │ AI Logs       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (Server-side call)
                           ▼
                  ┌──────────────────┐
                  │   OpenAI API     │
                  │  (GPT-4o-mini)   │
                  └──────────────────┘
```

**Why this architecture:**

- **Monolithic backend** — appropriate for a single developer. Microservices would be overengineering here. You can still explain the monolith-vs-microservices tradeoff in your viva.
- **REST API** — simpler than GraphQL, widely understood, and maps cleanly to CRUD operations on tasks.
- **Server-side AI calls** — the OpenAI API key must never reach the browser. The backend acts as a proxy, adds rate-limiting, and caches results.

### 1.2 Frontend Architecture

```
┌──────────────────────────────────────────┐
│               React App                   │
│                                          │
│  ┌──────────┐  ┌────────────────────┐    │
│  │  Pages   │  │  Zustand Stores    │    │
│  │ (Routes) │  │  ┌──────────────┐  │    │
│  │          │◄─┼──│ authStore     │  │    │
│  │ Login    │  │  │ taskStore     │  │    │
│  │ Dashboard│  │  │ analyticsStore│  │    │
│  │ Tasks    │  │  │ notifStore    │  │    │
│  │ Analytics│  │  └──────────────┘  │    │
│  │ Settings │  └────────────────────┘    │
│  └────┬─────┘                            │
│       │           ┌─────────────────┐    │
│       └──────────►│  API Service    │    │
│                   │  (axios inst.)  │────┼──► Backend
│                   └─────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Shared Components               │    │
│  │  Button, Modal, Input, Card,     │    │
│  │  Sidebar, Navbar, Chart wrappers │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**Why Zustand over Redux:** Zustand has zero boilerplate. Redux Toolkit is powerful but overkill for a project with ~4 stores. Zustand gives you the same predictable state without action creators, reducers, or providers.

### 1.3 Backend Architecture (Layered)

```
Request → Route → Middleware → Controller → Service → Model → DB
                                               │
                                               ├── AI Service (OpenAI)
                                               └── Email/Notif Service
```

| Layer          | Responsibility                              | Why separate?                                      |
| -------------- | ------------------------------------------- | -------------------------------------------------- |
| **Route**      | Maps URL to controller                      | Single place to see all endpoints                  |
| **Middleware**  | Auth, validation, rate-limit                | Reusable across routes                             |
| **Controller** | Parse request, call service, send response  | Keeps HTTP logic separate from business logic      |
| **Service**    | Business logic, orchestration               | Testable without HTTP, reusable                    |
| **Model**      | Schema definition, DB queries               | Single source of truth for data shape              |

**Why this layering matters (viva answer):** It follows the **Separation of Concerns** principle. If you want to swap MongoDB for PostgreSQL someday, only the Model layer changes. If you want to add a CLI interface, only the Route/Controller layer changes. The Service layer remains untouched.

### 1.4 AI Workflow Architecture

```
User creates/updates task
        │
        ▼
Controller receives request
        │
        ▼
Service saves task to DB
        │
        ▼
AI Service triggered (async)
        │
        ├── Build prompt (task details + user history + deadlines)
        ├── Call OpenAI API (GPT-4o-mini — cheap, fast)
        ├── Parse structured JSON response
        ├── Validate AI output
        └── Update task with AI suggestions
                │
                ▼
        Store AI log in DB (for analytics + debugging)
```

---

## 2. PROFESSIONAL FOLDER STRUCTURE

### 2.1 Backend

```
server/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── env.js             # Environment variable validation
│   │   └── cors.js            # CORS configuration
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT verification middleware
│   │   ├── validate.js        # Request validation (Joi/Zod)
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── errorHandler.js    # Global error handler
│   │
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── task.routes.js
│   │   ├── analytics.routes.js
│   │   ├── notification.routes.js
│   │   └── ai.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── task.controller.js
│   │   ├── analytics.controller.js
│   │   ├── notification.controller.js
│   │   └── ai.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── task.service.js
│   │   ├── analytics.service.js
│   │   ├── notification.service.js
│   │   ├── ai.service.js       # OpenAI integration
│   │   └── activity.service.js # Activity logging
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Activity.js
│   │   ├── Notification.js
│   │   └── AiLog.js
│   │
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class
│   │   ├── ApiResponse.js     # Standardized response
│   │   ├── logger.js          # Winston logger
│   │   └── constants.js       # Enums, magic strings
│   │
│   └── app.js                 # Express app setup
│
├── server.js                  # Entry point (starts server)
├── .env.example               # Template for env vars
├── package.json
└── nodemon.json
```

### 2.2 Frontend

```
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── axios.js           # Axios instance with interceptors
│   │
│   ├── components/
│   │   ├── ui/                # Reusable primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Loader.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── AppLayout.jsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskFilters.jsx
│   │   ├── analytics/
│   │   │   ├── ProductivityChart.jsx
│   │   │   ├── TaskDistribution.jsx
│   │   │   └── StreakTracker.jsx
│   │   └── ai/
│   │       ├── AiSuggestions.jsx
│   │       └── PriorityBadge.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Analytics.jsx
│   │   └── Settings.jsx
│   │
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── taskStore.js
│   │   ├── analyticsStore.js
│   │   └── notificationStore.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useDebounce.js
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── constants.js
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Tailwind directives
│
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

**Why feature-based grouping inside `components/`:** As the project grows, grouping by feature (tasks/, analytics/, ai/) is far easier to navigate than a flat folder with 30 files. The `ui/` folder holds generic, reusable primitives.

---

## 3. DATABASE DESIGN

### 3.1 Collections and Schemas

#### Users

```js
{
  _id: ObjectId,
  name: String,                    // required
  email: String,                   // required, unique, indexed
  password: String,                // bcrypt hashed
  avatar: String,                  // URL (optional)
  settings: {
    timezone: String,              // default: "Asia/Kolkata"
    workingHoursStart: Number,     // 9
    workingHoursEnd: Number,       // 18
    notificationsEnabled: Boolean  // true
  },
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks

```js
{
  _id: ObjectId,
  userId: ObjectId,                // ref: Users — indexed
  title: String,                   // required
  description: String,
  status: String,                  // enum: ["todo", "in_progress", "completed", "archived"]
  priority: String,                // enum: ["low", "medium", "high", "urgent"]
  aiPriority: {
    score: Number,                 // 1-10, AI-assigned
    reasoning: String,             // AI explanation
    suggestedDeadline: Date,
    lastCalculated: Date
  },
  category: String,                // e.g., "work", "study", "personal"
  tags: [String],
  dueDate: Date,                   // indexed
  estimatedMinutes: Number,
  actualMinutes: Number,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Activities

```js
{
  _id: ObjectId,
  userId: ObjectId,                // indexed
  action: String,                  // enum: ["task_created", "task_completed", "task_updated", "login", "ai_used"]
  entityType: String,              // "task", "user"
  entityId: ObjectId,
  metadata: Object,                // flexible — e.g., { oldStatus: "todo", newStatus: "completed" }
  createdAt: Date                  // indexed
}
```

#### Notifications

```js
{
  _id: ObjectId,
  userId: ObjectId,                // indexed
  type: String,                    // enum: ["reminder", "ai_suggestion", "deadline", "streak"]
  title: String,
  message: String,
  isRead: Boolean,                 // default: false
  relatedTask: ObjectId,           // optional ref
  createdAt: Date
}
```

#### AiLogs

```js
{
  _id: ObjectId,
  userId: ObjectId,                // indexed
  promptTokens: Number,
  completionTokens: Number,
  totalCost: Number,               // estimated cost in USD
  requestType: String,             // "prioritize", "recommend", "analyze"
  inputSummary: String,            // truncated prompt (for debugging)
  outputSummary: String,           // truncated response
  latencyMs: Number,
  createdAt: Date
}
```

### 3.2 Relationships

```
Users ──1:N──► Tasks
Users ──1:N──► Activities
Users ──1:N──► Notifications
Users ──1:N──► AiLogs
Tasks ──1:N──► Activities (via entityId)
```

**Why no separate Category or Tag collections?** For a single-user-per-session app, embedding tags as an array and category as a string is simpler and faster (no joins). MongoDB is designed for this. Only normalize if you need to manage categories as a shared resource — which you don't here.

### 3.3 Indexing Strategy

```js
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Tasks — most common queries
db.tasks.createIndex({ userId: 1, status: 1 })       // "show my active tasks"
db.tasks.createIndex({ userId: 1, dueDate: 1 })      // "upcoming deadlines"
db.tasks.createIndex({ userId: 1, createdAt: -1 })    // "recent tasks"

// Activities — for analytics aggregation
db.activities.createIndex({ userId: 1, createdAt: -1 })
db.activities.createIndex({ userId: 1, action: 1, createdAt: -1 })

// Notifications
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })

// AiLogs
db.aiLogs.createIndex({ userId: 1, createdAt: -1 })
```

**Why compound indexes?** MongoDB can use a compound index `{ userId, status }` to satisfy queries filtering on both fields without scanning the entire collection. Every query in this app filters by `userId` first, so it's always the prefix.

---

## 4. AUTHENTICATION FLOW

### 4.1 JWT + Refresh Token Flow

```
                    REGISTRATION / LOGIN
                    ═══════════════════
User ──(email, password)──► Server
                              │
                   ┌──────────┴──────────┐
                   │ Validate credentials │
                   │ Hash password (reg)  │
                   │ Compare hash (login) │
                   └──────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
     Access Token (JWT)              Refresh Token (JWT)
     - userId in payload             - userId in payload
     - Expires: 15 minutes           - Expires: 7 days
     - Sent in response body         - Stored in httpOnly cookie
              │                               │
              ▼                               ▼
     Client stores in                 Browser stores
     Zustand (memory only)            automatically (cookie)
```

**Why 15-minute access tokens:** Short-lived tokens limit damage if stolen. The refresh token (in an httpOnly cookie that JavaScript can't read) silently renews the access token.

### 4.2 Token Refresh Flow

```
Client ──(request with expired access token)──► Server
Server returns 401
              │
              ▼
Client's axios interceptor catches 401
              │
              ▼
Client ──(POST /api/v1/auth/refresh)──► Server
   (httpOnly cookie sent automatically)
              │
              ▼
Server verifies refresh token
              │
              ├── Valid → New access token + new refresh token (rotation)
              └── Invalid → 401 → Redirect to login
```

**Why refresh token rotation?** Each time a refresh token is used, a new one is issued and the old one is invalidated. If an attacker steals a refresh token, it can only be used once — and the legitimate user's next refresh will fail, alerting them.

### 4.3 Protected Route Flow (Frontend)

```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};
```

### 4.4 Auth Middleware (Backend)

```
Request ──► Extract token from Authorization header
         ──► Verify JWT signature + expiry
         ──► Attach user to req.user
         ──► Next() or 401
```

---

## 5. API DESIGN

### 5.1 Conventions

- **Base URL:** `/api/v1/`
- **Versioning:** URL-based (`/v1/`). Simple, visible, easy to explain in viva.
- **Naming:** Plural nouns for resources. Verbs only for actions that aren't CRUD.
- **Response format:** Consistent envelope:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": { ... },
  "meta": { "page": 1, "totalPages": 5, "total": 47 }
}
```

### 5.2 Endpoints

#### Auth

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| POST   | `/auth/register`  | Create account           |
| POST   | `/auth/login`     | Login, get tokens        |
| POST   | `/auth/refresh`   | Refresh access token     |
| POST   | `/auth/logout`    | Clear refresh token      |
| GET    | `/auth/me`        | Get current user profile |
| PATCH  | `/auth/me`        | Update profile/settings  |

#### Tasks

| Method | Endpoint              | Description                                  |
| ------ | --------------------- | -------------------------------------------- |
| GET    | `/tasks`              | List tasks (with filters, pagination, sort)  |
| POST   | `/tasks`              | Create task                                  |
| GET    | `/tasks/:id`          | Get single task                              |
| PATCH  | `/tasks/:id`          | Update task                                  |
| DELETE | `/tasks/:id`          | Delete task                                  |
| PATCH  | `/tasks/:id/status`   | Quick status change                          |

**Query params for GET /tasks:**
`?status=todo&priority=high&category=work&sort=-dueDate&page=1&limit=20`

#### AI

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| POST   | `/ai/prioritize`   | AI-prioritize all pending tasks  |
| POST   | `/ai/suggest`      | Get smart recommendations        |
| GET    | `/ai/logs`         | View AI usage history            |

#### Analytics

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/analytics/overview`      | Summary stats (tasks done, streak, etc.) |
| GET    | `/analytics/productivity`  | Daily/weekly productivity data         |
| GET    | `/analytics/categories`    | Task distribution by category          |
| GET    | `/analytics/trends`        | Completion trends over time            |

#### Notifications

| Method | Endpoint                       | Description      |
| ------ | ------------------------------ | ---------------- |
| GET    | `/notifications`               | List notifications |
| PATCH  | `/notifications/:id/read`      | Mark as read     |
| PATCH  | `/notifications/read-all`      | Mark all as read |

**Why PATCH instead of PUT?** PATCH means "partial update" — you're changing one or two fields, not replacing the entire resource. PUT implies sending the full object. This is a real-world distinction that's good to explain in viva.

---

## 6. AI RECOMMENDATION WORKFLOW

### 6.1 How AI Prioritization Works

```
Step 1: Collect context
   - All pending tasks (title, description, dueDate, category, estimatedMinutes)
   - User's historical completion rate
   - Current time and day of week
   - Overdue tasks count

Step 2: Build prompt
   - System prompt: "You are a productivity assistant..."
   - User data: JSON array of tasks + context
   - Output format: Strictly defined JSON

Step 3: Call OpenAI (GPT-4o-mini)
   - Temperature: 0.3 (low = more deterministic)
   - max_tokens: ~500

Step 4: Parse and validate response
   - Expect JSON array with { taskId, score, reasoning }
   - Validate all taskIds exist
   - Fallback to rule-based scoring if AI fails

Step 5: Update tasks and log
   - Batch-update aiPriority field on each task
   - Log token usage and cost to AiLogs
```

### 6.2 Prompt Engineering

```
SYSTEM PROMPT:
"You are a productivity prioritization assistant. Given a user's pending tasks
and context, assign each task a priority score from 1-10 and a brief reasoning.

Rules:
- Overdue tasks get higher scores
- Tasks due within 24 hours get boosted
- Tasks with shorter estimated times get slight preference (quick wins)
- Work tasks during work hours get slight preference
- Return ONLY valid JSON, no markdown

Output format:
[
  { "taskId": "...", "score": 8, "reasoning": "Due tomorrow, estimated 30min — good quick win" }
]"

USER PROMPT:
"Current time: {ISO timestamp}
Pending tasks: {JSON array}
User stats: { completionRate: 72%, avgTasksPerDay: 4, currentStreak: 5 }"
```

### 6.3 Token Optimization

| Strategy              | Savings               | How                                                                 |
| --------------------- | --------------------- | ------------------------------------------------------------------- |
| Use GPT-4o-mini       | ~10x cheaper than GPT-4o | Good enough for scoring tasks                                     |
| Send only necessary fields | ~40% fewer tokens | Don't send `_id`, `createdAt`, `updatedAt` — map tasks to short IDs |
| Batch prioritization  | Fewer API calls       | Score all tasks in one call, not one per task                       |
| Cache results         | No cost               | Don't re-score if tasks haven't changed (use a hash of task titles+deadlines) |
| Set max_tokens        | Predictable cost      | Cap output length                                                   |

### 6.4 Fallback (Rule-Based Scoring)

If the OpenAI API fails or is rate-limited, fall back to a deterministic algorithm:

```
score = 5 (base)
if overdue:              score += 3
if due within 24h:       score += 2
if due within 3 days:    score += 1
if priority == "urgent": score += 2
if priority == "high":   score += 1
if estimatedMinutes < 30: score += 1  // quick win bonus
clamp(score, 1, 10)
```

**Why have a fallback?** In a real system, external APIs fail. In a viva, explaining "I built a rule-based fallback so the app still works without AI" demonstrates robustness thinking.

---

## 7. PRODUCTIVITY ANALYTICS DESIGN

### 7.1 Metrics to Track

| Metric                      | Source                              | Aggregation              |
| --------------------------- | ----------------------------------- | ------------------------ |
| Tasks completed today/week/month | Tasks (completedAt)            | Count by time period     |
| Completion rate             | Tasks completed / Tasks created     | Percentage               |
| Average completion time     | actualMinutes vs estimatedMinutes   | Average                  |
| Category distribution       | Tasks grouped by category           | Count + percentage       |
| Productivity streak         | Consecutive days with >= 1 task completed | Running count       |
| Most productive day of week | completedAt day-of-week             | Count per day            |
| Overdue rate                | Tasks where dueDate < completedAt   | Percentage               |
| AI accuracy                 | Compare AI priority score with actual completion order | Correlation |

### 7.2 Dashboard Charts (Recharts)

| Chart                  | Type                      | What it shows                            |
| ---------------------- | ------------------------- | ---------------------------------------- |
| Weekly Productivity    | `AreaChart`               | Tasks completed per day for last 7 days  |
| Monthly Trend          | `LineChart`               | Tasks completed per week for last 4 weeks |
| Category Breakdown     | `PieChart` / `DonutChart` | Tasks by category                        |
| Priority Distribution  | `BarChart`                | Tasks by priority level                  |
| Estimation Accuracy    | `ScatterPlot`             | Estimated vs actual minutes              |
| Streak Calendar        | Custom heat map           | GitHub-style contribution grid           |

### 7.3 Aggregation Pipelines (MongoDB)

Example — tasks completed per day (last 7 days):

```js
db.tasks.aggregate([
  {
    $match: {
      userId: ObjectId("..."),
      status: "completed",
      completedAt: { $gte: sevenDaysAgo }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
      count: { $sum: 1 },
      totalMinutes: { $sum: "$actualMinutes" }
    }
  },
  { $sort: { _id: 1 } }
])
```

**Why aggregation pipelines?** They run inside MongoDB and return only the summarized result. The alternative — loading all tasks into Node.js and computing there — wastes memory and is slower. This is an excellent viva topic.

---

## 8. DEVELOPMENT ROADMAP

### Phase 1: Foundation (Week 1-2)

```
1. Project setup
   ├── Initialize backend with Express, connect MongoDB
   ├── Initialize frontend with Vite + React + Tailwind
   ├── Set up environment variables, folder structure
   └── Create shared constants, ApiError, ApiResponse utilities

2. Authentication
   ├── User model + registration + login
   ├── JWT access token + refresh token
   ├── Auth middleware
   ├── Frontend: Login/Register pages + Zustand authStore
   └── Protected routes
```

### Phase 2: Core Feature (Week 3-4)

```
3. Task Management (CRUD)
   ├── Task model + full CRUD routes
   ├── Filtering, sorting, pagination
   ├── Frontend: Task list, form, filters
   └── Status transitions (Kanban-style or list)

4. Activity Tracking
   ├── Activity model
   ├── Log activities on task create/update/delete
   └── Activity feed component
```

### Phase 3: AI Integration (Week 5-6)

```
5. AI Prioritization
   ├── OpenAI integration service
   ├── Prompt engineering + structured output
   ├── Fallback rule-based scorer
   ├── AiLog model
   └── Frontend: Priority badges, AI suggestion panel

6. Smart Recommendations
   ├── "What should I work on next?" feature
   ├── Based on deadline proximity + AI score + time of day
   └── Frontend: Recommendation cards on dashboard
```

### Phase 4: Analytics & Polish (Week 7-8)

```
7. Productivity Analytics
   ├── Aggregation pipeline endpoints
   ├── Frontend: Dashboard with Recharts
   └── Streak tracking

8. Notifications
   ├── Deadline reminders (check on login or via cron-like interval)
   ├── AI suggestions notifications
   └── Frontend: Notification dropdown

9. Polish
   ├── Loading states, error boundaries
   ├── Responsive design
   ├── Dark mode (Tailwind: easy)
   └── Final testing
```

### MVP Definition

Your **MVP is Phase 1 + Phase 2**: auth + task CRUD. Everything works, and you can demo. Then AI and analytics are incremental additions.

---

## 9. BEST PRACTICES

### 9.1 Error Handling

```js
// Custom Error Class
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }
}

// Usage in service:
throw new ApiError(404, "Task not found");

// Global error handler catches all:
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message,
    errors: err.errors,
    ...(isDev && { stack: err.stack })
  });
});
```

**Why:** Every error goes through one place. No scattered `try-catch` with `res.status(500)` in every controller. Clean and maintainable.

### 9.2 Validation (Zod)

Use **Zod** for request validation. It's TypeScript-first but works great in JS too, and it's simpler than Joi.

```js
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().max(50).optional(),
  dueDate: z.string().datetime().optional(),
  estimatedMinutes: z.number().positive().optional()
});

// Middleware:
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) throw new ApiError(400, "Validation failed", result.error.errors);
  req.body = result.data;  // cleaned + typed
  next();
};
```

### 9.3 Logging (Winston)

```js
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});
```

**Why Winston over console.log:** Structured logs with timestamps, log levels, and file output. In production, you'd ship these to a log aggregator. For your project, it shows you understand observability.

### 9.4 Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT stored in memory (access) and httpOnly cookie (refresh)
- [x] CORS restricted to frontend origin
- [x] Rate limiting on auth routes (e.g., 5 login attempts/minute)
- [x] Input validation on all routes
- [x] MongoDB injection prevention (Mongoose sanitizes by default)
- [x] Helmet.js for security headers
- [x] OpenAI API key only on server, never exposed

### 9.5 Code Quality

- Use **ESLint + Prettier** — auto-format on save
- Consistent naming: camelCase for variables/functions, PascalCase for components/models
- Use `async/await` everywhere, never raw `.then()` chains
- Environment variables validated at startup (fail fast if `OPENAI_API_KEY` is missing)

---

## 10. MCA MAJOR PROJECT PERSPECTIVE

### 10.1 Why This Project Is MCA-Worthy

| Feature                    | CS Concept Demonstrated                                |
| -------------------------- | ------------------------------------------------------ |
| JWT Authentication         | Cryptography, stateless auth, security                 |
| MongoDB + Mongoose         | NoSQL database design, ODM patterns                    |
| REST API Design            | Client-server architecture, HTTP protocol              |
| AI Integration (OpenAI)    | API consumption, prompt engineering, NLP application   |
| Aggregation Pipelines      | Database query optimization, data processing           |
| Zustand State Management   | State management patterns, unidirectional data flow    |
| Activity Tracking          | Event sourcing concepts, audit logging                 |
| Responsive UI              | UI/UX design, component-based architecture             |
| Token Rotation             | Security engineering, session management               |
| Fallback Systems           | Fault tolerance, graceful degradation                  |

### 10.2 Documentation to Collect While Building

Collect these **as you build**, not after:

1. **Screenshots of every screen** (login, dashboard, task list, analytics, etc.)
2. **API testing screenshots** (Postman/Thunder Client — show request + response)
3. **Database collection screenshots** (MongoDB Compass showing real data)
4. **Architecture diagrams** — save the ones from this design doc and refine them
5. **Git commit history** — shows your development timeline
6. **AI prompt/response examples** — actual OpenAI API interactions
7. **Performance metrics** — API response times, page load times
8. **Code snippets** — for key algorithms (AI scoring, aggregation, JWT flow)

### 10.3 Diagrams for Final Report

1. **System Architecture Diagram** (the one from section 1.1)
2. **ER Diagram** (entities and relationships from section 3)
3. **Use Case Diagram** (Actor: User, use cases: Login, Manage Tasks, View Analytics, Get AI Suggestions)
4. **Sequence Diagrams** (Login flow, Task creation flow, AI prioritization flow)
5. **Data Flow Diagram (DFD)** — Level 0 and Level 1
6. **Deployment Diagram** (Client → Server → Database → OpenAI)
7. **Component Diagram** (Frontend component hierarchy)

### 10.4 Likely Viva Questions and How to Answer

| Question                                  | Key Points to Cover                                                                                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Why MongoDB over SQL?                     | Schema flexibility for tasks with variable fields, embedded documents (aiPriority), natural JSON mapping with Node.js, aggregation pipelines for analytics      |
| Why JWT over sessions?                    | Stateless — no server-side session storage, horizontally scalable, works well with SPAs, explain access+refresh token pattern                                   |
| How does your AI feature work?            | Explain the full pipeline: collect tasks → build prompt → call API → parse JSON → update DB. Mention fallback scoring.                                          |
| What is prompt engineering?               | Crafting structured instructions for the LLM. Show system prompt design, output format specification, temperature tuning.                                       |
| How do you handle security?               | bcrypt hashing, httpOnly cookies, CORS, rate limiting, input validation, no API keys on client                                                                  |
| What is the MVC pattern?                  | Routes → Controllers → Services → Models. Explain separation of concerns. Your project uses a refined version (service layer between controller and model).     |
| How do aggregation pipelines work?        | Server-side data processing in MongoDB. Stages: $match → $group → $sort. More efficient than loading all data into application memory.                          |
| What would you change for production?     | Add Redis for caching, use a job queue (Bull) for background tasks, add WebSockets for real-time notifications, containerize with Docker, add CI/CD.            |
| How is this different from a basic to-do? | AI integration, analytics dashboard, activity tracking, production-grade auth, scalable architecture. It's a productivity *system*, not a task list.             |
| What challenges did you face?             | Prompt engineering iteration, token cost optimization, designing efficient aggregation queries, implementing token rotation correctly.                           |

---

*Document created as part of project planning phase. Refer to this design during implementation.*
