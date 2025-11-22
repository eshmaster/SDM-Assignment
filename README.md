# SDM Assignment Hospitality Portal

This repository contains a full-stack hospitality management starter with a React frontend and Node.js/Express backend powered by PostgreSQL and Knex.

## Project structure

- `frontend/`: Vite + React application with Bootstrap 5 UI and routing for guests, admins, staff, and vendors.
- `backend/`: Express API with authentication, role-based access, booking logic, and database migrations/seeds.
- `.env.example`: Sample environment variables for local development.

## Prerequisites

- Node.js 18+
- PostgreSQL (or compatible database) accessible via `DATABASE_URL`.

## Setup

1. Copy environment template and edit values:

```bash
cp .env.example .env
```

2. Install dependencies (internet access required):

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Run database migrations and seeds:

```bash
cd backend
npm run migrate
npm run seed
```

4. Start development servers concurrently (from repository root):

```bash
npm install --global concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

Alternatively, start services separately using `npm run dev` in each project.

## API overview

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Rooms: `GET /api/rooms`, admin CRUD on `/api/rooms/:id`
- Bookings: Guest endpoints `/api/bookings/me`, `/api/bookings`; admin `/api/bookings/:id`
- Vendors: Vendor registration `/api/vendors`, admin approvals `/api/vendors/:id/approve|reject`
- Tasks: Admin `/api/tasks`, staff `/api/tasks/me`

## Database schema

Entities include users (roles: guest, admin, staff, vendor), rooms (status: available, occupied, maintenance), bookings (status: pending, confirmed, cancelled, completed), vendors (approval_status: pending, approved, rejected), and tasks (status: pending, in_progress, done). Indexes are present on `users.email`, `rooms.status`, `bookings` room/date range, and `tasks.staff_id`.

## Testing

- Backend: `npm test` from `backend/` runs Jest + Supertest.
- Frontend: `npm test` from `frontend/` runs Vitest + React Testing Library.

## Docker (optional)

A simple containerization flow can be added with a `Dockerfile` for the backend and `docker-compose` to orchestrate the database; adjust environment variables accordingly.
