@echo off
echo.
echo  ========================================
echo   mySWOOOP AI Marketing Studio
echo  ========================================
echo.
echo  Starting Backend on http://localhost:5000
echo  Starting Frontend on http://localhost:5173
echo.

start "mySWOOOP Backend" cmd /k "cd /d d:\Myswooopmarketing\backend && npm run dev"
timeout /t 2 /nobreak > nul
start "mySWOOOP Frontend" cmd /k "cd /d d:\Myswooopmarketing\frontend && npm run dev"

echo  Both servers are starting...
echo  Open http://localhost:5173 in your browser.
echo.
pause
