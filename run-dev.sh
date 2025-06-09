#!/bin/bash

echo "🚀 Starting CareVault Development Servers..."

# Function to cleanup on exit
cleanup() {
    echo "\n🛑 Shutting down servers..."
    pkill -f "next dev"
    pkill -f "uvicorn"
    exit 0
}

# Trap CTRL+C
trap cleanup INT

# Start API server
echo "📡 Starting API server on http://localhost:8000..."
cd packages/api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

# Give API a moment to start
sleep 2

# Start web server
echo "🌐 Starting web server on http://localhost:3000..."
cd ../web
npm run dev &
WEB_PID=$!

echo "✅ Both servers are starting..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop all servers"

# Wait for both processes
wait $API_PID $WEB_PID