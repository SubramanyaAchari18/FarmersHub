#!/bin/bash

echo "========================================"
echo "  Desi Bazaar Development Server"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is running (optional check)
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH. Make sure it's installed and running."
fi

echo "[1/2] Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/2] Starting Frontend Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Servers Started Successfully!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait











