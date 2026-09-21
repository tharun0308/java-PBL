@echo off
echo ==============================================================
echo   Starting SCMS (Smart Complaint Management System) - Java
echo ==============================================================

call build.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed, aborting launch.
    exit /b %ERRORLEVEL%
)

echo.
echo Launching SCMS Server on http://localhost:8080 ...
java -cp bin com.scms.Main
