@echo off
echo ==============================================================
echo   Compiling SCMS (Smart Complaint Management System) - Java
echo ==============================================================

if not exist bin mkdir bin

javac -encoding UTF-8 -d bin -sourcepath src\main\java src\main\java\com\scms\Main.java

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Compiled Java classes successfully into bin/ directory.

set JAR_CMD=jar
where jar >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Java\jdk-26.0.1\bin\jar.exe" (
        set "JAR_CMD=C:\Program Files\Java\jdk-26.0.1\bin\jar.exe"
    )
)

"%JAR_CMD%" cfe scms.jar com.scms.Main -C bin . >nul 2>nul
if exist scms.jar (
    echo [SUCCESS] Packaged executable scms.jar successfully.
)
