@echo off
echo.
echo  ========================================
echo   VibePost - AI Content Studio
echo  ========================================
echo.
echo  Starting Backend on http://localhost:5000
echo  Starting Frontend on http://localhost:5173
echo.

start "VibePost Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak > nul
start "VibePost Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Both servers are starting...
echo  Open http://localhost:5173 in your browser.
echo.
pause
