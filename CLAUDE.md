# CLAUDE.md — Library Management System

Working reference for Claude in this repo. See `README.md` for full setup.

## What this is

A MERN Library Management System: **MongoDB + Express + React + Node.js**. JWT auth with
`admin`/`member` roles, a book catalog, and borrow/return transactions with overdue fines.
**Most work happens in the Express backend** — treat `backend/` as the primary surface; the
React `frontend/` is a thin client over the API.

## Layout

```
backend/                 # Express API — the main working area
  config/db.js           # Mongoose connection
  controllers/           # request handlers (business logic lives here)
  middleware/            # authMiddleware.js (JWT verify + role guard)
  models/                # Mongoose schemas (User, Book, Transaction)
  routes/                # Express routers, mounted under /api
  server.js              # app entry — mounts middleware + routes
frontend/                # React 18 (CRA) client
  src/api/api.js         # Axios instance pointed at the backend
  src/context/AuthContext.js
  src/pages/  src/components/
```

## Commands (Windows / PowerShell)

- **Backend dev (auto-reload):** `cd backend; npm run dev`
- **Backend plain run:** `cd backend; npm start`
- **Frontend dev:** `cd frontend; npm start`
- **Install deps:** `npm install` (run in `backend/` and `frontend/` separately)
- **Mongo shell:** `mongosh`
- **Start/stop DB:** `net start MongoDB` / `net stop MongoDB` (Administrator)

Chain commands with `;` in PowerShell, not `&&`.

## Conventions

- **Layering:** routes → controllers → models. Routes only wire URLs to controller functions;
  put logic in controllers; keep DB shape in models. Don't inline business logic in `server.js`
  or route files.
- **Auth:** protect routes with the existing `authMiddleware`; never re-implement JWT checks
  inline. Role-restricted actions (add/edit/delete books, admin dashboard) must check for `admin`.
- **Errors:** controllers return proper HTTP status codes (`400/401/403/404/500`) with a JSON
  `{ message }` body — never leak stack traces or raw Mongoose errors to the client.
- **Async:** all Mongoose calls are `async/await`, wrapped so failures return a 500 rather than
  crashing the process. No unhandled promises.
- **Config/secrets:** read from `process.env` (via `dotenv`) — `MONGO_URI`, `JWT_SECRET`, `PORT`.
  Never hardcode secrets or commit `.env` (it's gitignored; `.env.example` is the template).
- **Tunables:** `FINE_PER_DAY` and `BORROW_DAYS` live at the top of
  `controllers/transactionController.js` — change them there, don't scatter magic numbers.
- **Passwords:** always hashed with `bcryptjs`; never store or log plaintext passwords.
- **Frontend calls:** go through `src/api/api.js`, not ad-hoc `axios`/`fetch` with hardcoded URLs.

## Working discipline

- Show a short plan before changes touching multiple files or any model/route contract.
- After backend changes, confirm the server still boots (`npm run dev`) and the affected
  endpoint responds before calling it done.
- Keep changes reviewable — commit per task, not one large diff.

## Avoid

- Business logic in route files or `server.js` instead of controllers.
- Unprotected write/admin endpoints, or role checks done client-side only.
- Hardcoded secrets, ports, or API URLs; committing `.env`.
- Raw Mongoose errors or stack traces returned to the client.
- Storing plaintext passwords or logging tokens.
