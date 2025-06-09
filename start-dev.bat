@echo off
echo Starting CareVault Development Servers...
echo.

echo Starting API Server (Python/FastAPI) on port 8000...
start "CareVault API" cmd /k "cd packages/api && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Web Server (Next.js) on port 3000...
start "CareVault Web" cmd /k "cd packages/frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 🌐 Web App: http://localhost:3000
echo 🚀 API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause 