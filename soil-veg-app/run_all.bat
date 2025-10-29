@echo off
REM ===============================
REM Run FastAPI backend and React frontend
REM ===============================

REM Activate Python virtual environment for backend
cd backend
call venv\Scripts\activate

REM Start FastAPI backend in a new window
start cmd /k "uvicorn main:app --reload"

REM Wait a few seconds to ensure backend starts
timeout /t 5 /nobreak

REM Start React frontend
cd ..\frontend
start cmd /k "npm start"

REM Done
echo All processes started!
pause
