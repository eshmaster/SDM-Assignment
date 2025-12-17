# SDM Assignment Hospitality Portal

This repository contains a full-stack hospitality management starter with a React frontend and Node.js/Express backend powered by PostgreSQL and Knex.

## Project structure

- `frontend/`: Vite + React application with Bootstrap 5 UI and routing for guests, admins, staff, and vendors.
- `backend/`: Express API with authentication, role-based access, booking logic, and database migrations/seeds.
- `.env.example` and `frontend/.env.example`: Sample environment variables for local development.

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
- Rooms: `GET /api/rooms` (searchable by dates/capacity/preferences), admin CRUD on `/api/rooms/:id`
- Bookings: Guest endpoints `/api/bookings/me`, `/api/bookings`, `/api/bookings/:id/pay`; admin `/api/bookings/:id`
- Vendors: Vendor registration `/api/vendors`, admin approvals `/api/vendors/:id/approve|reject`, vendor jobs `/api/vendors/jobs`
- Tasks: Admin `/api/tasks`, staff `/api/tasks/me`
- Service requests: guest `/api/requests/me`, `/api/requests`; staff/admin `/api/requests`, `/api/requests/:id`
- Reviews: guest `/api/reviews`, admin/staff `/api/reviews`
- Billing/reporting: `GET /api/admin/stats`, `GET /api/billing/summary`

## Hospitality workflow highlights

1. **Accounts & access** – Guests self-register, vendors register with service type/rate, and seeded staff/admin accounts authenticate; JWT-backed RBAC gates every dashboard.
2. **Room discovery & reservation** – Guests filter inventory by type, capacity, dates, and amenities before selecting a room, guest count, meal plans, extras, and special requests.
3. **Provisional invoicing** – Creating a booking immediately generates an invoice number, payment window, and pending payment record; unpaid invoices auto-expire and cancel the reservation.
4. **Confirmation & room assignment** – Successful payments confirm the booking, flip room status to occupied, and stamp the payment record.
5. **Task automation** – Confirmed bookings spawn departmental tasks (housekeeping, catering, concierge, etc.) so staff dashboards reflect prep work and custom requests.
6. **Vendor coordination** – Vendors register their service catalog/rates, await approval, receive task assignments, and complete jobs while fees accrue for settlements.
7. **Stay services & meetings** – Guests file spa/pickup/tour/concierge requests tied to bookings; service-desk staff schedule and update them while tasks track fulfillment.
8. **Reviews & reputation** – Guests can submit post-checkout reviews; admins monitor aggregate feedback inside the reporting view.
9. **Billing & partner payouts** – Payments are logged, outstanding invoices tracked, and completed vendor work aggregates owed fees for month-end settlement summaries.
10. **Admin reporting** – The dashboard surfaces occupancy, revenue, vendor spend, staffing load, open requests, and demand for each service category.

## Database schema

Entities now include users (roles: guest, admin, staff, vendor), rooms (with capacity/amenities metadata), bookings (invoice/payment fields plus extras), vendors (service type/rate/phone), tasks (department/vendor links), payments, service requests, and reviews. Indexes are present on `users.email`, `rooms.status`, `bookings` room/date range, and `tasks.staff_id`.

## Testing

- Backend: `npm test` from `backend/` runs Jest + Supertest.
- Frontend: `npm test` from `frontend/` runs Vitest + React Testing Library.

## Docker (optional)

A simple containerization flow can be added with a `Dockerfile` for the backend and `docker-compose` to orchestrate the database; adjust environment variables accordingly.
