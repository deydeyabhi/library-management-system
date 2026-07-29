# 📚 Library Management System (MERN Stack)

A full-stack Library Management System built with **MongoDB, Express, React, and Node.js (MERN)**.

## Features

- JWT-based authentication (register/login) with two roles: `admin` and `member`
- Book catalog with search (by title, author, ISBN) and pagination
- Admins can add, edit, and delete books, and adjust total copies
- Members can borrow and return books (14-day loan period)
- Automatic overdue fine calculation (₹/$/€5 per day late, configurable)
- "My Books" page showing a member's borrow history and due dates
- Admin dashboard showing all transactions across every member

## Tech Stack

- **Frontend:** React 18, React Router 6, Axios, plain CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JSON Web Tokens (JWT), bcrypt password hashing

---

## Project Structure

```
library-management-system/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/api.js
    │   ├── components/
    │   ├── context/AuthContext.js
    │   ├── pages/
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Setup Instructions (Windows)

All commands below are written for **PowerShell** (the default terminal in Windows Terminal / VS Code).

### 1. Install prerequisites

You'll need **Node.js** and **MongoDB**. The easiest way on Windows is [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) (built into Windows 11) — but the official installers work just as well.

Install Node.js (v18+ recommended):
```powershell
winget install OpenJS.NodeJS.LTS
```
Or download the LTS installer from [nodejs.org](https://nodejs.org). Then **open a new terminal** and verify:
```powershell
node -v
npm -v
```

Install MongoDB Community Edition and the Mongo shell:
```powershell
winget install MongoDB.Server
winget install MongoDB.Shell
```
Or download the MSI from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community). During the MSI install, keep **"Install MongoDB as a Service"** checked — this makes MongoDB start automatically on boot.

Start / check the MongoDB service (run PowerShell **as Administrator** for `net start`/`net stop`):
```powershell
net start MongoDB
Get-Service MongoDB
```

> Alternative: skip installing MongoDB locally and use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster instead — just paste its connection string into `backend/.env` as `MONGO_URI`.

### 2. Place the project

Extract the project folder anywhere you like, e.g. into `C:\Coding Projects`. In PowerShell:
```powershell
cd "C:\Coding Projects\library-management-system"
```

### 3. Backend setup

```powershell
cd backend
copy .env.example .env
```

Open `.env` and set a real secret (any long random string works):
```
MONGO_URI=mongodb://127.0.0.1:27017/library_management
JWT_SECRET=change_this_to_something_random_and_long
PORT=5000
```

Install dependencies and start the server:
```powershell
npm install
npm run dev
```
You should see:
```
MongoDB Connected: 127.0.0.1
Server running on port 5000
```

(`npm run dev` uses `nodemon` for auto-reload — it's installed locally as a dev dependency, so this works out of the box. You can also use `npm start` for a plain `node server.js` run.)

### 4. Frontend setup

Open a **new terminal tab/window** (keep the backend running in the first one):

```powershell
cd "C:\Coding Projects\library-management-system\frontend"
npm install
npm start
```

This opens the app automatically at **http://localhost:3000**. The backend API runs at **http://localhost:5000/api** — the frontend is already configured to talk to it (see `src/api/api.js`). If you ever change the backend port, create a `frontend\.env` file with:
```
REACT_APP_API_URL=http://localhost:YOUR_PORT/api
```

### 5. Try it out

1. Go to http://localhost:3000/register and create an account.
2. By default new accounts are `member` role. To create an **admin** account, register normally, then either:
   - Register via the API directly with `"role": "admin"` in the JSON body (e.g. using PowerShell's `Invoke-RestMethod` or Postman) against `POST http://localhost:5000/api/auth/register`, or
   - Manually edit the user's `role` field to `"admin"` in MongoDB (e.g. using `mongosh` or MongoDB Compass).
3. Log in as admin → go to **Manage Books** → add a few books.
4. Log in as a member → browse books → click **Borrow** → check **My Books** to see due dates and return books.

---

## Useful commands

| Task | Command (PowerShell) |
|---|---|
| Start MongoDB service | `net start MongoDB` (as Administrator) |
| Stop MongoDB service | `net stop MongoDB` (as Administrator) |
| Check MongoDB service | `Get-Service MongoDB` |
| Open Mongo shell | `mongosh` |
| Backend dev server | `cd backend; npm run dev` |
| Frontend dev server | `cd frontend; npm start` |

> Note: PowerShell chains commands with `;`, not `&&`.

## Notes & possible extensions

- Fine amount and loan period are configured as constants at the top of `backend/controllers/transactionController.js` (`FINE_PER_DAY`, `BORROW_DAYS`).
- This is a learning/demo-grade project: for production use, add rate limiting, input validation (e.g. Joi/Zod), refresh tokens, and HTTPS.
- To deploy: host the backend (Render/Railway/EC2), use MongoDB Atlas for the database, and deploy the frontend build (`npm run build`) to Vercel/Netlify, pointing `REACT_APP_API_URL` at your deployed backend.
