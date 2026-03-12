@echo off
echo ========================================
echo   Desi Bazaar Development Server
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
echo (Servers will continue running in separate windows)
pause >nul











