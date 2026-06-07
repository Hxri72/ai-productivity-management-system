# Sequence Diagrams — TaskFlow AI

## 1. User Registration & Login

```mermaid
sequenceDiagram
    actor U as User
    participant C as React Client
    participant AS as AuthStore
    participant AX as Axios
    participant S as Express Server
    participant AC as AuthController
    participant ASv as AuthService
    participant DB as MongoDB

    Note over U,DB: Registration Flow
    U->>C: Fill registration form
    C->>AS: register({name, email, password})
    AS->>AX: POST /api/v1/auth/register
    AX->>S: HTTP Request
    S->>S: rateLimiter + validate(registerSchema)
    S->>AC: register(req, res)
    AC->>ASv: registerUser({name, email, password})
    ASv->>DB: Check if email exists
    DB-->>ASv: null (not found)
    ASv->>DB: Create User (password auto-hashed)
    DB-->>ASv: User document
    ASv->>ASv: generateAccessToken() + generateRefreshToken()
    ASv->>DB: Save refreshToken to User
    ASv-->>AC: {user, accessToken, refreshToken}
    AC->>AC: Set refreshToken cookie (httpOnly, 7d)
    AC-->>S: ApiResponse(201, user + accessToken)
    S-->>AX: JSON Response
    AX-->>AS: Store accessToken + user
    AS-->>C: Update isAuthenticated = true
    C-->>U: Redirect to /dashboard

    Note over U,DB: Login Flow
    U->>C: Enter email & password
    C->>AS: login({email, password})
    AS->>AX: POST /api/v1/auth/login
    AX->>S: HTTP Request
    S->>S: rateLimiter + validate(loginSchema)
    S->>AC: login(req, res)
    AC->>ASv: loginUser({email, password})
    ASv->>DB: Find user by email (+password)
    DB-->>ASv: User document
    ASv->>ASv: comparePassword(candidatePassword)
    ASv->>ASv: generateAccessToken() + generateRefreshToken()
    ASv->>DB: Save refreshToken
    ASv-->>AC: {user, accessToken, refreshToken}
    AC->>AC: Set refreshToken cookie
    AC-->>S: ApiResponse(200, user + accessToken)
    S-->>AX: JSON Response
    AX-->>AS: Store token + user
    AS-->>C: isAuthenticated = true
    C-->>U: Redirect to /dashboard
```

## 2. Token Refresh (Automatic)

```mermaid
sequenceDiagram
    actor U as User
    participant C as React Client
    participant AX as Axios Interceptor
    participant S as Express Server
    participant AC as AuthController
    participant ASv as AuthService
    participant DB as MongoDB

    U->>C: Any action (e.g., fetch tasks)
    C->>AX: GET /api/v1/tasks
    AX->>AX: Attach Bearer token
    AX->>S: HTTP Request
    S-->>AX: 401 Unauthorized (token expired)

    Note over AX,DB: Interceptor handles refresh
    AX->>AX: Queue original request
    AX->>S: POST /api/v1/auth/refresh (cookie)
    S->>AC: refresh(req, res)
    AC->>ASv: refreshAccessToken(refreshToken)
    ASv->>DB: Find user with matching refreshToken
    DB-->>ASv: User found
    ASv->>ASv: Verify JWT + generate new token pair
    ASv->>DB: Save new refreshToken
    ASv-->>AC: {accessToken, refreshToken}
    AC->>AC: Set new cookie
    AC-->>S: ApiResponse(200, accessToken)
    S-->>AX: New accessToken

    AX->>AX: Update stored token
    AX->>S: Retry: GET /api/v1/tasks (new token)
    S-->>AX: 200 OK (tasks data)
    AX-->>C: Tasks response
    C-->>U: Display tasks
```

## 3. Create Task

```mermaid
sequenceDiagram
    actor U as User
    participant C as Tasks Page
    participant TS as TaskStore
    participant AX as Axios
    participant S as Express Server
    participant MW as Auth Middleware
    participant TC as TaskController
    participant TSv as TaskService
    participant ActSv as ActivityService
    participant DB as MongoDB

    U->>C: Click "Add Task" → fill form
    C->>TS: createTask({title, priority, category, dueDate, ...})
    TS->>AX: POST /api/v1/tasks
    AX->>S: HTTP Request (Bearer token)
    S->>MW: Verify JWT
    MW->>DB: Find user by token payload
    DB-->>MW: User found
    MW->>S: req.user = user
    S->>S: validate(createTaskSchema)
    S->>TC: createTask(req, res)
    TC->>TSv: createTask(userId, taskData)
    TSv->>DB: Task.create({userId, ...taskData})
    DB-->>TSv: New task document
    TSv->>ActSv: logActivity({action: TASK_CREATED, entityId: task._id})
    ActSv->>DB: Activity.create(...)
    TSv-->>TC: task
    TC-->>S: ApiResponse(201, task)
    S-->>AX: JSON Response
    AX-->>TS: Update tasks array
    TS->>AX: GET /api/v1/tasks/stats (refresh stats)
    AX-->>TS: Updated stats
    TS-->>C: Re-render task list + stats
    C-->>U: Show new task + toast notification
```

## 4. AI Task Prioritization

```mermaid
sequenceDiagram
    actor U as User
    participant C as AI Insights Page
    participant AIS as AiStore
    participant AX as Axios
    participant S as Express Server
    participant AIC as AiController
    participant AISv as AiService
    participant OAI as OpenAI API
    participant DB as MongoDB

    U->>C: Click "Prioritize Tasks"
    C->>AIS: prioritizeTasks()
    AIS->>AX: POST /api/v1/ai/prioritize
    AX->>S: HTTP Request
    S->>S: Auth middleware
    S->>AIC: prioritizeTasks(req, res)
    AIC->>AISv: prioritizeTasks(userId)

    AISv->>DB: Fetch pending tasks (todo + in_progress)
    DB-->>AISv: tasks[]

    alt OpenAI API Available
        AISv->>AISv: Build prompt with task details
        AISv->>OAI: chat.completions.create(gpt-4o-mini)
        OAI-->>AISv: JSON response with scores
        AISv->>DB: Create AiLog (tokens, cost, latency)
        AISv->>DB: Update each Task.aiPriority
    else API Fails / No Key
        AISv->>AISv: prioritizeWithFallback()
        Note over AISv: Rule-based scoring:<br/>+3 overdue, +2 due 24h<br/>+2 urgent, +1 high<br/>+1 quick wins
        AISv->>DB: Create AiLog (fallbackUsed: true)
        AISv->>DB: Update each Task.aiPriority
    end

    AISv-->>AIC: {tasks, fallbackUsed}
    AIC-->>S: ApiResponse(200, result)
    S-->>AX: JSON Response
    AX-->>AIS: Update prioritizedTasks + fallbackUsed
    AIS-->>C: Re-render scored tasks
    C-->>U: Display tasks sorted by AI score
```

## 5. Analytics Dashboard Loading

```mermaid
sequenceDiagram
    actor U as User
    participant C as Analytics Page
    participant ANS as AnalyticsStore
    participant AX as Axios
    participant S as Express Server
    participant ANC as AnalyticsController
    participant ANSv as AnalyticsService
    participant DB as MongoDB

    U->>C: Navigate to /analytics
    C->>ANS: fetchAll()

    par Parallel API Calls
        ANS->>AX: GET /api/v1/analytics/overview
        ANS->>AX: GET /api/v1/analytics/productivity?days=7
        ANS->>AX: GET /api/v1/analytics/categories
        ANS->>AX: GET /api/v1/analytics/priorities
        ANS->>AX: GET /api/v1/analytics/trends
        ANS->>AX: GET /api/v1/analytics/accuracy
        ANS->>AX: GET /api/v1/analytics/productive-day
    end

    AX->>S: 7 parallel requests
    S->>ANC: Route to respective handlers

    ANC->>ANSv: getOverview(userId)
    ANSv->>DB: Aggregation pipeline (status counts, streak, overdue)
    DB-->>ANSv: Aggregated data

    ANC->>ANSv: getProductivity(userId, {days: 7})
    ANSv->>DB: Match completed tasks, group by day
    DB-->>ANSv: Daily completion counts

    ANC->>ANSv: getCategoryDistribution(userId)
    ANSv->>DB: Group by category
    DB-->>ANSv: Category counts

    Note over ANC,DB: ...similar for other endpoints

    S-->>AX: 7 JSON Responses
    AX-->>ANS: Store all analytics data
    ANS-->>C: Trigger re-render
    C-->>U: Display charts (Recharts)
```

## 6. Deadline Notification Check

```mermaid
sequenceDiagram
    actor U as User
    participant C as React Client
    participant NS as NotificationStore
    participant AX as Axios
    participant S as Express Server
    participant NC as NotificationController
    participant NSv as NotificationService
    participant DB as MongoDB

    U->>C: App loads / periodic check
    C->>NS: checkDeadlines()
    NS->>AX: POST /api/v1/notifications/check-deadlines
    AX->>S: HTTP Request
    S->>NC: checkDeadlines(req, res)
    NC->>NSv: generateDeadlineReminders(userId)

    NSv->>DB: Find tasks due within 24h or overdue
    DB-->>NSv: urgentTasks[]

    loop For each urgent task
        NSv->>DB: Check if reminder exists (last 24h)
        DB-->>NSv: existing or null
        alt No recent reminder
            NSv->>DB: Create Notification (type: DEADLINE)
        end
    end

    NSv-->>NC: newNotifications[]
    NC-->>S: ApiResponse(200, notifications)
    S-->>AX: JSON Response
    AX-->>NS: Update notifications + unreadCount
    NS-->>C: Show notification badge
    C-->>U: Display unread count
```
