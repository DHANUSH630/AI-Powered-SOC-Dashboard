# SentinelAI Launch Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting SentinelAI Full-Stack Platform " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host "`n[1/2] Launching FastAPI Backend Server on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "-m uvicorn backend.main:app --port 8000 --reload" -WorkingDirectory "d:\STUFF\AI Powered SOC Dashboard\SentinelAI"

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching React Dashboard on port 5173..." -ForegroundColor Green
Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" -ArgumentList "run dev" -WorkingDirectory "d:\STUFF\AI Powered SOC Dashboard\SentinelAI\frontend"

Write-Host "`n✓ SentinelAI is running!" -ForegroundColor Green
Write-Host "👉 Dashboard Web App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "👉 API Documentation: http://localhost:8000/docs`n" -ForegroundColor Cyan
