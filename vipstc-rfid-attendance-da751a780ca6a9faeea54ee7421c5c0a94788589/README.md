# VIPSTC RFID Attendance System

## Overview
This project is a full-stack RFID-based attendance management system for VIPSTC. It includes:
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Frontend:** React (Vite), MUI, React Router
- **Database:** PostgreSQL
- **Docker:** For containerized deployment

## Features
- Teacher, student, and admin authentication
- RFID-based attendance logging
- Real-time device authentication via WebSocket
- Attendance reports and Excel export
- Manual attendance override
- RESTful API endpoints for all core operations

## Folder Structure
```
apps/
  backend/
    src/
      routes/        # Express route handlers
      services/      # Business logic and Prisma queries
      prisma/        # Prisma schema and migrations
      scripts/       # Seed and admin creation scripts
  frontend/
    src/
      pages/         # React pages (Dashboard, Login, RecordPage, etc.)
      components/    # Reusable UI components
      context/       # Auth context
      services/      # API service wrappers
infra/               # Docker and deployment configs
```

## Getting Started
### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Docker (optional)

### Setup
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   cd apps/backend && npm install
   cd ../frontend && npm install
   ```
3. **Configure environment**
   - Edit `.env` in `apps/backend` with your database credentials
   - Example:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/vipstc
     JWT_SECRET=your_jwt_secret
     ```
4. **Setup database**
   ```bash
   cd apps/backend/prisma
   npx prisma migrate deploy
   npx prisma generate
   cd ../scripts
   npx dotenv -e ../.env -- node seed.js
   npx dotenv -e ../.env -- node create-admin.js <admin_password>
   ```
5. **Run backend**
   ```bash
   cd apps/backend
   npm start
   # or
   nodemon src/app.js
   ```
6. **Run frontend**
   ```bash
   cd apps/frontend
   npm run dev
   ```
   - Frontend will proxy `/api` requests to backend (see `vite.config.js`)

## API Endpoints
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token
- `POST /api/session/open` — Open session
- `PATCH /api/session/close/:id` — Close session
- `GET /api/health` — Health check
- See route files for more endpoints


## Development
- Use Postman or Swagger to test APIs
- Use Vite for hot-reloading frontend
- Use Prisma for database migrations and queries

