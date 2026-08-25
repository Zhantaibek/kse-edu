# Educational CRM — Architecture

## Overview

Standalone educational CRM (separate from the KSE public site; the site only links out):

- `backend/` — Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- `frontend/` — React, Vite, TypeScript, Tailwind, Zustand, React Router

## Roles (RBAC)

| Role    | Access |
|---------|--------|
| ADMIN   | Full system access |
| TEACHER | Own courses, lessons, assignments, students of own courses |
| STUDENT | Browse/enroll courses, lessons, submit assignments, own progress |

## Backend layers

```
Route → Controller → Service → Repository → Prisma → PostgreSQL
```

Cross-cutting: JWT auth, RBAC middleware, Zod validation, centralized errors, Swagger.

## Domain model

- **User** + **Profile** — accounts and public profile
- **Category** — course categories
- **Course** — owned by Teacher, belongs to Category
- **Module** → **Lesson** — curriculum tree
- **Enrollment** — student ↔ course
- **Progress** — lesson completion per enrollment
- **Assignment** / **Submission** — homework workflow
- **Payment** — mock course payments
- **Notification** — in-app alerts

## API map (prefix `/api`)

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `/login`, `/logout`, `GET /auth/me` |
| Students | `GET|POST /students`, `GET|PATCH|DELETE /students/:id` |
| Teachers | `GET /teachers`, `GET /teachers/:id` |
| Courses | `GET|POST /courses`, `GET|PATCH|DELETE /courses/:id` |
| Lessons | `GET|POST /courses/:courseId/lessons`, `PATCH|DELETE /lessons/:id` |
| Assignments | `GET|POST /assignments`, `PATCH /assignments/:id`, `POST /assignments/:id/submit` |
| Payments | `GET|POST /payments` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Analytics | `GET /analytics/dashboard`, `/students`, `/courses`, `/revenue` |

## Frontend layout

Fixed collapsible Sidebar + Header (search, notifications, theme) + Main content.
Role-based menu and protected routes.
