# UniConnect Development Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting UniConnect Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "📦 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue

if (-not $mongoRunning.TcpTestSucceeded) {
    Write-Host "⚠️  Warning: MongoDB might not be running on localhost:27017" -ForegroundColor Red
    Write-Host "   Please ensure MongoDB is running or update MONGODB_URI in server/.env" -ForegroundColor Yellow
    Write-Host ""
}

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Client
Write-Host "🎨 Starting Frontend Client (Port 3000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; Write-Host '🎨 Frontend Client' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✅ Development servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Yellow
