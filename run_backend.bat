@echo off
title ThreatLens AI - Backend Server
echo ========================================================
echo   ThreatLens AI - Backend Server (FastAPI + ML Core)
echo ========================================================
cd /d "%~dp0backend"
if exist ".\venv\Scripts\python.exe" (
    .\venv\Scripts\python.exe run.py
) else (
    python run.py
)
pause
