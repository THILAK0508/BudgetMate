@echo off
chcp 65001 >nul
echo 🚀 Starting Budget-Mate API Tests for Windows...
echo ================================================

set BASE_URL=http://localhost:5000
set AUTH_TOKEN=

echo.
echo 🔍 Testing Health Check...
curl -s "%BASE_URL%/api/health"
if %errorlevel% equ 0 (
    echo ✅ Health check passed
) else (
    echo ❌ Health check failed
)

echo.
echo 👤 Testing User Signup...
curl -s -X POST "%BASE_URL%/api/auth/signup" -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
if %errorlevel% equ 0 (
    echo ✅ User signup successful
) else (
    echo ❌ User signup failed
)

echo.
echo 🔐 Testing User Login...
for /f "tokens=*" %%i in ('curl -s -X POST "%BASE_URL%/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"') do set LOGIN_RESPONSE=%%i
echo %LOGIN_RESPONSE%

echo.
echo 💰 Testing Budget Creation...
if defined AUTH_TOKEN (
    curl -s -X POST "%BASE_URL%/api/budgets" -H "Content-Type: application/json" -H "Authorization: Bearer %AUTH_TOKEN%" -d "{\"title\":\"Shopping Budget\",\"amount\":1000,\"category\":\"Shopping\",\"icon\":\"🛍️\",\"color\":\"pink\"}"
    if %errorlevel% equ 0 (
        echo ✅ Budget creation successful
    ) else (
        echo ❌ Budget creation failed
    )
) else (
    echo ⚠️ Skipping budget creation - no auth token
)

echo.
echo 💸 Testing Expense Creation...
if defined AUTH_TOKEN (
    curl -s -X POST "%BASE_URL%/api/expenses" -H "Content-Type: application/json" -H "Authorization: Bearer %AUTH_TOKEN%" -d "{\"name\":\"Grocery Shopping\",\"amount\":150,\"category\":\"Food\",\"date\":\"2024-01-15\",\"receipt\":true,\"description\":\"Weekly groceries from supermarket\"}"
    if %errorlevel% equ 0 (
        echo ✅ Expense creation successful
    ) else (
        echo ❌ Expense creation failed
    )
) else (
    echo ⚠️ Skipping expense creation - no auth token
)

echo.
echo 📊 Testing Get All Budgets...
if defined AUTH_TOKEN (
    curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/api/budgets"
    if %errorlevel% equ 0 (
        echo ✅ Get all budgets successful
    ) else (
        echo ❌ Get all budgets failed
    )
) else (
    echo ⚠️ Skipping get budgets - no auth token
)

echo.
echo 📈 Testing Dashboard Overview...
if defined AUTH_TOKEN (
    curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/api/dashboard/overview"
    if %errorlevel% equ 0 (
        echo ✅ Dashboard overview successful
    ) else (
        echo ❌ Dashboard overview failed
    )
) else (
    echo ⚠️ Skipping dashboard overview - no auth token
)

echo.
echo ================================================
echo 🎯 Testing Complete!
echo ================================================

if defined AUTH_TOKEN (
    echo ✅ Authentication successful
    echo ✅ API endpoints tested
    echo 🎉 Your backend is working!
) else (
    echo ❌ Authentication failed
    echo ⚠️ Check your backend and try again
)

pause 