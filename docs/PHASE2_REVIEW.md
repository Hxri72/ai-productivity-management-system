# Phase 2 Review — Task Management + Dashboard

## 1. Manual Testing Checklist

### Create Task Flow
| # | Test | Expected |
|---|------|----------|
| 1 | Click "New Task", fill all fields, submit | Task appears in list, toast "Task created!", stats update |
| 2 | Create task with only title (minimum fields) | Works — other fields get defaults |
| 3 | Create task with past due date | Task appears with red "overdue" badge |
| 4 | Create task with tags "react, node, mongodb" | Tags appear as `#react #node #mongodb` |
| 5 | Create task and check Dashboard | Stats increment, task appears in Active Tasks |
| 6 | Submit form with empty title | HTML required validation blocks submit |

### Edit Task Flow
| # | Test | Expected |
|---|------|----------|
| 7 | Click edit icon, change title, save | Title updates, toast "Task updated!" |
| 8 | Edit task, change priority to Urgent | Priority badge changes to red |
| 9 | Edit task, add due date | Due date badge appears |
| 10 | Edit and cancel | No changes saved |

### Delete Task Flow
| # | Test | Expected |
|---|------|----------|
| 11 | Click delete icon | Confirmation dialog appears |
| 12 | Confirm delete | Task removed, stats update |
| 13 | Cancel delete | Task stays |

### Status Transitions
| # | Test | Expected |
|---|------|----------|
| 14 | Click status badge on "To Do" task | Changes to "In Progress" |
| 15 | Click status badge on "In Progress" task | Changes to "Completed", title gets strikethrough |
| 16 | Click status badge on "Completed" task | Changes back to "To Do" |
| 17 | Complete a task, check Dashboard stats | Completed count goes up, To Do goes down |

### Filtering & Search
| # | Test | Expected |
|---|------|----------|
| 18 | Select "Completed" status filter | Only completed tasks shown |
| 19 | Select "High" priority filter | Only high priority tasks shown |
| 20 | Combine status + priority filter | Both filters applied (AND logic) |
| 21 | Type in search box | Results filter after ~400ms debounce |
| 22 | Search for partial word | Matches title and description |
| 23 | Click "Clear" button | All filters reset, all tasks shown |
| 24 | Change sort to "Due Date (Asc)" | Tasks sorted by due date |

### Pagination
| # | Test | Expected |
|---|------|----------|
| 25 | Create 21+ tasks | Pagination controls appear |
| 26 | Click next page | Page 2 tasks shown, "2/N" displayed |
| 27 | Click previous page | Back to page 1 |
| 28 | Apply filter that reduces to 1 page | Pagination controls disappear |

### Edge Cases
| # | Test | Expected |
|---|------|----------|
| 29 | Create task with 200-char title | Works (max length) |
| 30 | Create task with 11 tags | Zod rejects — max 10 tags |
| 31 | Delete all tasks | Empty state shown: "No tasks found" |
| 32 | XSS in title: `<img onerror=alert(1)>` | Rendered as text, not executed |
| 33 | Stop backend, try creating task | Error toast, no crash |
| 34 | Rapid-click status toggle | Each click queued, no duplicates |

---

## 2. Backend Review

### Issues Found & Fixed

**FIX 1: Regex injection in search**
User searching for `test(` would crash the regex. Fixed by escaping special characters:
```js
const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
```

**FIX 2: Duplicate fetchTasks on Tasks page mount**
`Tasks.jsx` and `TaskFilters` both called `fetchTasks()` on mount. Removed from Tasks.jsx since TaskFilters handles it.

### Known Minor Issues (Deferred)
- Sort by priority is alphabetical, not by severity (cosmetic)
- `updateTask` uses `Object.assign` without field whitelisting (Zod catches it at route level)

### What's Good
- `getTaskStats` uses aggregation pipeline (efficient, runs in DB)
- `Promise.all` for parallel `find` + `countDocuments`
- `.lean()` on read queries (~5x faster for read-only)
- Activity logging on every mutation
- Compound indexes match actual query patterns
- `completedAt` auto-set/clear on status transitions
- Ownership check `{ _id: taskId, userId }` prevents cross-user access

---

## 3. Frontend Review

### What's Good
- Debounced search (400ms) prevents API spam
- Empty state for zero tasks
- Loading spinner during fetch
- Confirmation dialog before delete
- `line-clamp-2` for descriptions
- Overdue tasks highlighted with red border
- Status toggle is intuitive (click badge to cycle)
- Pagination shows "Showing X-Y of Z"
- Task form is a modal (doesn't navigate away)
- Tags handled as comma-separated string in form, array in API

### Deferred Improvements
- Priority sort mapping (numeric sort instead of alphabetic)
- Page fallback when deleting last item on a page
- Mobile responsive sidebar (collapsible)
- Toast on status change
- Keyboard shortcut to open task form

---

## 4. CRUD & State Testing Guide

| What to Test | How | What to Watch |
|-------------|-----|---------------|
| **State sync** | Create task on Tasks page, navigate to Dashboard | Stats should reflect new task immediately (same Zustand store) |
| **Filter persistence** | Apply filters, click to Dashboard, come back to Tasks | Filters remain (Zustand state persists across navigations) |
| **Debounce** | Type "test" quickly in search | Only 1 API call after 400ms pause, not 4 calls |
| **Stat recalculation** | Change task status from Todo → Completed | `stats.todo` decreases, `stats.completed` increases |
| **Concurrent updates** | Open two browser tabs, complete a task in one | Other tab won't auto-update (no WebSocket) — expected |
| **Page consistency** | Delete last task on page 2 | Minor UX issue: stays on page 2 with empty list |

---

## 5. API Test Cases (Postman/Thunder Client)

### Create Task — Full Payload
```
POST /api/v1/tasks
Authorization: Bearer <token>

{
  "title": "Build AI integration",
  "description": "Integrate OpenAI for task prioritization",
  "priority": "high",
  "category": "work",
  "tags": ["ai", "openai", "phase3"],
  "dueDate": "2026-06-10T18:00:00.000Z",
  "estimatedMinutes": 180
}

Expected: 201
```

### Create Task — Minimum Payload
```
POST /api/v1/tasks
{ "title": "Quick task" }

Expected: 201 (defaults: medium priority, personal category, todo status)
```

### Create Task — Validation Fail
```
POST /api/v1/tasks
{ "title": "", "priority": "extreme" }

Expected: 400, "Validation failed"
```

### Get Tasks — With Filters
```
GET /api/v1/tasks?status=todo&priority=high&category=work&sort=-dueDate&page=1&limit=10

Expected: 200, filtered + sorted results with meta
```

### Get Tasks — Search
```
GET /api/v1/tasks?search=openai

Expected: 200, tasks where title or description contains "openai"
```

### Update Task
```
PATCH /api/v1/tasks/:id
{ "title": "Updated title", "priority": "urgent" }

Expected: 200
```

### Update Status
```
PATCH /api/v1/tasks/:id/status
{ "status": "completed" }

Expected: 200, completedAt is set
```

### Delete Task
```
DELETE /api/v1/tasks/:id

Expected: 200
```

### Delete Non-Existent Task
```
DELETE /api/v1/tasks/000000000000000000000000

Expected: 404, "Task not found"
```

### Access Another User's Task
```
GET /api/v1/tasks/:otherUsersTaskId

Expected: 404 (not 403 — don't reveal existence)
```

### Get Stats
```
GET /api/v1/tasks/stats

Expected: 200
{ "stats": { "total": N, "todo": N, "in_progress": N, "completed": N, "archived": N } }
```

---

## 6. MongoDB Review

### Schema Design — Good Decisions
- `aiPriority` embedded in Task (not a separate collection) — correct for 1:1 relationship
- `tags` as array — efficient for small sets, supports `$in` queries
- `completedAt` separate from `updatedAt` — tracks when task was actually completed
- Activity as separate collection — correct for append-only audit log

### Indexes

| Index | Supports |
|-------|----------|
| `{ userId: 1, status: 1 }` | Filter by status |
| `{ userId: 1, dueDate: 1 }` | Sort by due date |
| `{ userId: 1, createdAt: -1 }` | Sort by newest |
| `{ userId: 1, category: 1 }` | Filter by category |
| `{ userId: 1, createdAt: -1 }` on Activity | Recent activity feed |
| `{ userId: 1, action: 1, createdAt: -1 }` on Activity | Analytics aggregation |

### Aggregation Pipeline (`getTaskStats`)
```js
[
  { $match: { userId: ObjectId("...") } },  // uses userId index
  { $group: { _id: "$status", count: { $sum: 1 } } }  // in-memory grouping
]
```
Efficient — `$match` narrows to user's tasks (uses index), then `$group` aggregates the small result set.

---

## 7. Screenshots to Capture

| # | Screenshot | For |
|---|-----------|-----|
| 1 | Tasks page with 5+ tasks (mixed priorities/statuses) | Task Management module |
| 2 | New Task form (filled) | CRUD implementation |
| 3 | Edit Task form (pre-filled) | CRUD implementation |
| 4 | Task with overdue red border | Due date handling |
| 5 | Filters applied (status=todo, priority=high) | Filter system |
| 6 | Search results | Search functionality |
| 7 | Empty state ("No tasks found") | UX handling |
| 8 | Delete confirmation dialog | CRUD implementation |
| 9 | Dashboard with live stats + active tasks | Dashboard module |
| 10 | Postman: POST /tasks (201 response) | API testing |
| 11 | Postman: GET /tasks with filters | API testing |
| 12 | Postman: GET /tasks/stats | Aggregation pipeline |
| 13 | MongoDB Compass: Tasks collection with data | Database chapter |
| 14 | MongoDB Compass: Activities collection | Activity tracking |
| 15 | Pagination controls (page 1/2) | Pagination evidence |

---

## 8. Viva Questions — Phase 2

| Question | Key Points |
|----------|-----------|
| How does your filtering system work? | Frontend sends query params → backend builds MongoDB filter object dynamically → compound indexes make it fast → results returned with pagination meta |
| Explain the aggregation pipeline for task stats | `$match` filters to user's tasks (uses userId index), `$group` groups by status and counts. Two stages, runs entirely in MongoDB |
| Why use `.lean()` on read queries? | Returns plain JS objects instead of Mongoose documents. No getters/setters/change tracking — ~5x faster for read-only |
| How do you handle search? | Regex search with `$options: "i"` for case-insensitive matching across title and description using `$or`. Special characters escaped |
| What happens when a task is marked completed? | Service detects status transition → sets `completedAt` → logs `task_completed` activity → saves. If reversed, `completedAt` is cleared |
| How does pagination work? | `skip((page-1)*limit).limit(limit)` with parallel `countDocuments` for total. Both queries run in parallel with `Promise.all` |
| Why Zustand instead of Context API? | Context re-renders all consumers on any change. Zustand allows selective subscriptions. Also works outside React (axios interceptor uses `getState()`) |
| How do you prevent cross-user access? | Every query includes `userId` from JWT: `{ _id: taskId, userId }`. Wrong user gets 404 (not 403 — don't reveal existence) |
| What is debouncing? | Delays execution until user stops typing. Typing "test" fires 1 API call after 400ms pause instead of 4 calls |
| How is activity tracking implemented? | Every mutation calls `logActivity()` → writes to Activity collection with userId, action, entity reference, metadata. Append-only audit log |

---

## 9. Concepts Demonstrated

| Concept | Where Applied |
|---------|--------------|
| Full CRUD Operations | Create, Read, Update, Delete on tasks |
| MongoDB Aggregation | `$match` + `$group` for task stats |
| Compound Indexes | `{ userId, status }`, `{ userId, dueDate }` |
| Query Building | Dynamic filter construction from query params |
| Pagination | Skip/limit pattern with total count |
| Search | Regex search across multiple fields |
| State Management | Zustand store with filters, pagination, CRUD |
| Component Composition | TaskCard, TaskList, TaskFilters, TaskForm |
| Debouncing | 400ms debounce on search input |
| Activity/Audit Logging | Every mutation logged with metadata |
| Data Validation | Zod schemas on create/update/status routes |

---

*Review completed after Phase 2 implementation. Fixes applied for regex injection and duplicate fetch.*
