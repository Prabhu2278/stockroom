@echo off
echo ===== Installing backend (Django) =====
cd /d "%~dp0backend"
pip install -r requirements.txt
python manage.py makemigrations products
python manage.py migrate
python manage.py seed
echo.
echo ===== Installing frontend (React) =====
cd /d "%~dp0frontend"
call npm install
echo.
echo ===== DONE. Now double-click 2-RUN-backend.bat, then 3-RUN-frontend.bat =====
pause
