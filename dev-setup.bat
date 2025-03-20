@echo off
setlocal enabledelayedexpansion

:: SRACOM_COMPTA_MANAGEMENT Development Setup Script for Windows
:: This script helps set up and run the application for local development

echo === SRACOM_COMPTA_MANAGEMENT Development Setup ===
echo This script will help you set up and run the application locally.

:: Check if .env file exists in server directory
if not exist ".\server\.env" (
  echo Creating .env file in server directory...
  (
    echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sracom_compta?schema=public"
    echo JWT_SECRET="your-super-secret-key-change-in-production"
    echo PORT=3001
  ) > .\server\.env
  echo Created .env file in server directory.
) else (
  echo .env file already exists in server directory.
)

:: Install dependencies
echo Installing server dependencies...
cd server && npm install
echo Server dependencies installed.

echo Installing client dependencies...
cd ..\client && npm install
echo Client dependencies installed.

cd ..

:: Setup database
echo Setting up database...
cd server

echo Running Prisma migrations...
call npx prisma migrate dev --name init

echo Seeding database...
call npx prisma db seed

cd ..
echo Database setup complete.

:: Start the application
echo Starting the application...

:: Start the backend in a new terminal
echo Starting the backend...
start cmd.exe /k "cd server && npm run start:dev"

:: Start the frontend in a new terminal
echo Starting the frontend...
start cmd.exe /k "cd client && npm run dev"

echo Application started.
echo Backend running at: http://localhost:3001
echo Frontend running at: http://localhost:3000

echo === Setup Complete ===
echo You can now access the application at http://localhost:3000
echo API is available at http://localhost:3001
echo.
echo Test users:
echo   Super Admin: superadmin@example.com / password123
echo   Admin: admin@example.com / password123
echo   Employee: employee@example.com / password123
echo.
echo See TESTING_GUIDE.md for more details on testing the application.

endlocal
