@echo off
title Catalyst Demo
echo Starting Catalyst Demo...
cd /d %~dp0

start http://localhost:4173
npx serve dist -l 4173

pause
