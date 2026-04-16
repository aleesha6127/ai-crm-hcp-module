# AI CRM - Master Launcher
# This script starts both the FastAPI backend and the Vite frontend.

Write-Host "🚀 Starting AI Healthcare CRM..." -ForegroundColor Cyan

# 1. Kill any existing processes
Stop-Process -Name uvicorn, vite -ErrorAction SilentlyContinue

# 2. Start Backend in a new window
Write-Host "🛰️ Launching Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

# 3. Start Frontend in a new window
Write-Host "🎨 Launching Frontend (Port 5173)..." -ForegroundColor Green
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Both services are launching in separate windows." -ForegroundColor Cyan
Write-Host "🔗 Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "🔗 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
