@echo off
title Complaint Registration and Tracking System - Java OOP
cls
echo ======================================================================
echo    Complaint Registration and Tracking System (Java 17 OOP)
echo ======================================================================
echo.
echo  1. Launch Web Application (Starts local server and opens browser)
echo  2. Compile and Run Native Java Console Program (Main.java)
echo  3. Recompile Java Source Files
echo  4. Exit
echo.
set /p choice="Enter option (1-4): "

if "%choice%"=="1" goto run_web
if "%choice%"=="2" goto run_java
if "%choice%"=="3" goto compile_java
if "%choice%"=="4" goto end

:run_web
echo.
echo Starting local web server...
start "" "http://localhost:3000"
node server.js
pause
goto end

:run_java
echo.
if not exist "bin\Main.class" (
    echo Compiling Java source files...
    if not exist "bin" mkdir "bin"
    javac -d bin src\*.java
)
echo Running Java Application...
echo.
java -cp bin Main
pause
goto end

:compile_java
echo.
echo Compiling all Java files in src\ to bin\...
if not exist "bin" mkdir "bin"
javac -d bin src\*.java
if %ERRORLEVEL% EQU 0 (
    echo Compilation successful!
) else (
    echo Compilation failed.
)
pause
goto end

:end
