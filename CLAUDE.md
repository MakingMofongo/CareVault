# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies (use pnpm)
pnpm install

# Start development servers (frontend + backend)
./run-dev.sh     # Linux/Mac
./start-dev.bat  # Windows

# Run frontend only
cd packages/frontend && pnpm dev

# Run backend only
cd packages/api && uvicorn main:app --reload
```

### Build & Production
```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Testing & Linting
```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

## Architecture Overview

CareVault is a healthcare POC monorepo with two main packages:

### Frontend (`packages/frontend/`)
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **shadcn/ui** components (Radix UI based)
- API client configured in `lib/api.ts` with Axios interceptors
- Authentication context in `contexts/AuthContext.tsx`
- Protected routes handled via middleware and auth context

### Backend (`packages/api/`)
- **FastAPI** with SQLAlchemy ORM and SQLite
- JWT authentication with role-based access (Doctor/Patient)
- Database models in `models.py`
- API routes organized by feature (auth, users, appointments, prescriptions)
- OpenAI GPT-4 integration for drug interactions (`ai.py`)
- QR code and PDF generation for prescriptions

## Key Implementation Details

### Authentication Flow
1. Frontend stores JWT token in localStorage
2. Axios interceptor adds token to all API requests
3. Backend validates JWT and extracts user role
4. Role-based endpoints check permissions via `get_current_doctor`/`get_current_patient`

### Prescription Sharing System
1. Prescriptions generate unique share tokens
2. QR codes encode shareable URLs
3. Pharmacies access via `/share/{token}` without authentication
4. Patients can revoke access by deleting share tokens

### Drug Interaction Checking
- Uses OpenAI GPT-4 via `/api/ai/check-interactions`
- Expects medication list and returns potential interactions
- Requires `OPENAI_API_KEY` environment variable

## Environment Variables

### Backend (`packages/api/.env`)
```
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./carevault.db
```

### Frontend
No specific env vars required - API URL defaults to `http://localhost:8000/api`

## Database Migrations

```bash
cd packages/api
alembic upgrade head  # Apply migrations
alembic revision --autogenerate -m "Description"  # Create new migration
```

## Common Development Tasks

### Adding a New API Endpoint
1. Add route to appropriate router file in `packages/api/routers/`
2. Update database models if needed in `models.py`
3. Create/update frontend API client methods in `packages/frontend/lib/api.ts`
4. Update TypeScript types in `packages/frontend/types/`

### Adding UI Components
1. Use shadcn/ui CLI: `npx shadcn@latest add <component>`
2. Components are added to `packages/frontend/components/ui/`
3. Follow existing pattern of client components with "use client" directive

### Modifying Database Schema
1. Update SQLAlchemy models in `packages/api/models.py`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review and apply migration: `alembic upgrade head`