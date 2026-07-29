@echo off
title Ervizhi Web App
echo Starting Ervizhi Web App...
cd /d "%~dp0web"
call npm run web
pause
