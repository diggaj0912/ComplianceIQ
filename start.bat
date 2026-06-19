@echo off
echo Starting Compliance Agent Backend...
cd backend
start cmd /k "python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload"

echo Starting ComplianceIQ Frontend...
cd ../frontend
start cmd /k "npm run dev"

echo Both services are starting...
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:5173
cd ..
