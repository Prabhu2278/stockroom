@echo off
cd /d "%~dp0backend"
echo Backend is starting. Keep this window open.
python manage.py runserver
pause
