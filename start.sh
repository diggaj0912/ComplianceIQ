#!/bin/bash

# Start FastAPI Backend
echo "Starting Compliance Agent Backend..."
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start Vite Frontend
echo "Starting ComplianceIQ Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Both services are starting..."
echo "Backend API: http://localhost:8000"
echo "Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop both services."

# Wait for process to exit
trap 'kill $BACKEND_PID $FRONTEND_PID' SIGINT SIGTERM EXIT
wait
