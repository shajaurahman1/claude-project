@echo off
REM Compile FairFare (Windows). Needs JDK 11 or newer.
if exist out rmdir /s /q out
dir /s /b src\*.java test\*.java > sources.txt
javac -d out @sources.txt
del sources.txt
echo Build OK. Run with: run.bat
